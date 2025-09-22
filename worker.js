import amqp from "amqplib";
import { spawn } from "child_process";

const TIME_LIMIT_MS = 5000; // 5 seconds

async function startWorker() {
	const conn = await amqp.connect("amqp://localhost");
	const channel = await conn.createChannel();
	const queue = "code_jobs";

	await channel.assertQueue(queue, { durable: true });
	channel.prefetch(1);

	console.log("Worker is waiting for jobs...");

	channel.consume(queue, async (msg) => {
		if (!msg) return;

		const job = JSON.parse(msg.content.toString());
		console.log(`\nProcessing job: ${job.id}`);

		try {
			const start = Date.now();
			const output = await runWithTimeout(
				runCode(job.language, job.code, job.args),
				TIME_LIMIT_MS
			);
			const end = Date.now();

			console.log(`Output: ${output}`);
			console.log(`Execution time: ${end - start} ms`);
		} catch (err) {
			console.log(`Error: ${err.message}`);
		}

		channel.ack(msg);
	});
}

// ------------------ Run code inside persistent Docker ------------------
function runCode(language, code, args = []) {
	switch (language) {
		case "python":
			return runPython(code, args);
		case "javascript":
			return runJS(code, args);
		case "java":
			return runJava(code, args);
		case "cpp":
			return runCpp(code, args);
		case "c":
			return runC(code, args);
		default:
			return Promise.reject(new Error("Unsupported language"));
	}
}

// ------------------ Helpers for each language ------------------

function runPython(code, args) {
	return runInDocker(
		"python_worker",
		"python",
		`
def solution(${args.map((_, i) => "arg" + i).join(", ")}):
    ${code.replace(/\n/g, "\n    ")}

print(solution(${args.map(JSON.stringify).join(", ")}))
  `
	);
}

function runJS(code, args) {
	const argList = args.map((a, i) => `arg${i}`).join(", ");
	const argValues = args.map(JSON.stringify).join(", ");

	const script = `
function solution(${argList}) {
${code}
}

console.log(solution(${argValues}));
`;

	// Save to temp file and run
	return runInDocker(
		"node_worker",
		"bash",
		`
echo "${script.replace(/"/g, '\\"')}" > main.js && node main.js
`
	);
}

function runJava(code, args) {
	const argList = args.map((a) => `"${a}"`).join(", ");
	return runInDocker(
		"java_worker",
		"bash",
		`
echo '
public class Main {
  public static void main(String[] args) {
    System.out.println(solution(${argList}));
  }
  public static String solution(${args
		.map((_, i) => "String arg" + i)
		.join(", ")}) {
    ${code}
  }
}
' > Main.java && javac Main.java && java Main
  `
	);
}

function runCpp(code, args) {
	return runInDocker(
		"cpp_worker",
		"bash",
		`
echo '
#include <bits/stdc++.h>
using namespace std;

${code}

int main() {
  cout << solution(${args.join(",")}) << endl;
  return 0;
}
' > main.cpp && g++ main.cpp -o main && ./main
  `
	);
}

function runC(code, args) {
	return runInDocker(
		"cpp_worker",
		"bash",
		`
echo '
#include <stdio.h>

${code}

int main() {
  printf("%d\\n", solution(${args.join(",")}));
  return 0;
}
' > main.c && gcc main.c -o main && ./main
  `
	);
}

// ------------------ Execute in Docker ------------------
function runInDocker(container, cmd, codeStr) {
	return new Promise((resolve, reject) => {
		const docker = spawn("docker", [
			"exec",
			"-i",
			container,
			cmd,
			"-c",
			codeStr,
		]);

		let output = "";
		let error = "";

		docker.stdout.on("data", (data) => (output += data.toString()));
		docker.stderr.on("data", (data) => (error += data.toString()));

		docker.on("close", () => {
			if (error) reject(new Error(error.trim()));
			else resolve(output.trim());
		});
	});
}

// ------------------ Timeout wrapper ------------------
function runWithTimeout(promise, ms) {
	let timeout = new Promise((_, reject) =>
		setTimeout(() => reject(new Error("Time Limit Exceeded")), ms)
	);
	return Promise.race([promise, timeout]);
}

// ------------------ Start worker ------------------
startWorker();
