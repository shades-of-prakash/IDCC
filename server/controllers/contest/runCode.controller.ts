import fs from "fs";
import path from "path";
import type { Context } from "hono";
import { spawnSync } from "bun";

import Problem from "../../models/problem.model";
import { SuccessResponse, ErrorResponse } from "../../utils/response";

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
    workerName: "judge-c-worker",
    hostWorkDir: "/judge/work/c",
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

function buildScript(language: Language, count: number, root: string) {
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
set -e
BASE="${root}/$WORKDIR"
gcc "$BASE/main.c" -O0 -o "$BASE/main"
${loop("$BASE/main")}
`;
    case "cpp":
      return `
set -e
BASE="${root}/$WORKDIR"
g++ "$BASE/main.cpp" -O0 -o "$BASE/main"
${loop("$BASE/main")}
`;
    case "java":
      return `
set -e
BASE="${root}/$WORKDIR"
javac "$BASE/Main.java"
${loop('java -cp "$BASE" Main')}
`;
    case "python":
      return `
set -e
BASE="${root}/$WORKDIR"
${loop('python3 "$BASE/main.py"')}
`;
  }
}

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

    const config = LANGUAGE_CONFIG[language];
    const problemData = await Problem.findById(problem).lean();

    if (!problemData) return ErrorResponse(c, "Problem not found", 404);

    const visible = Array.isArray(testcases)
      ? testcases
      : problemData.visibleTests || [];

    const allTests = [
      ...visible.map((t) => ({ ...t, __source: "visible" })),
      ...userTestcases.map((t) => ({
        rawInput: t.rawInput || "",
        __source: "custom",
        output: null,
      })),
    ];

    if (allTests.length === 0)
      return ErrorResponse(c, "No testcases found", 400);

    fs.mkdirSync(config.hostWorkDir, { recursive: true });

    const tempDir = fs.mkdtempSync(path.join(config.hostWorkDir, "job_"));
    const workdirName = path.basename(tempDir);

    try {
      fs.writeFileSync(path.join(tempDir, config.filename), code);

      allTests.forEach((tc, i) => {
        fs.writeFileSync(path.join(tempDir, `in_${i}.txt`), tc.rawInput ?? "");
      });

      const script = buildScript(
        language,
        allTests.length,
        config.containerWorkDir,
      );

      const { stderr } = execInWorker(config.workerName, workdirName, script);

      const results = allTests.map((tc, i) => {
        const outPath = path.join(tempDir, `out_${i}.txt`);
        const errPath = path.join(tempDir, `err_${i}.txt`);

        const out = fs.existsSync(outPath)
          ? fs.readFileSync(outPath, "utf8").trim()
          : "";

        const err = fs.existsSync(errPath)
          ? fs.readFileSync(errPath, "utf8").trim()
          : "";

        const expected =
          typeof tc.output === "string" ? tc.output.trim() : null;

        const passed = expected !== null ? out === expected : null;

        return {
          input: tc.rawInput ?? "",
          output: out,
          expected,
          passed,
          error: err || null,
          source: tc.__source,
        };
      });

      return SuccessResponse(c, "Success", 200, {
        results,
        total: results.length,
        passed: results.filter((r) => r.passed).length,
      });
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  } catch (err) {
    console.error(err);
    return ErrorResponse(c, "Internal Server Error", 500);
  }
};
