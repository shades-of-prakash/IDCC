import mongoose from "mongoose";
import Problem from "../../models/problem.model.js";
import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

export const updateProblemStatement = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { problemId, statement } = body;

    console.log(problemId, statement);
    if (!problemId || !statement) {
      return ErrorResponse(c, "problemId and statement are required", 400);
    }

    const _id = mongoose.Types.ObjectId.createFromHexString(problemId);

    const problem = await Problem.findById(_id);

    if (!problem) {
      return ErrorResponse(c, "Problem not found", 404);
    }

    const contest = await Contest.findById(problem.contestId);

    if (!contest) {
      return ErrorResponse(c, "Contest not found", 404);
    }

    if (contest.isRunning) {
      return ErrorResponse(
        c,
        "Cannot update problem while contest is running",
        400,
      );
    }

    problem.statement = statement;

    await problem.save();

    return SuccessResponse(
      c,
      "Problem statement updated successfully",
      200,
      problem,
    );
  } catch (err: any) {
    console.error("Failed to update problem statement:", err);
    return ErrorResponse(
      c,
      err.message || "Failed to update problem statement",
      500,
    );
  }
};
