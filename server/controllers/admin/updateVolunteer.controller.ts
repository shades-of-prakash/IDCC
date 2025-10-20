import type { Context } from "hono";
import { Admin } from "../../models/admin.model";
import { SuccessResponse, ErrorResponse } from "../../utils/response";
import { hashPassword } from "../../utils/hash"; 

export const updateVolunteer = async (c: Context) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      return ErrorResponse(c, "Invalid JSON format", 400);
    }

    const { username, name, password, confirmPassword } = body;

    if (!username) {
      return ErrorResponse(c, "Username is required to identify volunteer", 400);
    }

    const volunteer = await Admin.findOne({ username, role: "volunteer" });
    if (!volunteer) {
      return ErrorResponse(c, "Volunteer not found", 404);
    }

    if (name) volunteer.name = name;

    if (password || confirmPassword) {
      if (!password || !confirmPassword) {
        return ErrorResponse(c, "Both password and confirmPassword are required", 400);
      }
      if (password !== confirmPassword) {
        return ErrorResponse(c, "Passwords do not match", 400);
      }
      // Hash the new password with crypto util
      volunteer.password = await hashPassword(password);
    }

    await volunteer.save();

    return SuccessResponse(c, "Volunteer updated successfully", 200, {
      id: volunteer._id,
      name: volunteer.name,
      username: volunteer.username,
      role: volunteer.role,
    });
  } catch (err: any) {
    console.error(err);
    return ErrorResponse(c, err.message || "Internal server error", 500);
  }
};
