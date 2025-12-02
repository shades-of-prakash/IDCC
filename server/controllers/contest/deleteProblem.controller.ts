import mongoose from "mongoose";
import Problem from "../../models/problem.model.js";
import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

export const deleteProblem = async (c: Context) => {
  try {
    const id = c.req.param("problemId");

    if (!id) {
      return ErrorResponse(c, "Problem ID is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ErrorResponse(c, "Invalid Problem ID", 400);
    }

    // First fetch the problem (don't delete yet)
    const problem = await Problem.findById(id);

    if (!problem) {
      return ErrorResponse(c, "Problem not found", 404);
    }

    // If problem is linked to a contest, check if it is running
    if (problem.contestId) {
      const contest = await Contest.findById(problem.contestId);

      if (!contest) {
        return ErrorResponse(c, "Contest not found", 404);
      }

      if (contest.isRunning) {
        return ErrorResponse(
          c,
          "Cannot delete problem while contest is running",
          400,
        );
      }
    }

    // Safe to delete now
    const deletedProblem = await Problem.findByIdAndDelete(id);

    return SuccessResponse(
      c,
      "Problem deleted successfully",
      200,
      deletedProblem,
    );
  } catch (err: any) {
    console.error("Problem deletion failed:", err);
    return ErrorResponse(c, err.message || "Failed to delete problem", 500);
  }
};
