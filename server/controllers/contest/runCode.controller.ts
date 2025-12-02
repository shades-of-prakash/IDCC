import fs from "fs";
import path from "path";
import { spawnSync } from "bun";
import type { Context } from "hono";

import { SuccessResponse, ErrorResponse } from "../../utils/response";
import Problem from "../../models/problem.model";

type Language = "c" | "cpp" | "java" | "python";

interface LangConfig {
  filename: string;
  image: string;
  compileCmdInContainer: string[] | null;
  runCmdInContainer: string[];
}

const LANGUAGE_CONFIG: Record<Language, LangConfig> = {
  c: {
    filename: "main.c",
    image: "gcc",
    compileCmdInContainer: ["gcc", "/code/main.c", "-O2", "-o", "/code/main"],
    runCmdInContainer: ["/code/main"],
  },
  cpp: {
    filename: "main.cpp",
    image: "gcc",
    compileCmdInContainer: ["g++", "/code/main.cpp", "-O2", "-o", "/code/main"],
    runCmdInContainer: ["/code/main"],
  },
  java: {
    filename: "Main.java",
    image: "openjdk",
    compileCmdInContainer: ["javac", "/code/Main.java"],
    runCmdInContainer: ["java", "-cp", "/code", "Main"],
  },
  python: {
    filename: "main.py",
    image: "python:3",
    compileCmdInContainer: null,
    runCmdInContainer: ["python3", "/code/main.py"],
  },
};

export const runCode = async (c: Context) => {
  try {
    const body = await c.req.json();
    const {
      language,
      code,
      problem,
      testcases,
      userTestcases = [],
    } = body as {
      language: Language;
      code: string;
      problem: string;
      testcases?: any[];
      userTestcases?: any[];
    };

    if (!language || !code) {
      return ErrorResponse(c, "Language and code are required", 400);
    }

    if (!problem) {
      return ErrorResponse(c, "Problem ID is required", 400);
    }

    const langConfig = LANGUAGE_CONFIG[language];
    if (!langConfig) {
      return ErrorResponse(c, "Unsupported language", 400);
    }

    const problemData = await Problem.findById(problem).lean();

    if (!problemData) {
      return ErrorResponse(c, "Problem not found", 404);
    }

    // Prefer testcases passed from frontend
    const visibleTestcasesFromBody = Array.isArray(testcases) ? testcases : [];
    const visibleTestcasesFromDB = problemData.visibleTests || [];

    const visibleTestcases =
      visibleTestcasesFromBody.length > 0
        ? visibleTestcasesFromBody
        : visibleTestcasesFromDB;

    if (visibleTestcases.length === 0 && userTestcases.length === 0) {
      return ErrorResponse(
        c,
        "No visible testcases or custom testcases found for this problem",
        400,
      );
    }

    const allTestcases = [
      ...visibleTestcases.map((tc: any) => ({
        ...tc,
        __source: "visible",
      })),
      ...userTestcases.map((tc: any) => ({
        rawInput: tc.rawInput || "",
        input: tc.input || {},
        output: null,
        __source: "custom",
      })),
    ];

    // 🔥 Create temp dir ONCE per request
    const tempDir = path.join(
      process.cwd(),
      `temp_${language}_${Date.now()}_${Math.random().toString(16).slice(2)}`,
    );
    fs.mkdirSync(tempDir, { recursive: true });

    try {
      // Write code once
      const filePath = path.join(tempDir, langConfig.filename);
      fs.writeFileSync(filePath, code);

      const dockerVolume = `${tempDir}:/code`;

      // 🔥 Compile ONCE if needed
      if (langConfig.compileCmdInContainer) {
        const compileResult = spawnSync({
          cmd: [
            "docker",
            "run",
            "--rm",
            "-v",
            dockerVolume,
            langConfig.image,
            ...langConfig.compileCmdInContainer,
          ],
          stdout: "pipe",
          stderr: "pipe",
        });

        if (!compileResult.success) {
          const stderr = compileResult.stderr?.toString();
          return ErrorResponse(
            c,
            "Compilation failed",
            400,
            stderr || "Unknown compilation error",
          );
        }
      }

      const results: any[] = [];

      // 🔁 Only run container per testcase (no recompile, no dir re-create)
      for (const tc of allTestcases) {
        const stdin = (tc.rawInput ?? "").toString();

        const runResult = spawnSync({
          cmd: [
            "docker",
            "run",
            "--rm",
            "-i", // stdin from Bun
            "-v",
            dockerVolume,
            langConfig.image,
            ...langConfig.runCmdInContainer,
          ],
          stdin: new TextEncoder().encode(stdin),
          stdout: "pipe",
          stderr: "pipe",
        });

        const stdout = runResult.stdout?.toString().trim() || "";
        const stderr = runResult.stderr?.toString().trim() || "";

        const expectedOutput =
          typeof tc.output === "string" ? tc.output.trim() : null;

        const passed =
          expectedOutput !== null ? stdout === expectedOutput : null;

        results.push({
          source: tc.__source,
          input: stdin,
          expected: expectedOutput,
          output: stdout,
          passed,
          error: stderr || null,
        });
      }

      return SuccessResponse(c, "Code executed successfully", 200, {
        problem,
        total: results.length,
        passed: results.filter((r) => r.passed === true).length,
        results,
      });
    } finally {
      // Clean once at the end
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error("Unexpected error:", err);
    return ErrorResponse(c, "Internal server error", 500);
  }
};
