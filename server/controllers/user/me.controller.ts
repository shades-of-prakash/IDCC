import type { Context } from "hono";
import { verify } from "hono/jwt";
import { getCookie } from "hono/cookie";
import User from "../../models/user.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const JWT_SECRET = Bun.env.JWT_SECRET || "supersecretkey";

export const getMe = async (c: Context) => {
  try {
    const token = getCookie(c, "userAuthToken");

    if (!token) {
      return ErrorResponse(c, "Unauthorized: Missing token", 401);
    }

    let payload;
    try {
      payload = await verify(token, JWT_SECRET);
    } catch (err) {
      return ErrorResponse(c, "Invalid or expired token", 401);
    }

    const user = await User.findById(payload.id).select("-hash");
    if (!user) {
      return ErrorResponse(c, "User not found", 404);
    }

    return SuccessResponse(c, "User fetched successfully", 200, { user });
  } catch (err: any) {
    return ErrorResponse(c, err.message || "Failed to fetch user", 500);
  }
};
