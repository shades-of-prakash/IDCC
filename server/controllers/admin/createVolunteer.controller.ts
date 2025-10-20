import type { Context } from "hono";
import { Admin } from "../../models/admin.model";
import { SuccessResponse, ErrorResponse } from "../../utils/response";
import { hashPassword } from "../../utils/hash"; 

export const createVolunteer = async (c: Context) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      return ErrorResponse(c, "Invalid JSON format", 400);
    }

    const { username, name, password, confirmPassword } = body;

    if (!username || !name || !password || !confirmPassword) {
      return ErrorResponse(c, "All fields are required", 400);
    }

    if (password !== confirmPassword) {
      return ErrorResponse(c, "Passwords do not match", 400);
    }

    const existingUser = await Admin.findOne({ username, role: "volunteer" });
    if (existingUser) {
      return ErrorResponse(c, "Username already exists", 409);
    }

    const hashedPassword = await hashPassword(password);

    const newVolunteer = new Admin({
      name,
      username,
      password: hashedPassword,
      role: "volunteer",
    });

    await newVolunteer.save();

    return SuccessResponse(c, "Volunteer created successfully", 201, {
      id: newVolunteer._id,
      name: newVolunteer.name,
      username: newVolunteer.username,
      role: newVolunteer.role,
    });
  } catch (err: any) {
    return ErrorResponse(c, err.message || "Internal server error", 500);
  }
};
