import type { Context } from "hono";
import Problem from "../../models/problem.model.js";
import mongoose from "mongoose";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const getContestWithProblems = async (c: Context) => {
  try {
    const contestId = c.req.query("contestId");

    if (!contestId) {
      return ErrorResponse(c, "contestId is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(contestId)) {
      return ErrorResponse(c, "Invalid contestId format", 400);
    }

    const problems = await Problem.find({ contestId })
      .populate({
        path: "contestId",
        select:
          "name conductedBy numberOfProblems durationMinutes teamSize bannerImage",
      })
      .populate({
        path: "submittedBy",
        select: "username name role",
      })
      .sort({ createdAt: -1 })
      .lean();

    // ✅ If no problems found, still return success with empty array
    if (!problems.length) {
      return SuccessResponse(c, "No problems found for this contest", 200, {
        contestDetails: null,
        problems: [],
      });
    }

    const contestDetails = problems[0].contestId;

    return SuccessResponse(
      c,
      "Contest details and problems fetched successfully",
      200,
      { contestDetails, problems },
    );
  } catch (err) {
    console.error("Error fetching contest problems:", err);
    return ErrorResponse(
      c,
      err instanceof Error ? err.message : "Failed to fetch contest data",
      500,
    );
  }
};
