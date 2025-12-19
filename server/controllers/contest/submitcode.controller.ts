import fs from "fs";
import path from "path";
import type { Context } from "hono";

import Submission from "../../models/submission.model.js";
import Problem from "../../models/problem.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

import {
    LANGUAGE_CONFIG,
    getJavaMainClassName,
    isContainerRunning,
    execInWorker,
    buildExecutionScript,
    createJobDir,
    cleanupJobDir,
    type Language,
} from "../../utils/judge.util.js";

import {
    outputsMatch,
    canonicalToDisplayString,
} from "../../utils/output.util.js";

export const submitCode = async (c: Context) => {
    try {
        const body = await c.req.json();
        const { userId, language, code, problem, contestId } = body;

        if (!language || !code) {
            return ErrorResponse(c, "Language and code are required", 400);
        }

        if (!problem || !contestId || !userId) {
            return ErrorResponse(c, "Missing submission data", 400);
        }

        const config = LANGUAGE_CONFIG[language as Language];
        if (!config) {
            return ErrorResponse(c, "Unsupported language", 400);
        }

        const problemDoc: any = await Problem.findById(problem)
            .populate("testcases")
            .lean();

        if (!problemDoc || !problemDoc.testcases?.length) {
            return ErrorResponse(c, "No testcases found", 400);
        }

        const outputType =
            typeof problemDoc.outputType === "string" &&
            problemDoc.outputType.trim()
                ? problemDoc.outputType
                : "string";

        const allTests = problemDoc.testcases.map((t: any) => ({
            testcase: t._id,
            rawInput: t.rawInput ?? "",
            output: t.output, // Already structured
            isHidden: !!t.isHidden,
            points: t.points ?? 0,
        }));

        const { tempDir, workdirName } = createJobDir(config.hostWorkDir);

        let submissionStatus = "Accepted";

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
                    tc.rawInput,
                    "utf8",
                );
            });

            const script = buildExecutionScript(
                language as Language,
                allTests.length,
                config.containerWorkDir,
                {
                    javaMainClass,
                    stopOnError: false,
                },
            );

            const status = isContainerRunning(config.workerName);
            if (!status.running) {
                return ErrorResponse(
                    c,
                    `Execution worker "${config.workerName}" is not running`,
                    500,
                );
            }

            execInWorker(config.workerName, workdirName, script);

            const compileErrPath = path.join(tempDir, "compile_err.txt");
            const compileErr = fs.existsSync(compileErrPath)
                ? fs.readFileSync(compileErrPath, "utf8").trim()
                : "";

            let hasRuntimeError = false;

            const results = allTests.map((tc, i) => {
                const outPath = path.join(tempDir, `out_${i}.txt`);
                const errPath = path.join(tempDir, `err_${i}.txt`);

                const rawOut = fs.existsSync(outPath)
                    ? fs.readFileSync(outPath, "utf8").trim()
                    : "";

                const runErr = fs.existsSync(errPath)
                    ? fs.readFileSync(errPath, "utf8").trim()
                    : "";

                if (runErr) hasRuntimeError = true;

                // Compare using structured comparison
                const passed =
                    !compileErr &&
                    !runErr &&
                    outputsMatch(rawOut, tc.output, outputType);

                return {
                    testcase: tc.testcase,
                    passed,
                    isHidden: tc.isHidden,
                    input: tc.rawInput,
                    output: rawOut, // Raw output as user printed
                    expected: canonicalToDisplayString(tc.output), // Structured as string
                    points: tc.points,
                    pointsAwarded: passed ? tc.points : 0,
                };
            });

            const totalTests = results.length;
            const passedTests = results.filter((r) => r.passed).length;

            if (compileErr) submissionStatus = "Compile Error";
            else if (hasRuntimeError) submissionStatus = "Runtime Error";
            else if (passedTests !== totalTests)
                submissionStatus = "Wrong Answer";

            const submission = await Submission.findOneAndUpdate(
                { userId, problemId: problem, contestId },
                {
                    user: userId,
                    problem,
                    contest: contestId,
                    language,
                    code,
                    totalTests,
                    passedTests,
                    status: submissionStatus,
                    results,
                },
                { upsert: true, new: true },
            );

            // Hide input/output/expected for hidden testcases in response
            const responseResults = results.map(
                ({ input, output, expected, ...r }) =>
                    r.isHidden
                        ? {
                              testcase: r.testcase,
                              passed: r.passed,
                              isHidden: true,
                          }
                        : { ...r, input, output, expected },
            );

            return SuccessResponse(c, "Submission saved", 200, {
                submissionId: submission._id,
                status: submissionStatus,
                totalTests,
                passedTests,
                results: responseResults,
            });
        } finally {
            cleanupJobDir(tempDir);
        }
    } catch (err) {
        console.error(err);
        return ErrorResponse(c, "Internal Server Error", 500);
    }
};
