import fs from "fs";
import { spawnSync } from "bun";
import type { Context } from "hono";
import { SuccessResponse, ErrorResponse } from "../../utils/response";
import Problem from "../../models/problem.model";

export const runCode = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { language, code, problem } = body;

    if (!language || !code) {
      return ErrorResponse(c, "Language and code are required", 400);
    }

    if (!problem) {
      return ErrorResponse(c, "Problem ID is required", 400);
    }

    // ✅ Fetch only visible testcases from the problem
    const problemData = await Problem.findById(problem).lean();
    if (!problemData) {
      return ErrorResponse(c, "Problem not found", 404);
    }

    const testcases = problemData.visibleTests || [];
    if (testcases.length === 0) {
      return ErrorResponse(
        c,
        "No visible testcases found for this problem",
        400,
      );
    }

    const results: any[] = [];

    for (const tc of testcases) {
      const { input, output } = tc; // each testcase has { input, output }

      const tempDir = `./temp_${language}_${Date.now()}`;
      fs.mkdirSync(tempDir, { recursive: true });

      let filename: string;
      let compileCmd: string[] | null = null;
      let runCmd: string[];
      let image: string;

      switch (language) {
        case "c":
          filename = "main.c";
          compileCmd = ["gcc", "/code/main.c", "-o", "/code/main"];
          runCmd = ["sh", "-c", `echo '${input}' | /code/main`];
          image = "gcc";
          break;
        case "cpp":
          filename = "main.cpp";
          compileCmd = ["g++", "/code/main.cpp", "-o", "/code/main"];
          runCmd = ["sh", "-c", `echo '${input}' | /code/main`];
          image = "gcc";
          break;
        case "java":
          filename = "Main.java";
          compileCmd = ["javac", "/code/Main.java"];
          runCmd = ["sh", "-c", `echo '${input}' | java -cp /code Main`];
          image = "openjdk";
          break;
        case "python":
          filename = "main.py";
          runCmd = ["sh", "-c", `echo '${input}' | python3 /code/main.py`];
          image = "python:3";
          break;
        default:
          return ErrorResponse(c, "Unsupported language", 400);
      }

      // Write code to temp directory
      fs.writeFileSync(`${tempDir}/${filename}`, code);
      const dockerVolume = `${process.cwd()}/${tempDir}:/code`;

      // Step 1: Compile if needed
      if (compileCmd) {
        const compileResult = spawnSync([
          "docker",
          "run",
          "--rm",
          "-v",
          dockerVolume,
          image,
          ...compileCmd,
        ]);

        if (compileResult.status !== 0) {
          fs.rmSync(tempDir, { recursive: true, force: true });
          return ErrorResponse(
            c,
            "Compilation failed",
            400,
            compileResult.stderr?.toString(),
          );
        }
      }

      // Step 2: Run the code
      const runResult = spawnSync([
        "docker",
        "run",
        "--rm",
        "-v",
        dockerVolume,
        image,
        ...runCmd,
      ]);

      fs.rmSync(tempDir, { recursive: true, force: true });

      const stdout = runResult.stdout?.toString().trim() || "";
      const stderr = runResult.stderr?.toString().trim() || "";

      const passed = stdout === output.trim();

      results.push({
        input,
        expected: output,
        output: stdout,
        passed,
        error: stderr || null,
      });
    }

    return SuccessResponse(c, "Code executed successfully", 200, {
      problem,
      total: results.length,
      passed: results.filter((r) => r.passed).length,
      results,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return ErrorResponse(c, "Internal server error", 500);
  }
};
