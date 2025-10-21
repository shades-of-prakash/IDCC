import type { Context } from "hono";
import Contest from "../../models/contest.model.js";
import Problem from "../../models/problem.model.js";
import mongoose from "mongoose";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const getContestWithProblems = async (c: Context) => {
  try {
    const contestId = c.req.query("contestId");
    console.log("contest", contestId);

    if (!contestId) {
      return ErrorResponse(c, "contestId is required", 400);
    }

    const contestObjectId = new mongoose.Types.ObjectId(contestId);

    const contestDetails = await Contest.findById(contestObjectId);

    if (!contestDetails) {
      return ErrorResponse(c, "Contest not found", 404);
    }

    const problems = await Problem.find({ contestId: contestId }).sort({
      createdAt: -1,
    });
    console.log(problems, "ppp");

    return SuccessResponse(
      c,
      "Contest details and problems fetched successfully",
      200,
      { contestDetails, problems },
    );
  } catch (err: any) {
    console.error("Error fetching contest problems:", err);
    return ErrorResponse(c, err.message || "Failed to fetch contest data", 500);
  }
};
