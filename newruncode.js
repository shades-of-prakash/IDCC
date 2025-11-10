import fs from "fs";
import path from "path";

const input = `5
1 2 3 4 5
`;

const codes = {
  c: `
#include <stdio.h>
int main() {
    int n;
    scanf("%d", &n);
    int arr[n], sum = 0;
    for (int i = 0; i < n; i++) scanf("%d", &arr[i]);
    for (int i = 0; i < n; i++) sum += arr[i];
    printf("%d\\n", sum);
    return 0;
}
`,
  cpp: `
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << accumulate(arr.begin(), arr.end(), 0) << endl;
}
`,
  java: `
import java.util.*;
class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int n = sc.nextInt();
        int sum = 0;
        for (int i = 0; i < n; i++) sum += sc.nextInt();
        System.out.println(sum);
    }
}
`,
  python: `
n = int(input())
arr = list(map(int, input().split()))
print(sum(arr))
`,
};

// Temp directory
const tmpDir = path.join(process.cwd(), "temp_run");
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

// Convert Windows path to Docker-compatible POSIX path
function winPathToPosix(p) {
  return p
    .replace(/^([A-Za-z]):/, (_, drive) => "/" + drive.toLowerCase())
    .replace(/\\/g, "/");
}

async function runCode(lang, code) {
  const langDir = path.join(tmpDir, lang);
  if (!fs.existsSync(langDir)) fs.mkdirSync(langDir, { recursive: true });

  let filename, image, compileCmd, runCmd;

  switch (lang) {
    case "c":
      filename = "main.c";
      image = "gcc";
      compileCmd = "gcc main.c -o main";
      runCmd = `./main`;
      break;
    case "cpp":
      filename = "main.cpp";
      image = "gcc";
      compileCmd = "g++ main.cpp -o main";
      runCmd = `./main`;
      break;
    case "java":
      filename = "Main.java";
      image = "openjdk";
      compileCmd = "javac Main.java";
      runCmd = `java Main`;
      break;
    case "python":
      filename = "main.py";
      image = "python:3";
      compileCmd = null;
      runCmd = `python3 main.py`;
      break;
    default:
      throw new Error("Unsupported language");
  }

  // Write source code to host folder
  fs.writeFileSync(path.join(langDir, filename), code);

  // Docker requires absolute paths
  const absPath = path.resolve(langDir);
  const dockerPath = winPathToPosix(absPath);

  // Compose the full command with input piping
  const fullCmd = compileCmd
    ? `sh -c "${compileCmd} && echo '${input}' | ${runCmd}"`
    : `sh -c "echo '${input}' | ${runCmd}"`;

  const proc = Bun.spawn(
    [
      "docker",
      "run",
      "--rm",
      "-v",
      `${dockerPath}:/code`,
      "-w",
      "/code",
      image,
      "sh",
      "-c",
      fullCmd,
    ],
    {
      stdout: "pipe",
      stderr: "pipe",
    },
  );

  const output = await proc.stdout.text();
  const errorOutput = await proc.stderr.text();

  return { output, error: errorOutput };
}

(async () => {
  for (const lang of Object.keys(codes)) {
    try {
      const { output, error } = await runCode(lang, codes[lang]);
      console.log(`--- ${lang.toUpperCase()} ---`);
      console.log("Output:\n", output.trim());
      if (error) console.error("Errors:\n", error.trim());
    } catch (err) {
      console.error(`${lang.toUpperCase()} execution failed:`, err);
    }
  }

  // Clean up temp folder
  fs.rmSync(tmpDir, { recursive: true, force: true });
})();
