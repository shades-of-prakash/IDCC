const fs = require("fs");

// User solution as a class
class Solution {
	twoSum(nums, target) {
		const map = new Map();
		for (let i = 0; i < nums.length; i++) {
			const complement = target - nums[i];
			if (map.has(complement)) return [map.get(complement), i];
			map.set(nums[i], i);
		}
		return [];
	}
}

// Example test cases
const testCases = [
	{
		input: "[ [2,7,11,15], 9 ]",
		output: "[0,1]",
	},
	{
		input: "[ [3,2,4], 6 ]",
		output: "[1,2]",
	},
];

// Safe JSON parsing
function parseJSONSafe(str) {
	try {
		return JSON.parse(str);
	} catch (e) {
		console.error("Failed to parse JSON:", str);
		return null;
	}
}

// Run a single test case
function runTestCase(solutionInstance, methodName, testCase) {
	const args = parseJSONSafe(testCase.input);
	const expected = parseJSONSafe(testCase.output);

	if (!args || expected === null) return false;

	// Call the method on the class instance
	const result = solutionInstance[methodName](...args);

	const isEqual = JSON.stringify(result) === JSON.stringify(expected);
	return isEqual;
}

// Instantiate the user class
const solution = new Solution();

// Run all test cases
testCases.forEach((tc, idx) => {
	const passed = runTestCase(solution, "twoSum", tc);
	console.log(`Test Case ${idx + 1}: ${passed ? "Passed ✅" : "Failed ❌"}`);
});
