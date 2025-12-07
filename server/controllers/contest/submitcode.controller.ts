import Submission from "../../models/submission.model.js";
import fs from "fs";
import path from "path";
import type { Context } from "hono";
import { spawnSync } from "bun";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import Problem from "../../models/problem.model.js";

type Language = "c" | "cpp" | "java" | "python";

interface LangConfig {
    filename: string;
    workerName: string;
    hostWorkDir: string;
    containerWorkDir: string;
}

const LANGUAGE_CONFIG: Record<Language, LangConfig> = {
    c: {
        filename: "main.c",
        workerName: "judge-gcc-worker",
        hostWorkDir: "/judge/work/gcc",
        containerWorkDir: "/workspace",
    },
    cpp: {
        filename: "main.cpp",
        workerName: "judge-cpp-worker",
        hostWorkDir: "/judge/work/cpp",
        containerWorkDir: "/workspace",
    },
    java: {
        filename: "Main.java",
        workerName: "judge-java-worker",
        hostWorkDir: "/judge/work/java",
        containerWorkDir: "/workspace",
    },
    python: {
        filename: "main.py",
        workerName: "judge-python-worker",
        hostWorkDir: "/judge/work/python",
        containerWorkDir: "/workspace",
    },
};

function getJavaMainClassName(code: string): string {
    const match = code.match(/public\s+class\s+([A-Za-z_][A-Za-z0-9_]*)/);
    return match?.[1] ?? "Main";
}

function isContainerRunning(name: string) {
    const result = spawnSync({
        cmd: ["docker", "inspect", "-f", "{{.State.Running}}", name],
        stdout: "pipe",
        stderr: "pipe",
    });

    const stdout = result.stdout?.toString().trim() ?? "";
    const stderr = result.stderr?.toString().trim() ?? "";

    if (!result.success) {
        return {
            running: false,
            error: stderr || `docker inspect failed for ${name}`,
        };
    }

    return {
        running: stdout === "true",
        error: "",
    };
}

function execInWorker(worker: string, workdir: string, script: string) {
    const cmd = [
        "docker",
        "exec",
        "-e",
        `WORKDIR=${workdir}`,
        worker,
        "sh",
        "-c",
        script,
    ];

    const result = spawnSync({
        cmd,
        stdout: "pipe",
        stderr: "pipe",
    });

    return {
        success: result.success,
        stdout: result.stdout?.toString() ?? "",
        stderr: result.stderr?.toString() ?? "",
    };
}

function buildScript(
    language: Language,
    count: number,
    root: string,
    options?: { javaMainClass?: string },
) {
    const loop = (run: string) => `
BASE="${root}/$WORKDIR"
i=0
while [ "$i" -lt ${count} ]; do
  ${run} < "$BASE/in_$i.txt" > "$BASE/out_$i.txt" 2> "$BASE/err_$i.txt" || true
  i=$((i + 1))
done
`;

    switch (language) {
        case "c":
            return `
BASE="${root}/$WORKDIR"
gcc "$BASE/main.c" -O0 -o "$BASE/main" 2> "$BASE/compile_err.txt" || true
${loop("$BASE/main")}
`;
        case "cpp":
            return `
BASE="${root}/$WORKDIR"
g++ "$BASE/main.cpp" -O0 -o "$BASE/main" 2> "$BASE/compile_err.txt" || true
${loop("$BASE/main")}
`;
        case "java": {
            const mainClass = options?.javaMainClass || "Main";

            return `
BASE="${root}/$WORKDIR"
javac "$BASE/${mainClass}.java" 2> "$BASE/compile_err.txt" || true
${loop(`java -cp "$BASE" ${mainClass}`)}
`;
        }
        case "python":
            return `
BASE="${root}/$WORKDIR"
${loop('python3 "$BASE/main.py"')}
`;
    }
}

