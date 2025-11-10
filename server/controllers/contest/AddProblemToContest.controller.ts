import type { Context } from "hono";
import mongoose from "mongoose";
import Contest from "../../models/contest.model.js";
import Problem from "../../models/problem.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const finalizeProblem = async (c: Context) => {
  try {
    const { contestId, problemId } = await c.req.json();

    if (!contestId || !problemId)
      return ErrorResponse(c, "contestId and problemId are required", 400);

    const updatedProblem = await Problem.findByIdAndUpdate(
      problemId,
      { status: "finalized", contestId },
      { new: true },
    );

    if (!updatedProblem) return ErrorResponse(c, "Problem not found", 404);

    const contest = await Contest.findById(contestId);
    if (!contest) return ErrorResponse(c, "Contest not found", 404);

    const alreadyExists = contest.questions.some(
      (pId) => pId.toString() === problemId,
    );

    if (!alreadyExists) {
      contest.questions.push(updatedProblem._id);
      await contest.save();
    }

    return SuccessResponse(
      c,
      "Problem finalized and added to contest successfully",
      200,
      updatedProblem,
    );
  } catch (err) {
    console.error("Error finalizing problem:", err);
    return ErrorResponse(
      c,
      err instanceof Error ? err.message : "Failed to finalize problem",
      500,
    );
  }
};
