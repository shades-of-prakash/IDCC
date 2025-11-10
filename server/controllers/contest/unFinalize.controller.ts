import type { Context } from "hono";
import mongoose from "mongoose";
import Problem from "../../models/problem.model.js";
import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const unfinalizeProblem = async (c: Context) => {
  try {
    const { contestId, problemId } = await c.req.json();

    if (!contestId || !problemId) {
      return ErrorResponse(c, "contestId and problemId are required", 400);
    }

    const problem = await Problem.findOne({ _id: problemId, contestId });

    if (!problem) {
      return ErrorResponse(
        c,
        "Problem not found or does not belong to the contest",
        404,
      );
    }

    if (problem.status === "pending") {
      return ErrorResponse(c, "Problem is already in pending state", 400);
    }

    problem.status = "pending";
    await problem.save();

    await Contest.updateOne(
      { _id: contestId },
      { $pull: { questions: problem._id } },
    );

    return SuccessResponse(
      c,
      "Problem marked as pending and removed from contest questions successfully",
      200,
      problem,
    );
  } catch (err) {
    console.error("Error unfinalizing problem:", err);
    return ErrorResponse(
      c,
      err instanceof Error ? err.message : "Failed to unfinalize problem",
      500,
    );
  }
};
