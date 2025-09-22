import amqp from "amqplib";

async function pushJob(job) {
	const conn = await amqp.connect("amqp://localhost");
	const channel = await conn.createChannel();
	const queue = "code_jobs";

	await channel.assertQueue(queue, { durable: true });
	channel.sendToQueue(queue, Buffer.from(JSON.stringify(job)), {
		persistent: true,
	});

	console.log("Job pushed:", job.id);

	setTimeout(() => {
		channel.close();
		conn.close();
	}, 500);
}

// Example usage
// Python: Find factorial of a number
pushJob({
	id: 1,
	language: "python",
	code: `
result = 1
for i in range(1, arg0 + 1):
    result *= i
return result
`,
	args: [5], // factorial of 5
});

// JavaScript: Fibonacci sequence up to n
pushJob({
	id: 2,
	language: "javascript",
	code: `
let a = 0, b = 1;
for (let i = 2; i <= arg0; i++) {
  let temp = a + b;
  a = b;
  b = temp;
}
return b;
`,
	args: [10], // 10th Fibonacci number
});

// C++: Check if number is prime
pushJob({
	id: 3,
	language: "cpp",
	code: `
bool solution(int n) {
    if (n <= 1) return false;
    for (int i = 2; i*i <= n; i++) {
        if (n % i == 0) return false;
    }
    return true;
}
`,
	args: [29],
});

// Java: Reverse a string
pushJob({
	id: 4,
	language: "java",
	code: `
StringBuilder sb = new StringBuilder(arg0);
return sb.reverse().toString();
`,
	args: ["hello world"],
});

// C: Sum of array elements
pushJob({
	id: 5,
	language: "c",
	code: `
int solution(int arr[], int n) {
    int sum = 0;
    for(int i = 0; i < n; i++) {
        sum += arr[i];
    }
    return sum;
}
`,
	args: [[1, 2, 3, 4, 5], 5],
});
