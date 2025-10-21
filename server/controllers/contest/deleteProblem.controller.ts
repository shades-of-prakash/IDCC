import Problem from "../../models/problem.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

export const deleteProblem = async (c: Context) => {
  try {
    const id = c.req.param("problemId");

    if (!id) {
      return ErrorResponse(c, "Problem ID is required", 400);
    }

    const deletedProblem = await Problem.findByIdAndDelete(id);

    if (!deletedProblem) {
      return ErrorResponse(c, "Problem not found", 404);
    }

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
