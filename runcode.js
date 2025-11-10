import fs from "fs";
import { spawnSync } from "bun";

// Sample input
const input = `5\n1 2 3 4 5\n`;

// Source codes
const cCode = `
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
`;

const cppCode = `
#include <bits/stdc++.h>
using namespace std;
int main() {
    int n; cin >> n;
    vector<int> arr(n);
    for (int i = 0; i < n; i++) cin >> arr[i];
    cout << accumulate(arr.begin(), arr.end(), 0) << endl;
}
`;

const javaCode = `
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
`;

const pythonCode = `
n = int(input())
arr = list(map(int, input().split()))
print(sum(arr))
`;

// Main function to run code in Docker
async function runDockerCLI(language, code, input) {
  const tempDir = `./temp_${language}`;
  fs.mkdirSync(tempDir, { recursive: true });

  let filename, compileCmd, runCmd, image;

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
      compileCmd = null;
      runCmd = ["sh", "-c", `echo '${input}' | python3 /code/main.py`];
      image = "python:3";
      break;
    default:
      throw new Error("Unsupported language");
  }

  // Write source file
  fs.writeFileSync(`${tempDir}/${filename}`, code);

  // Step 1: Compile if needed
  if (compileCmd) {
    const compileResult = spawnSync([
      "docker",
      "run",
      "--rm",
      "-v",
      `${process.cwd()}/${tempDir}:/code`,
      image,
      ...compileCmd,
    ]);

    if (compileResult.status !== 0) {
      fs.rmSync(tempDir, { recursive: true, force: true });
      throw new Error(
        `Compilation failed:\n${compileResult.stdout?.toString()}\n${compileResult.stderr?.toString()}`,
      );
    }
  }

  // Step 2: Run
  const runResult = spawnSync([
    "docker",
    "run",
    "--rm",
    "-v",
    `${process.cwd()}/${tempDir}:/code`,
    image,
    ...runCmd,
  ]);

  fs.rmSync(tempDir, { recursive: true, force: true });

  return (
    runResult.stdout?.toString().trim() +
    (runResult.stderr ? "\n" + runResult.stderr.toString().trim() : "")
  );
}

// Run all languages
(async () => {
  try {
    console.log("C Output:", await runDockerCLI("c", cCode, input));
    console.log("C++ Output:", await runDockerCLI("cpp", cppCode, input));
    console.log("Java Output:", await runDockerCLI("java", javaCode, input));
    console.log(
      "Python Output:",
      await runDockerCLI("python", pythonCode, input),
    );
  } catch (err) {
    console.error("Error:", err);
  }
})();
