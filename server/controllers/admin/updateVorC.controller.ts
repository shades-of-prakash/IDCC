import type { Context } from "hono";
import { Admin } from "../../models/admin.model";
import { SuccessResponse, ErrorResponse } from "../../utils/response";
import { hashPassword } from "../../utils/hash";

export const updateVorc = async (c: Context) => {
  try {
    let body;

    try {
      body = await c.req.json();
    } catch {
      return ErrorResponse(c, "Invalid JSON format", 400);
    }

    const { username, name, password, confirmPassword, role } = body;

    console.log(username, name, password, confirmPassword);

    if (!username) {
      return ErrorResponse(c, "Username is required to identify user", 400);
    }

    const user = await Admin.findOne({
      username,
      role: { $in: ["volunteer", "coordinator"] },
    });

    if (!user) {
      return ErrorResponse(c, "User not found", 404);
    }

    if (name?.trim()) {
      user.name = name.trim();
    }

    if (role && ["volunteer", "coordinator"].includes(role)) {
      user.role = role;
    }

    if (password || confirmPassword) {
      if (!password || !confirmPassword) {
        return ErrorResponse(
          c,
          "Both password and confirmPassword are required",
          400,
        );
      }

      if (password !== confirmPassword) {
        return ErrorResponse(c, "Passwords do not match", 400);
      }

      if (password.length < 6) {
        return ErrorResponse(
          c,
          "Password must be at least 6 characters long",
          400,
        );
      }

      user.password = await hashPassword(password);
    }

    await user.save();

    return SuccessResponse(c, "User updated successfully", 200, {
      id: user._id,
      name: user.name,
      username: user.username,
      role: user.role,
    });
  } catch (err: any) {
    console.error("Error updating user:", err);
    return ErrorResponse(c, err.message || "Internal server error", 500);
  }
};
