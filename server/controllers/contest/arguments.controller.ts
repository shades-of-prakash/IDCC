import type { Context } from "hono";
import Problem from "../../models/problem.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import mongoose from "mongoose";

export const addProblemArguments = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { problemId, arguments: args } = body;

    if (!problemId) {
      return ErrorResponse(c, "problemId is required", 400);
    }

    if (!Array.isArray(args) || args.length === 0) {
      return ErrorResponse(c, "arguments must be a non-empty array", 400);
    }

    for (const arg of args) {
      if (!arg.name || !arg.type) {
        return ErrorResponse(
          c,
          "Each argument must have 'name' and 'type'",
          400,
        );
      }
    }

    if (!mongoose.Types.ObjectId.isValid(problemId)) {
      return ErrorResponse(c, "Invalid problemId", 400);
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      problemId,
      { $set: { arguments: args } },
      { new: true },
    );

    if (!updatedProblem) {
      return ErrorResponse(c, "Problem not found", 404);
    }

    return SuccessResponse(
      c,
      "Arguments added successfully",
      200,
      updatedProblem,
    );
  } catch (err: any) {
    console.error("Error adding arguments:", err);
    return ErrorResponse(c, err.message || "Failed to add arguments", 500);
  }
};
