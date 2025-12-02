import type { Context } from "hono";
import mongoose from "mongoose";
import TestCase from "../../models/testcase.model.js";
import Problem from "../../models/problem.model.js";
import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const updateTestCase = async (c: Context) => {
  try {
    const { id } = c.req.param();
    const body = await c.req.json();

    console.log("updateTestCase id:", id);
    console.log("updateTestCase body:", body);

    if (!id) {
      return ErrorResponse(c, "Testcase id is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ErrorResponse(c, "Invalid testcase id", 400);
    }

    const testCase = await TestCase.findById(id);

    if (!testCase) {
      return ErrorResponse(c, "Testcase not found", 404);
    }

    // 🔍 Determine which problemId to use (existing or new one from body)
    let problemIdToCheck = testCase.problemId;

    if (body.problemId) {
      if (!mongoose.Types.ObjectId.isValid(body.problemId)) {
        return ErrorResponse(c, "Invalid problemId", 400);
      }
      problemIdToCheck = body.problemId;
    }

    // 🔥 Load problem & contest to enforce isRunning rule
    const problem = await Problem.findById(problemIdToCheck);

    if (!problem) {
      return ErrorResponse(c, "Problem not found", 404);
    }

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
        "Cannot update testcase while contest is running",
        400,
      );
    }

    // ✅ Safe to update fields now
    if (body.problemId) {
      testCase.problemId = body.problemId;
    }

    if (body.input !== undefined) {
      testCase.input = body.input;
    }

    if (body.output !== undefined) {
      testCase.output = body.output;
    }

    if (typeof body.isHidden === "boolean") {
      testCase.isHidden = body.isHidden;
    }

    await testCase.save();

    return SuccessResponse(c, "Testcase updated successfully", 200, testCase);
  } catch (err: any) {
    console.error("Error updating testcase:", err);
    return ErrorResponse(c, err.message || "Failed to update testcase", 500);
  }
};
