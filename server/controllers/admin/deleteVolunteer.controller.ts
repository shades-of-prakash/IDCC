import type { Context } from "hono";
import { Admin } from "../../models/admin.model.js";
import Problem from "../../models/problem.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const deleteVolunteer = async (c: Context) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      return ErrorResponse(c, "Invalid JSON format", 400);
    }

    const { username } = body;

    if (!username) {
      return ErrorResponse(c, "Username is required to delete volunteer", 400);
    }

    // Find volunteer by username and role
    const volunteer = await Admin.findOne({ username, role: "volunteer" });
    if (!volunteer) {
      return ErrorResponse(c, "Volunteer not found", 404);
    }

    // Delete all problems submitted by this volunteer
    const deletedProblems = await Problem.deleteMany({
      submittedBy: volunteer._id,
    });

    // Delete the volunteer
    await volunteer.deleteOne();

    return SuccessResponse(
      c,
      "Volunteer and submitted problems deleted successfully",
      200,
      {
        username: volunteer.username,
        id: volunteer._id,
        deletedProblemsCount: deletedProblems.deletedCount,
      },
    );
  } catch (err) {
    console.error("Error deleting volunteer:", err);
    return ErrorResponse(c, "Internal server error", 500);
  }
};
