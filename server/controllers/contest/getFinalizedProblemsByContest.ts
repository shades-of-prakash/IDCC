import type { Context } from "hono";
import Problem from "../../models/problem.model.js";
import mongoose from "mongoose";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const getFinalizedProblemsByContest = async (c: Context) => {
  try {
    const contestId = c.req.query("contestId");

    if (!contestId) {
      return ErrorResponse(c, "contestId is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(contestId)) {
      return ErrorResponse(c, "Invalid contestId format", 400);
    }

    const problems = await Problem.find(
      { contestId, status: "finalized" },
      { name: 1, statement: 1, points: 1, _id: 0 },
    ).sort({ createdAt: -1 });

    if (problems.length === 0) {
      return SuccessResponse(c, "No finalized problems found", 200, []);
    }

    return SuccessResponse(
      c,
      "Finalized problems fetched successfully",
      200,
      problems,
    );
  } catch (err) {
    console.error("Error fetching finalized problems:", err);
    return ErrorResponse(
      c,
      err instanceof Error ? err.message : "Failed to fetch problems",
      500,
    );
  }
};
