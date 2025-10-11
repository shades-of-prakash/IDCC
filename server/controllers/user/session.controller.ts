import type { Context } from "hono";
import { verify } from "hono/jwt";
import Session from "../../models/session.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const getSessionById = async (c: Context) => {
  try {
    const sessionId = c.req.param("sessionId");
    if (!sessionId) return ErrorResponse(c, "Session ID required", 400);

    const authHeader = c.req.header("Authorization");
    if (!authHeader) return ErrorResponse(c, "Missing token", 401);

    const token = authHeader.replace("Bearer ", "").trim();
    if (!token) return ErrorResponse(c, "Invalid token", 401);

    let payload;
    try {
      payload = await verify(token, JWT_SECRET, "HS256");
    } catch (err) {
      return ErrorResponse(c, "Invalid or expired token", 401);
    }

    const session = await Session.findById(sessionId);
    if (!session) return ErrorResponse(c, "Session not found", 404);

    if (session.token !== token) return ErrorResponse(c, "Unauthorized", 403);

    const contestDurationMs = session.contestDetails.durationMinutes * 60000;
    const now = new Date();

    // Calculate how much time passed since last active (only if user is online)
    if (session.lastActive) {
      const timeSinceLastActive =
        now.getTime() - new Date(session.lastActive).getTime();

      // If user was already active, accumulate elapsed time
      session.elapsedTime += timeSinceLastActive;
      session.lastActive = now;
    }

    const remainingTime = contestDurationMs - session.elapsedTime;

    if (remainingTime <= 0) {
      return ErrorResponse(c, "Contest time is over", 403);
    }

    await session.save();

    return SuccessResponse(c, "Session resumed", 200, {
      token: session.token,
      sessionId: session._id,
      user: {
        username: payload.username,
        email: session.email,
        phone: session.phone,
        college: session.college,
        dept: session.dept,
        participants: session.participants,
        contest: session.contestDetails,
        remainingTime,
      },
    });
  } catch (err: any) {
    return ErrorResponse(c, err.message || "Failed to fetch session", 500);
  }
};

export const updateSessionElapsed = async (c: Context) => {
  try {
    const sessionId = c.req.param("id");
    if (!sessionId) return ErrorResponse(c, "Session ID required", 400);

    const { elapsedTime: clientElapsedTime } = await c.req.json(); // in milliseconds
    if (clientElapsedTime == null)
      return ErrorResponse(c, "Elapsed time required", 400);

    const session = await Session.findById(sessionId);
    if (!session) return ErrorResponse(c, "Session not found", 404);

    const now = new Date();

    // If session has lastActive, accumulate elapsed time
    if (session.lastActive) {
      const delta = now.getTime() - new Date(session.lastActive).getTime();
      session.elapsedTime = (session.elapsedTime || 0) + delta;
    }

    // Ensure elapsedTime from client is included (in case of manual sync)
    session.elapsedTime = Math.max(session.elapsedTime, clientElapsedTime);

    // Update lastActive to now
    session.lastActive = now;

    await session.save();

    const contestDurationMs = session.contestDetails.durationMinutes * 60 * 1000;
    const remainingTime = contestDurationMs - session.elapsedTime;

    return SuccessResponse(c, "Elapsed time updated", 200, {
      remainingTime: remainingTime > 0 ? remainingTime : 0,
      elapsedTime: session.elapsedTime,
    });
  } catch (err: any) {
    return ErrorResponse(c, err.message || "Failed to update session", 500);
  }
};