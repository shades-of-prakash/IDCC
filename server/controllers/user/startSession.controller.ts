import type { Context } from "hono";
import { verify } from "hono/jwt";
import { getCookie } from "hono/cookie";
import { Types } from "mongoose";
import Session from "../../models/session.model.js";
import Contest from "../../models/contest.model.js";
import User from "../../models/user.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const JWT_SECRET = Bun.env.JWT_SECRET || "supersecretkey";

export const startSession = async (c: Context) => {
  try {
    const token = getCookie(c, "userAuthToken");

    if (!token) return ErrorResponse(c, "Missing authentication cookie", 401);

    const payload = await verify(token, JWT_SECRET);

    console.log("play", payload);
    const userId = payload.id;
    const username = payload.username;

    const user = await User.findById(userId);
    if (!user) return ErrorResponse(c, "User not found", 404);

    const contestId = user.contestId;
    if (!contestId)
      return ErrorResponse(c, "No contest linked to this user", 400);

    if (!Types.ObjectId.isValid(contestId))
      return ErrorResponse(c, "Invalid contest ID format", 400);

    const contest = await Contest.findById(contestId);
    if (!contest) return ErrorResponse(c, "Invalid contest", 404);

    const now = new Date();

    let session = await Session.findOne({ userId, contestId });

    if (session) {
      const remainingTime =
        contest.durationMinutes * 60000 - session.elapsedTime;

      if (remainingTime <= 0) return ErrorResponse(c, "Contest time over", 403);

      session.lastActive = now;
      await session.save();

      return SuccessResponse(c, "Resumed session", 200, {
        sessionId: session._id,
        remainingTime,
        user: { username },
        contest,
      });
    }

    session = await Session.create({
      userId,
      contestId,
      lastActive: now,
      elapsedTime: 0,
    });

    return SuccessResponse(c, "New session started", 200, {
      sessionId: session._id,
      remainingTime: contest.durationMinutes * 60000,
      user: { username },
      contest,
    });
  } catch (err: any) {
    const errorMessage =
      err.message === "jwt expired"
        ? "Authentication session expired, please log in."
        : err.message || "Failed to start session";

    const status =
      err.name === "CastError" || err.name === "ValidationError" ? 400 : 500;

    return ErrorResponse(c, errorMessage, status);
  }
};
