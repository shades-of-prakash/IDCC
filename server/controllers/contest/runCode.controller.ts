import fs from "fs";
import path from "path";
import type { Context } from "hono";

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
    userOutputToDisplayString,
} from "../../utils/output.util.js";

export const runCode = async (c: Context) => {
    try {
        const body = await c.req.json();
        const { language, code, problem, testcases, userTestcases = [] } = body;

        if (!language || !code) {
            return ErrorResponse(c, "Language and code are required", 400);
        }

        if (!problem) {
            return ErrorResponse(c, "Problem ID is required", 400);
        }

        const config = LANGUAGE_CONFIG[language as Language];
        if (!config) {
            return ErrorResponse(c, "Unsupported language", 400);
        }

        const problemData: any = await Problem.findById(problem).lean();
        if (!problemData) {
            return ErrorResponse(c, "Problem not found", 404);
        }

        const outputType =
            typeof problemData.outputType === "string" &&
            problemData.outputType.trim()
                ? problemData.outputType
                : "string";

        const visibleTests = Array.isArray(testcases)
            ? testcases
            : problemData.visibleTests || [];

        const allTests = [
            ...visibleTests.map((t: any) => ({
                ...t,
                __source: "visible" as const,
            })),
            ...userTestcases.map((t: any) => ({
                rawInput: t.rawInput || "",
                output: null,
                __source: "custom" as const,
            })),
        ];

        const { tempDir, workdirName } = createJobDir(config.hostWorkDir);

        try {
            let sourceFilename = config.filename;
            let javaMainClass: string | undefined;

            if (language === "java") {
                javaMainClass = getJavaMainClassName(code);
                sourceFilename = `${javaMainClass}.java`;
            }

            fs.writeFileSync(path.join(tempDir, sourceFilename), code, "utf8");

            allTests.forEach((tc, i) => {
                fs.writeFileSync(
                    path.join(tempDir, `in_${i}.txt`),
                    tc.rawInput ?? "",
                    "utf8",
                );
            });

            const script = buildExecutionScript(
                language as Language,
                allTests.length,
                config.containerWorkDir,
                { javaMainClass, stopOnError: true },
            );

            if (!isContainerRunning(config.workerName).running) {
                return ErrorResponse(c, "Execution worker not running", 500);
            }

            execInWorker(config.workerName, workdirName, script);

            const compileErrPath = path.join(tempDir, "compile_err.txt");
            const compileErr = fs.existsSync(compileErrPath)
                ? fs.readFileSync(compileErrPath, "utf8").trim()
                : "";

            const results = allTests.map((tc, i) => {
                const outPath = path.join(tempDir, `out_${i}.txt`);
                const errPath = path.join(tempDir, `err_${i}.txt`);

                const rawOut = fs.existsSync(outPath)
                    ? fs.readFileSync(outPath, "utf8").trim()
                    : "";

                const runErr = fs.existsSync(errPath)
                    ? fs.readFileSync(errPath, "utf8").trim()
                    : "";

                // Testcase output is already structured (e.g., [["s"]])
                // Just compare user's parsed output with it directly
                const passed =
                    tc.output != null &&
                    !compileErr &&
                    !runErr &&
                    outputsMatch(rawOut, tc.output, outputType);

                return {
                    input: tc.rawInput ?? "",
                    // Return RAW user output as-is (not constructed)
                    output: rawOut,
                    // Display expected output as JSON string
                    expected: canonicalToDisplayString(tc.output),
                    passed,
                    error: runErr || compileErr || null,
                    source: tc.__source,
                };
            });

            return SuccessResponse(c, "Success", 200, {
                results,
                total: results.length,
                passed: results.filter((r) => r.passed).length,
            });
        } finally {
            cleanupJobDir(tempDir);
        }
    } catch (err) {
        console.error(err);
        return ErrorResponse(c, "Internal Server Error", 500);
    }
};
