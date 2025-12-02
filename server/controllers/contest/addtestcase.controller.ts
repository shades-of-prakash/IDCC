import type { Context } from "hono";
import mongoose from "mongoose";
import Problem from "../../models/problem.model.js";
import TestCase from "../../models/testcase.model.js";
import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const addTestCase = async (c: Context) => {
  try {
    const body = await c.req.json();
    console.log("addTestCase body:", body);

    const { problemId, input, output, isHidden } = body;

    if (!problemId) {
      return ErrorResponse(c, "problemId is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return ErrorResponse(c, "Invalid problemId", 400);
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return ErrorResponse(c, "Problem not found", 404);
    }

    // 🔥 Block adding testcase if the contest is running
    if (!problem.contestId) {
      return ErrorResponse(c, "Problem is not linked to any contest", 400);
    }

    const contest = await Contest.findById(problem.contestId);

    if (!contest) {
      return ErrorResponse(c, "Contest not found", 404);
    }

    if (contest.isRunning) {
      return ErrorResponse(
        c,
        "Cannot add testcase while contest is running",
        400,
      );
    }

    if (!Array.isArray(problem.arguments)) {
      return ErrorResponse(c, "Problem arguments not defined", 400);
    }

    if (typeof input !== "object" || Array.isArray(input) || input === null) {
      return ErrorResponse(c, "input must be an object", 400);
    }

    // Validate each argument dynamically
    for (const argDef of problem.arguments) {
      const { name, type } = argDef;

      if (!(name in input)) {
        return ErrorResponse(c, `Missing argument '${name}'`, 400);
      }

      const value = input[name];

      if (type === "number" && typeof value !== "number") {
        return ErrorResponse(c, `'${name}' must be a number`, 400);
      }

      if (type === "string" && typeof value !== "string") {
        return ErrorResponse(c, `'${name}' must be a string`, 400);
      }

      if (type === "boolean" && typeof value !== "boolean") {
        return ErrorResponse(c, `'${name}' must be a boolean`, 400);
      }

      if (type.endsWith("[]") && !Array.isArray(value)) {
        return ErrorResponse(c, `'${name}' must be an array`, 400);
      }
    }

    // output must be string
    if (typeof output !== "string") {
      return ErrorResponse(c, "output must be a string", 400);
    }

    // 🔹 Generate rawInput from problem.arguments + input
    const lines: string[] = problem.arguments.map((argDef: any) => {
      const { name } = argDef;
      const value = input[name];

      if (Array.isArray(value)) {
        return value.join(" ");
      }

      if (typeof value === "object" && value !== null) {
        return JSON.stringify(value);
      }

      return String(value);
    });

    const rawInput = lines.join("\n") + "\n";

    const testCase = await TestCase.create({
      problemId,
      input,
      rawInput, // generated here
      output,
      isHidden: isHidden ?? false,
    });

    console.log("testcase", testCase);

    return SuccessResponse(c, "Testcase added successfully", 201, testCase);
  } catch (err: any) {
    console.error("Error adding testcase:", err);
    return ErrorResponse(c, err.message || "Failed to add testcase", 500);
  }
};
