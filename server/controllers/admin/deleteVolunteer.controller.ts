import type { Context } from "hono";
import { Admin } from "../../models/admin.model";
import { SuccessResponse, ErrorResponse } from "../../utils/response";

export const deleteVolunteer = async (c: Context) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      return ErrorResponse(c, "Invalid JSON format", 400);
    }

    const { username } = body;
    console.log(username);

    if (!username) {
      return ErrorResponse(c, "Username is required to delete volunteer", 400);
    }


    const volunteer = await Admin.findOne({ username, role: "volunteer" });

    if (!volunteer) {
      return ErrorResponse(c, "Volunteer not found", 404);
    }

    await volunteer.deleteOne();

    return SuccessResponse(c, "Volunteer deleted successfully", 200, {
      username: volunteer.username,
      id: volunteer._id,
    });
  } catch (err) {
    console.error(err);
    return ErrorResponse(c, "Internal server error", 500);
  }
};
