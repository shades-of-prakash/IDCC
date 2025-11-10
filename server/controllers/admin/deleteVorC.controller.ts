import type { Context } from "hono";
import { Admin } from "../../models/admin.model.js";
import Problem from "../../models/problem.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const deleteVorc = async (c: Context) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      return ErrorResponse(c, "Invalid JSON format", 400);
    }

    const { username } = body;

    if (!username) {
      return ErrorResponse(c, "Username is required to delete user", 400);
    }

    const user = await Admin.findOne({
      username,
      role: { $in: ["volunteer", "coordinator"] },
    });

    if (!user) {
      return ErrorResponse(c, "User not found", 404);
    }

    const deletedProblems = await Problem.deleteMany({ submittedBy: user._id });

    await user.deleteOne();

    return SuccessResponse(
      c,
      "User and submitted problems deleted successfully",
      200,
      {
        username: user.username,
        id: user._id,
        role: user.role,
        deletedProblemsCount: deletedProblems.deletedCount,
      },
    );
  } catch (err) {
    console.error("Error deleting user:", err);
    return ErrorResponse(c, "Internal server error", 500);
  }
};
