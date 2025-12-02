import type { Context } from "hono";
import Problem from "../../models/problem.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import mongoose from "mongoose";

export const getProblemById = async (c: Context) => {
  try {
    const problemId = c.req.param("problemId");

    if (!problemId) {
      return ErrorResponse(c, "problemId is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return ErrorResponse(c, "Invalid problemId", 400);
    }

    const problem = await Problem.findById(problemId);

    if (!problem) {
      return ErrorResponse(c, "Problem not found", 404);
    }

    return SuccessResponse(c, "Problem fetched successfully", 200, problem);
  } catch (err: any) {
    console.error("Error fetching problem:", err);
    return ErrorResponse(c, err.message || "Failed to fetch problem", 500);
  }
};
