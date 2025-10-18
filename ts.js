import fs from "fs";
import os from "os";
import path from "path";
import Docker from "dockerode";

const docker = new Docker();

// ===========================
// Set language and code here
// ===========================

// Example 1: Python
// const lang = "python";
// const userCode = `
// import time
// start = time.time()
// print("Hello Python from Docker!")
// for i in range(3):
//     print("Line", i+1)
// end = time.time()
// print("Execution time:", end - start, "seconds")
// `;

// Example 2: C
// const lang = "c";
// const userCode = `
// #include <stdio.h>
// #include <time.h>
// int main() {
//     clock_t start = clock();
//     printf("Hello C from Docker!\\n");
//     for(int i=1;i<=3;i++) printf("Line %d\\n", i);
//     clock_t end = clock();
//     double t = (double)(end - start)/CLOCKS_PER_SEC;
//     printf("Execution time: %f seconds\\n", t);
//     return 0;
// }
// `;

// Example 3: C++
const lang = "cpp";
const userCode = `
#include <iostream>
#include <chrono>

int main() {
    auto start = std::chrono::high_resolution_clock::now();

    std::cout << "Hello C++ from Docker!" << std::endl;
    for(int i = 1; i <= 3; i++) {
        std::cout << "Line " << i << std::endl;
    }

    auto end = std::chrono::high_resolution_clock::now();
    std::chrono::duration<double, std::milli> duration = end - start;

    std::cout << "Execution time: " << duration.count() << " ms" << std::endl;

    return 0;
}

`;

async function runUserCode(code, lang = "python", timeout = 10) {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "usercode-"));

  let filename, image, buildCmd, runCmd;

  switch (lang.toLowerCase()) {
    case "python":
      filename = "user_code.py";
      image = "python:3.10-alpine";
      buildCmd = null;
      runCmd = ["python", `/code/${filename}`];
      break;

    case "c":
      filename = "user_code.c";
      image = "gcc:12.2";
      buildCmd = ["gcc", `/code/${filename}`, "-O0", "-o", `/code/user_code.out`];
      runCmd = ["/code/user_code.out"];
      break;

    case "cpp":
      filename = "user_code.cpp";
      image = "gcc:12.2";
      buildCmd = ["g++", `/code/${filename}`, "-O0", "-o", `/code/user_code.out`];
      runCmd = ["/code/user_code.out"];
      break;

    default:
      throw new Error("Unsupported language: " + lang);
  }

  const codePath = path.join(tmpDir, filename);
  fs.writeFileSync(codePath, code);

  try {
    await docker.getImage(image).inspect();
  } catch {
    console.log(`Pulling image ${image}...`);
    await new Promise((resolve, reject) => {
      docker.pull(image, {}, (err, stream) => {
        if (err) return reject(err);
        docker.modem.followProgress(stream, (err, res) => (err ? reject(err) : resolve(res)));
      });
    });
  }

  const container = await docker.createContainer({
    Image: image,
    Cmd: buildCmd ? ["sh", "-c", "sleep 1"] : runCmd,
    HostConfig: {
      Binds: [`${tmpDir}:/code`],
      NetworkMode: "none",
      AutoRemove: true,
    },
  });

  try {
    await container.start();

    if (buildCmd) {
      // Compile C/C++
      const exec = await container.exec({
        Cmd: buildCmd,
        AttachStdout: true,
        AttachStderr: true,
      });
      const stream = await exec.start({ hijack: true, stdin: false });
      const chunks = [];
      stream.on("data", chunk => chunks.push(chunk));
      await new Promise(resolve => stream.on("end", resolve));
      const inspect = await exec.inspect();
      if (inspect.ExitCode !== 0) {
        return { stdout: "", stderr: Buffer.concat(chunks).toString(), exitCode: inspect.ExitCode };
      }

      // Run compiled program
      const execRun = await container.exec({
        Cmd: runCmd,
        AttachStdout: true,
        AttachStderr: true,
      });
      const runStream = await execRun.start({ hijack: true, stdin: false });
      const runChunks = [];
      runStream.on("data", chunk => runChunks.push(chunk));
      await new Promise(resolve => runStream.on("end", resolve));
      const inspectRun = await execRun.inspect();
      return { stdout: Buffer.concat(runChunks).toString(), stderr: "", exitCode: inspectRun.ExitCode };
    } else {
      const waitPromise = container.wait();
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Execution timeout")), timeout * 1000)
      );
      const result = await Promise.race([waitPromise, timeoutPromise]);
      const logs = await container.logs({ stdout: true, stderr: true });
      return { stdout: logs.toString(), stderr: "", exitCode: result.StatusCode };
    }
  } catch (err) {
    return { stdout: "", stderr: err.message, exitCode: 1 };
  } finally {
    try { await container.remove({ force: true }); } catch {}
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
}

// Run
runUserCode(userCode, lang).then(result => {
  console.log("--- STDOUT ---");
  console.log(result.stdout);
  console.log("--- STDERR ---");
  console.log(result.stderr);
  console.log("--- EXIT CODE ---");
  console.log(result.exitCode);
});

export default runUserCode;
