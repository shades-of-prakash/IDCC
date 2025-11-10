import type { Context } from "hono";
import { Admin } from "../../models/admin.model";
import { SuccessResponse, ErrorResponse } from "../../utils/response";
import { hashPassword } from "../../utils/hash";

export const createUser = async (c: Context) => {
  try {
    let body;
    try {
      body = await c.req.json();
    } catch (parseError) {
      return ErrorResponse(c, "Invalid JSON format", 400);
    }

    const { username, name, password, confirmPassword, role } = body;

    // Validate required fields
    if (!username || !name || !password || !confirmPassword || !role) {
      return ErrorResponse(c, "All fields are required", 400);
    }

    // Validate password match
    if (password !== confirmPassword) {
      return ErrorResponse(c, "Passwords do not match", 400);
    }

    // Validate role
    if (!["volunteer", "coordinator"].includes(role)) {
      return ErrorResponse(c, "Invalid role", 400);
    }

    // Check for existing username in the same role
    const existingUser = await Admin.findOne({ username, role });
    if (existingUser) {
      return ErrorResponse(
        c,
        `${role.charAt(0).toUpperCase() + role.slice(1)} username already exists`,
        409,
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = new Admin({
      name,
      username,
      password: hashedPassword,
      role,
    });

    await newUser.save();

    return SuccessResponse(
      c,
      `${role.charAt(0).toUpperCase() + role.slice(1)} created successfully`,
      201,
      {
        id: newUser._id,
        name: newUser.name,
        username: newUser.username,
        role: newUser.role,
      },
    );
  } catch (err: any) {
    return ErrorResponse(c, err.message || "Internal server error", 500);
  }
};
