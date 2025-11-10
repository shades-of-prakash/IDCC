import type { Context } from "hono";
import { verify } from "hono/jwt";
import { getCookie } from "hono/cookie";
import Session from "../../models/session.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const JWT_SECRET = Bun.env.JWT_SECRET || "supersecretkey";

export const updateElapsedTime = async (c: Context) => {
  try {
    const token = getCookie(c, "userAuthToken");
    if (!token) return ErrorResponse(c, "Missing authentication cookie", 401);

    const payload = await verify(token, JWT_SECRET);
    const userId = payload.id;

    const { contestId, elapsedTime } = await c.req.json();
    if (!contestId) return ErrorResponse(c, "Contest ID required", 400);
    if (typeof elapsedTime !== "number" || elapsedTime < 0)
      return ErrorResponse(c, "Invalid elapsedTime", 400);

    const session = await Session.findOne({ userId, contestId }).populate(
      "contestId",
    );
    if (!session) return ErrorResponse(c, "Session not found", 404);

    const contest = session.contestId as any;
    const totalDurationMs = contest.durationMinutes * 60000;

    // ✅ Only increase elapsed time
    const newElapsedTime = Math.min(
      Math.max(session.elapsedTime, elapsedTime),
      totalDurationMs,
    );

    session.elapsedTime = newElapsedTime;
    session.lastActive = new Date();
    await session.save();

    const remainingTime = Math.max(0, totalDurationMs - newElapsedTime);

    return SuccessResponse(c, "Elapsed time updated successfully", 200, {
      sessionId: session._id,
      elapsedTime: newElapsedTime,
      remainingTime,
    });
  } catch (err: any) {
    const message =
      err.message === "jwt expired"
        ? "Authentication session expired, please log in."
        : err.message || "Failed to update elapsed time";
    return ErrorResponse(c, message, 500);
  }
};
