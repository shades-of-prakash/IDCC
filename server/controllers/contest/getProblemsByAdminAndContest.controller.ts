import Problem from "../../models/problem.model.js";
import type { Context } from "hono";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import mongoose from "mongoose";
export const getProblemsByAdminAndContest = async (c: Context) => {
  try {
    const adminId = c.req.query("adminId");
    const contestId = c.req.query("contestId");

    console.log(adminId)


    if (!adminId || !contestId) {
      return ErrorResponse(c, "Both adminId and contestId are required", 400);
    }


    const adminObjectId = new mongoose.Types.ObjectId(adminId);
    const contestObjectId = new mongoose.Types.ObjectId(contestId);
    const problems = await Problem.find({
      submittedBy: adminObjectId,
      contestId: contestObjectId,
    })
      .populate("contestId", "name conductedBy numberOfProblems durationMinutes")
      .sort({ createdAt: -1 });

    console.log(problems,"p")

    return SuccessResponse(c, "Problems fetched successfully", 200, problems);
  } catch (err: any) {
    return ErrorResponse(c, err.message || "Failed to fetch problems", 500);
  }
};
