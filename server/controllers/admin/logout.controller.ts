import type { Context } from "hono";
import { getCookie, deleteCookie } from "hono/cookie";
import { SuccessResponse, ErrorResponse } from "../../utils/response";

export const logoutAdmin = async (c: Context) => {
  try {
    const cookie = getCookie(c, "adminAuth");

    console.log(cookie,"cookie")

    if (!cookie) {
      return ErrorResponse(c, "No active session found", 400);
    }

    deleteCookie(c, "adminAuth", {
      path: "/",
    });

    return SuccessResponse(c, "Logout successful", 200);
  } catch (error) {
    console.error("Logout error:", error);
    return ErrorResponse(c, "An error occurred during logout", 500);
  }
};
