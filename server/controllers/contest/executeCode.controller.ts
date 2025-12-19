import fs from "fs";
import path from "path";
import type { Context } from "hono";

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

export const executeCode = async (c: Context) => {
    try {
        const body = await c.req.json();
        const { language, code, input = "" } = body;

        if (!language || !code) {
            return ErrorResponse(c, "Language and code are required", 400);
        }

        const config = LANGUAGE_CONFIG[language as Language];
        if (!config) {
            return ErrorResponse(c, "Unsupported language", 400);
        }

        const { tempDir, workdirName } = createJobDir(config.hostWorkDir);

        try {
            let sourceFilename = config.filename;
            let javaMainClass: string | undefined;

            if (language === "java") {
                javaMainClass = getJavaMainClassName(code);
                sourceFilename = `${javaMainClass}.java`;
            }

            // Write source code
            fs.writeFileSync(path.join(tempDir, sourceFilename), code, "utf8");

            // Write input file
            fs.writeFileSync(
                path.join(tempDir, "in_0.txt"),
                input || "",
                "utf8",
            );

            // Build execution script (run only once)
            const script = buildExecutionScript(
                language as Language,
                1, // Only one execution
                config.containerWorkDir,
                { javaMainClass, stopOnError: true },
            );

            if (!isContainerRunning(config.workerName).running) {
                return ErrorResponse(c, "Execution worker not running", 500);
            }

            // Execute in worker container
            execInWorker(config.workerName, workdirName, script);

            // Read results
            const compileErrPath = path.join(tempDir, "compile_err.txt");
            const outPath = path.join(tempDir, "out_0.txt");
            const errPath = path.join(tempDir, "err_0.txt");

            const compileErr = fs.existsSync(compileErrPath)
                ? fs.readFileSync(compileErrPath, "utf8").trim()
                : "";

            const output = fs.existsSync(outPath)
                ? fs.readFileSync(outPath, "utf8").trim()
                : "";

            const runErr = fs.existsSync(errPath)
                ? fs.readFileSync(errPath, "utf8").trim()
                : "";

            // Determine status
            let status = "success";
            let error = null;

            if (compileErr) {
                status = "compile_error";
                error = compileErr;
            } else if (runErr) {
                status = "runtime_error";
                error = runErr;
            }

            return SuccessResponse(c, "Execution completed", 200, {
                status,
                output,
                error,
                input,
            });
        } finally {
            cleanupJobDir(tempDir);
        }
    } catch (err) {
        console.error(err);
        return ErrorResponse(c, "Internal Server Error", 500);
    }
};
