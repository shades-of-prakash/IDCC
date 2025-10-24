import type { Context } from "hono";
import Contest from "../../models/contest.model.js";
import Problem from "../../models/problem.model.js";
import User from "../../models/user.model.js";
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

    const contestDetails = await Contest.findById(contestId);
    if (!contestDetails) {
      return ErrorResponse(c, "Contest not found", 404);
    }

    const problems = await Problem.find({ contestId }).sort({ createdAt: -1 });

    const userIdsArray: string[] = problems
      .map((p) => (p.submittedBy ? p.submittedBy.toString() : null))
      .filter((id): id is string => id !== null);

    const userIds = Array.from(new Set(userIdsArray));

    const users = await User.find({ _id: { $in: userIds } }, { username: 1 }).lean();

    const userMap: Record<string, string> = {};
    for (const user of users) {
      userMap[user._id.toString()] = user.username;
    }

    const problemsWithUsername = problems.map((p) => ({
      ...p.toObject(),
      submittedByUsername: userMap[p.submittedBy?.toString() ?? ""] || "Unknown",
    }));

    return SuccessResponse(
      c,
      "Contest details and problems fetched successfully",
      200,
      { contestDetails, problems: problemsWithUsername }
    );
  } catch (err) {
    console.error("Error fetching contest problems:", err);
    return ErrorResponse(
      c,
      err instanceof Error ? err.message : "Failed to fetch contest data",
      500
    );
  }
};
