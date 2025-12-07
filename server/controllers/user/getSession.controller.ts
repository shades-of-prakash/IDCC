import { Context } from "hono";
import { verify } from "hono/jwt";
import { getCookie } from "hono/cookie";
import User from "../../models/user.model";
import Contest from "../../models/contest.model";
import Session from "../../models/session.model";
import { SuccessResponse, ErrorResponse } from "../../utils/response";

const JWT_SECRET = Bun.env.JWT_SECRET || "supersecretkey";

export const getSession = async (c: Context) => {
    try {
        const token = getCookie(c, "userAuthToken");
        if (!token)
            return ErrorResponse(c, "Missing authentication cookie", 401);

        const payload = await verify(token, JWT_SECRET);
        const userId = payload.id;
        if (!userId)
            return ErrorResponse(c, "Invalid authentication token", 401);

        const user = await User.findById(userId);
        if (!user) return ErrorResponse(c, "User not found", 404);

        const contestId = user.contestId;
        if (!contestId)
            return ErrorResponse(c, "No contest linked to this user", 400);

        const contest = await Contest.findById(contestId);
        if (!contest) return ErrorResponse(c, "Contest not found", 404);

        const session = await Session.findOne({ userId, contestId });
        if (!session)
            return ErrorResponse(
                c,
                "No active session found. Please start again.",
                404,
            );

        const now = new Date();
        const contestDurationMs = contest.durationMinutes * 60000;

        // ✅ Calculate real-time drift since last activity
        const elapsedSinceLastActive =
            now.getTime() - session.lastActive.getTime();
        const correctedElapsed = Math.min(
            session.elapsedTime + elapsedSinceLastActive,
            contestDurationMs,
        );

        const remainingTime = Math.max(0, contestDurationMs - correctedElapsed);

        // ✅ Auto-correct stored elapsed time if drift found
        if (correctedElapsed !== session.elapsedTime) {
            session.elapsedTime = correctedElapsed;
            session.lastActive = now;
            await session.save();
        }

        if (remainingTime <= 0) {
            return ErrorResponse(c, "Contest time over", 403);
        }

        return SuccessResponse(c, "Fetched existing session", 200, {
            sessionId: session._id,
            remainingTime,
            user: { username: user.username },
            contest,
        });
    } catch (err: any) {
        const errorMessage =
            err?.message === "jwt expired"
                ? "Authentication session expired, please log in again."
                : err?.message || "Failed to fetch session";

        const status =
            err?.name === "CastError" || err?.name === "ValidationError"
                ? 400
                : 500;

        return ErrorResponse(c, errorMessage, status);
    }
};
