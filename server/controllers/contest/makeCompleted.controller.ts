import type { Context } from "hono";
import mongoose from "mongoose";
import Problem from "../../models/problem.model.js";
import TestCase from "../../models/testcase.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const addProblemCompleteStatus = async (c: Context) => {
  try {
    const { id } = c.req.param();

    console.log("addProblemCompleteStatus problem id:", id);

    if (!id) {
      return ErrorResponse(c, "Problem id is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return ErrorResponse(c, "Invalid problem id", 400);
    }

    const problem = await Problem.findById(id);

    if (!problem) {
      return ErrorResponse(c, "Problem not found", 404);
    }

    const testcases = await TestCase.find({ problemId: problem._id });

    problem.testcases = testcases.map((tc) => tc._id);

    const totalTestcases = testcases.length;
    const visibleCount = testcases.filter((tc) => !tc.isHidden).length;
    const hiddenCount = testcases.filter((tc) => tc.isHidden).length;

    const hasAnyTestcases = totalTestcases > 0;
    const hasVisible = visibleCount > 0;
    const hasHidden = hiddenCount > 0;
    const hasStatement =
      typeof problem.statement === "string" &&
      problem.statement.trim().length > 0;

    problem.isCompleted =
      hasStatement && hasAnyTestcases && hasVisible && hasHidden;

    await problem.save();

    const payload = {
      problem,
      isCompleted: problem.isCompleted,
      hasStatement,
      hasAnyTestcases,
      hasVisible,
      hasHidden,
      totalTestcases,
      visibleCount,
      hiddenCount,
    };

    return SuccessResponse(
      c,
      "Problem completion status updated successfully",
      200,
      payload,
    );
  } catch (err: any) {
    console.error("Error updating problem completion status:", err);
    return ErrorResponse(
      c,
      err.message || "Failed to update problem completion status",
      500,
    );
  }
};
