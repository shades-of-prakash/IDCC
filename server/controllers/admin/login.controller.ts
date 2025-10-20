import type { Context } from "hono";
import { setSignedCookie } from "hono/cookie";
import { Admin } from "../../models/admin.model";
import { SuccessResponse, ErrorResponse } from "../../utils/response";
import { verifyPassword } from "../../utils/hash";

const COOKIE_SECRET = Bun.env.COOKIE_SECRET || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InByYWthc2giLCJpYXQiOjE3NTUxNDkwMzEsImV4cCI6MTc1NTE1MjYzMX0.rbv56hQPq4HDPpeTvuOFff36aJZaPRmwD3NpeSAX9v8";

export const loginAdmin = async (c: Context) => {
  const { username, password, role } = await c.req.json();

  if (!role || !["admin", "volunteer", "coordinator"].includes(role)) {
    return ErrorResponse(c, "Invalid or missing role", 400);
  }

  const userDoc = await Admin.findOne({ username, role });


  if (!userDoc) {
    return ErrorResponse(c, "Invalid credentials or role", 401);
  }

  const isValid = await verifyPassword(password, userDoc.password);
  if (!isValid) {
    return ErrorResponse(c, "Invalid credentials", 401);
  }

  await setSignedCookie(
    c,
    "adminAuth",
    JSON.stringify({ id: userDoc._id.toString(),username:userDoc.username, role: userDoc.role }),
    COOKIE_SECRET,
    {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24,
    }
  );

  return SuccessResponse(c, "Login successful", 200, {
    id: userDoc._id,
    username: userDoc.username,
    role: userDoc.role,
  });
};
