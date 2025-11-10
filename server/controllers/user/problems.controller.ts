import type { Context } from "hono";
import { verify } from "hono/jwt";
import { getCookie } from "hono/cookie";
import Session from "../../models/session.model.js";
import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const JWT_SECRET = Bun.env.JWT_SECRET || "supersecretkey";

export const getContestProblems = async (c: Context) => {
  try {
    const token = getCookie(c, "userAuthToken");
    if (!token) return ErrorResponse(c, "Missing authentication cookie", 401);

    const payload = await verify(token, JWT_SECRET);

    console.log("payload", payload);
    const userId = payload.id;
    if (!userId) return ErrorResponse(c, "Invalid token payload", 401);

    const session = await Session.findOne({ userId }).populate("contestId");

    if (!session) return ErrorResponse(c, "No active session found", 403);

    const contestId = session.contestId?._id;
    if (!contestId)
      return ErrorResponse(c, "Contest not linked to session", 400);

    const contest = await Contest.findById(contestId)
      .populate("questions")
      .lean();

    console.log("contest", contest);

    if (!contest) return ErrorResponse(c, "Contest not found", 404);

    return SuccessResponse(c, "Contest problems fetched successfully", 200, {
      contestId: contest._id,
      contestName: contest.name,
      problems: contest.questions,
    });
  } catch (err: any) {
    const message =
      err.message === "jwt expired"
        ? "Authentication expired, please log in again."
        : err.message || "Failed to fetch contest problems";
    return ErrorResponse(c, message, 500);
  }
};
