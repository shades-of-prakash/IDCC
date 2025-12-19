import fs from "fs";
import path from "path";
import { spawnSync } from "bun";

/* =========================================================
   Types
========================================================= */

export type Language = "c" | "cpp" | "java" | "python";

export interface LangConfig {
    filename: string;
    workerName: string;
    hostWorkDir: string;
    containerWorkDir: string;
}

/* =========================================================
   Language Config
========================================================= */

export const LANGUAGE_CONFIG: Record<Language, LangConfig> = {
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

/* =========================================================
   Java Helpers
========================================================= */

export function getJavaMainClassName(code: string): string {
    const match = code.match(/public\s+class\s+([A-Za-z_][A-Za-z0-9_]*)/);
    return match?.[1] ?? "Main";
}

/* =========================================================
   Docker Helpers
========================================================= */

export function isContainerRunning(name: string) {
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

export function execInWorker(worker: string, workdir: string, script: string) {
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

/* =========================================================
   Script Builder
========================================================= */

export function buildExecutionScript(
    language: Language,
    count: number,
    root: string,
    options?: {
        javaMainClass?: string;
        stopOnError?: boolean;
    },
) {
    const stopFlag = options?.stopOnError ? "set -e" : "";

    const loop = (run: string) => `
BASE="${root}/$WORKDIR"
i=0
while [ "$i" -lt ${count} ]; do
  ${run} < "$BASE/in_$i.txt" > "$BASE/out_$i.txt" 2> "$BASE/err_$i.txt" ${
      options?.stopOnError ? "" : "|| true"
  }
  i=$((i + 1))
done
`;

    switch (language) {
        case "c":
            return `
${stopFlag}
BASE="${root}/$WORKDIR"
gcc "$BASE/main.c" -O0 -o "$BASE/main" 2> "$BASE/compile_err.txt" ${
                options?.stopOnError ? "" : "|| true"
            }
${loop("$BASE/main")}
`;

        case "cpp":
            return `
${stopFlag}
BASE="${root}/$WORKDIR"
g++ "$BASE/main.cpp" -O0 -o "$BASE/main" 2> "$BASE/compile_err.txt" ${
                options?.stopOnError ? "" : "|| true"
            }
${loop("$BASE/main")}
`;

        case "java": {
            const mainClass = options?.javaMainClass || "Main";
            return `
${stopFlag}
BASE="${root}/$WORKDIR"
javac "$BASE/${mainClass}.java" 2> "$BASE/compile_err.txt" ${
                options?.stopOnError ? "" : "|| true"
            }
${loop(`java -cp "$BASE" ${mainClass}`)}
`;
        }

        case "python":
            return `
${stopFlag}
BASE="${root}/$WORKDIR"
${loop('python3 "$BASE/main.py"')}
`;
    }
}

/* =========================================================
   Workspace Helpers
========================================================= */

export function createJobDir(baseDir: string) {
    fs.mkdirSync(baseDir, { recursive: true });
    const tempDir = fs.mkdtempSync(path.join(baseDir, "job_"));
    fs.chmodSync(tempDir, 0o777);

    return {
        tempDir,
        workdirName: path.basename(tempDir),
    };
}

export function cleanupJobDir(dir: string) {
    fs.rmSync(dir, { recursive: true, force: true });
}
