import type { Context, Next } from "hono";
import { getSignedCookie } from "hono/cookie";
import { ErrorResponse } from "../utils/response.js";

const COOKIE_SECRET =
  process.env.COOKIE_SECRET ||
  "your_default_secret_here";

export const requireRole = (allowedRoles: string[]) => {
  return async (c: Context, next: Next) => {
    try {
      const cookie = await getSignedCookie(c, "adminAuth", COOKIE_SECRET);
      if (!cookie) {
        return ErrorResponse(c, "Not authenticated", 401);
      }

      const user = JSON.parse(cookie);
      if (!allowedRoles.includes(user.role)) {
        return ErrorResponse(c, "Forbidden: Insufficient permissions", 403);
      }

      (c as any).user = user;

      await next();
    } catch (err) {
      console.error("Auth middleware error:", err);
      return ErrorResponse(c, "Authentication failed", 500);
    }
  };
};
