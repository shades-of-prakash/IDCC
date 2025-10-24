import type { Context } from "hono";
import { getSignedCookie } from "hono/cookie";
import mongoose from "mongoose";
import { Admin } from "../../models/admin.model";
import { SuccessResponse } from "../../utils/response";

const COOKIE_SECRET =
  process.env.COOKIE_SECRET ||
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InByYWthc2giLCJpYXQiOjE3NTUxNDkwMzEsImV4cCI6MTc1NTE1MjYzMX0.rbv56hQPq4HDPpeTvuOFff36aJZaPRmwD3NpeSAX9v8";

export const adminMe = async (c: Context) => {
  const validCookies = ["adminAuth", "coordinatorAuth", "volunteerAuth"];
  let cookieValue = null;

  for (const cookieName of validCookies) {
    cookieValue = await getSignedCookie(c, COOKIE_SECRET, cookieName);
    if (cookieValue) {
      break;
    }
  }

  if (!cookieValue) {
    return c.json({ message: "Not authenticated" }, 401);
  }

  let user;
  try {
    user = JSON.parse(cookieValue);
  } catch {
    return c.json({ message: "Invalid cookie format" }, 400);
  }

  if (!user?.id) {
    return c.json({ message: "Invalid user data in cookie" }, 400);
  }

  let objectId;
  try {
    objectId = mongoose.Types.ObjectId.createFromHexString(user.id);
  } catch {
    return c.json({ message: "Invalid user ID" }, 400);
  }

  const userDoc = await Admin.findById(objectId);
  if (!userDoc) {
    return c.json({ message: "User not found" }, 404);
  }

  const responseUser = {
    id: userDoc._id.toHexString(),
    username: userDoc.username,
    role: userDoc.role,
  };

  return SuccessResponse(c, "Fetched user details", 200, responseUser);
};
