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
    const userId = payload.id;
    if (!userId) return ErrorResponse(c, "Invalid token payload", 401);

    const session = await Session.findOne({ userId }).populate("contestId");
    if (!session) return ErrorResponse(c, "No active session found", 403);

    const contestId = session.contestId?._id;
    if (!contestId)
      return ErrorResponse(c, "Contest not linked to session", 400);

    const contest = await Contest.findById(contestId)
      .populate({
        path: "questions",
        populate: {
          path: "testcases",
          model: "TestCase",
        },
      })
      .lean();

    if (!contest) return ErrorResponse(c, "Contest not found", 404);

    const problems = contest.questions.map((q: any) => ({
      id: q._id,
      name: q.name,
      points: q.points,
      arguments: q.arguments,
      statement: q.statement,
      testcases: q.testcases?.filter((t: any) => !t.isHidden && !t.hidden),
    }));

    return SuccessResponse(c, "Contest problems fetched successfully", 200, {
      contestId: contest._id,
      contestName: contest.name,
      languages: contest.languages || [], //  ✅ ADDED HERE
      problems,
    });
  } catch (err: any) {
    const message =
      err.message === "jwt expired"
        ? "Authentication expired, please log in again."
        : err.message || "Failed to fetch contest problems";
    return ErrorResponse(c, message, 500);
  }
};
