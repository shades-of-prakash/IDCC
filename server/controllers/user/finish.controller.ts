import type { Context } from "hono";
import { verify } from "hono/jwt";
import { getCookie, deleteCookie } from "hono/cookie"; // ✅ use deleteCookie
import { Types } from "mongoose";
import Session from "../../models/session.model.js";
import Contest from "../../models/contest.model.js";
import User from "../../models/user.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const JWT_SECRET = Bun.env.JWT_SECRET || "supersecretkey";

export const finishSession = async (c: Context) => {
    try {
        const token = getCookie(c, "userAuthToken");
        if (!token)
            return ErrorResponse(c, "Missing authentication cookie", 401);

        const payload = await verify(token, JWT_SECRET);
        const userId = payload.id;

        const user = await User.findById(userId);
        if (!user) return ErrorResponse(c, "User not found", 404);

        const contestId = user.contestId;
        if (!contestId)
            return ErrorResponse(c, "No contest linked to this user", 400);

        if (!Types.ObjectId.isValid(contestId))
            return ErrorResponse(c, "Invalid contest ID format", 400);

        const contest = await Contest.findById(contestId);
        if (!contest) return ErrorResponse(c, "Invalid contest", 404);

        let session = await Session.findOne({ userId, contestId });
        if (!session) return ErrorResponse(c, "Session not found", 404);

        // Already finished → delete token & return
        if (session.isFinished) {
            deleteCookie(c, "userAuthToken"); // ✅ delete cookie
            return SuccessResponse(c, "Session already finished", 200, {
                sessionId: session._id,
                totalElapsedTime: session.elapsedTime,
                finishedAt: session.finishedAt,
            });
        }

        const now = new Date();

        const lastActive = new Date(session.lastActive || now);
        const sinceLastActive = now.getTime() - lastActive.getTime();

        let updatedElapsedTime = session.elapsedTime || 0;

        if (sinceLastActive > 0) {
            updatedElapsedTime += sinceLastActive;
        }

        const contestDurationMs = contest.durationMinutes * 60000;
        if (updatedElapsedTime > contestDurationMs) {
            updatedElapsedTime = contestDurationMs;
        }

        // Mark finished
        session.elapsedTime = updatedElapsedTime;
        session.lastActive = now;
        session.isFinished = true;
        session.finishedAt = now;

        await session.save();

        // ❌ Delete user token cookie
        deleteCookie(c, "userAuthToken");

        return SuccessResponse(c, "Session finished", 200, {
            sessionId: session._id,
            totalElapsedTime: updatedElapsedTime,
            finishedAt: session.finishedAt,
        });
    } catch (err: any) {
        const errorMessage =
            err.message === "jwt expired"
                ? "Authentication session expired, please log in."
                : err.message || "Failed to finish session";

        const status =
            err.name === "CastError" || err.name === "ValidationError"
                ? 400
                : 500;

        return ErrorResponse(c, errorMessage, status);
    }
};