export const submitCode = async (c: Context) => {
    try {
        const body = await c.req.json();
        const { userId, language, code, problem, contestId } = body;

        console.log(userId, language, code, contestId);

        if (!language || !code) {
            return ErrorResponse(c, "Language and code are required", 400);
        }

        if (!problem) {
            return ErrorResponse(c, "Problem ID is required", 400);
        }

        if (!userId) {
            return ErrorResponse(c, "User is required for submission", 400);
        }

        if (!contestId) {
            return ErrorResponse(c, "Contest ID is required", 400);
        }

        const config = LANGUAGE_CONFIG[language as Language];
        if (!config) {
            return ErrorResponse(c, "Unsupported language", 400);
        }

        const problemDoc: any = await Problem.findById(problem)
            .populate("testcases")
            .lean();

        if (!problemDoc) {
            return ErrorResponse(c, "Problem not found", 404);
        }

        if (!problemDoc.testcases || problemDoc.testcases.length === 0) {
            return ErrorResponse(
                c,
                "No testcases configured for this problem",
                400,
            );
        }

        // ✅ Use testcase points instead of problemDoc.points
        const allTests = problemDoc.testcases.map((t: any) => ({
            testcase: t._id,
            rawInput: t.rawInput ?? t.input ?? "",
            output: t.output ?? "",
            isHidden: !!t.isHidden,
            points: typeof t.points === "number" ? t.points : 0,
            __source: "system" as const,
        }));

        fs.mkdirSync(config.hostWorkDir, { recursive: true });
        const tempDir = fs.mkdtempSync(path.join(config.hostWorkDir, "job_"));
        const workdirName = path.basename(tempDir);
        fs.chmodSync(tempDir, 0o777);

        let submissionStatus: string = "Accepted";

        try {
            let sourceFilename = config.filename;
            let javaMainClass: string | undefined;

            if (language === "java") {
                javaMainClass = getJavaMainClassName(code);
                sourceFilename = `${javaMainClass}.java`;
            }

            fs.writeFileSync(path.join(tempDir, sourceFilename), code);

            allTests.forEach((tc, i) => {
                fs.writeFileSync(
                    path.join(tempDir, `in_${i}.txt`),
                    tc.rawInput ?? "",
                    "utf8",
                );
            });

            const script = buildScript(
                language as Language,
                allTests.length,
                config.containerWorkDir,
                language === "java" ? { javaMainClass } : undefined,
            );

            const status = isContainerRunning(config.workerName);
            if (!status.running) {
                console.error(
                    `Worker container ${config.workerName} is not running`,
                    status.error,
                );
                return ErrorResponse(
                    c,
                    `Something went worng!,Execution worker "${config.workerName}" is not running`,
                    500,
                );
            }

            const { stderr } = execInWorker(
                config.workerName,
                workdirName,
                script,
            );

            const compileErrPath = path.join(tempDir, "compile_err.txt");
            const compileErr = fs.existsSync(compileErrPath)
                ? fs.readFileSync(compileErrPath, "utf8").trim()
                : "";

            let hasRuntimeError = false;

            const baseResults = allTests.map((tc, i) => {
                const outPath = path.join(tempDir, `out_${i}.txt`);
                const errPath = path.join(tempDir, `err_${i}.txt`);

                const outExists = fs.existsSync(outPath);
                const errExists = fs.existsSync(errPath);

                const out = outExists
                    ? fs.readFileSync(outPath, "utf8").trim()
                    : "";

                const runErr = errExists
                    ? fs.readFileSync(errPath, "utf8").trim()
                    : "";

                if (runErr) {
                    hasRuntimeError = true;
                }

                const expected =
                    typeof tc.output === "string" ? tc.output.trim() : null;

                const passed =
                    expected !== null && !runErr && !compileErr
                        ? out === expected
                        : false;

                return {
                    testcase: tc.testcase,
                    input: tc.rawInput ?? "",
                    output: out,
                    expected,
                    passed,
                    isHidden: !!tc.isHidden,
                };
            });

            const totalTests = baseResults.length;
            const passedTests = baseResults.filter((r) => r.passed).length;

            // ✅ Attach per-test points and awarded points
            const resultsWithPoints = baseResults.map((r, i) => {
                const tcMeta = allTests[i];
                const testPoints = tcMeta?.points ?? 0;
                return {
                    ...r,
                    points: testPoints,
                    pointsAwarded: r.passed ? testPoints : 0,
                };
            });

            // ✅ Total max points is sum of testcase points
            const maxPoints = resultsWithPoints.reduce(
                (sum, r) => sum + (r.points ?? 0),
                0,
            );

            // ✅ Total awarded points is sum of pointsAwarded for passed tests
            const awardedPoints = resultsWithPoints.reduce(
                (sum, r) => sum + (r.pointsAwarded ?? 0),
                0,
            );

            // (Optional) average points per test – you can ignore this in UI if not needed
            const pointsPerTest =
                totalTests > 0
                    ? Math.round((maxPoints / totalTests) * 100) / 100
                    : 0;

            if (compileErr) {
                submissionStatus = "Compile Error";
            } else if (hasRuntimeError) {
                submissionStatus = "Runtime Error";
            } else if (passedTests !== totalTests) {
                submissionStatus = "Wrong Answer";
            } else {
                submissionStatus = "Accepted";
            }

            // ✅ Upsert with contest
            const submissionDoc = await Submission.findOneAndUpdate(
                {
                    userId: userId,
                    problemId: problem,
                    contestId: contestId,
                },
                {
                    user: userId,
                    problem,
                    contest: contestId,
                    language,
                    code,

                    totalTests,
                    passedTests,

                    maxPoints,
                    pointsPerTest,
                    awardedPoints,

                    results: resultsWithPoints,
                    status: submissionStatus,
                },
                {
                    new: true,
                    upsert: true,
                    setDefaultsOnInsert: true,
                },
            );

            const responseResults = resultsWithPoints.map((r) => r);

            return SuccessResponse(c, "Submission saved", 200, {
                submissionId: submissionDoc._id,
                contestId,
                status: submissionStatus,
                language,
                totalTests,
                passedTests,
                maxPoints,
                pointsPerTest,
                awardedPoints,
                results: responseResults,
            });
        } finally {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
    } catch (err) {
        console.error(err);
        return ErrorResponse(c, "Internal Server Error", 500);
    }
};
