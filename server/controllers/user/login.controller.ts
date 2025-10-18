import type { Context } from "hono";
import { createHash } from "crypto";
import { sign, verify } from "hono/jwt";
import User from "../../models/user.model.js";
import Contest from "../../models/contest.model.js";
import Session from "../../models/session.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const JWT_SECRET = Bun.env.JWT_SECRET || "supersecretkey";

const hashPassword = (password: string) =>
  createHash("sha256").update(password).digest("hex");

export const loginUser = async (c: Context) => {
  try {
    const {
      username,
      password,
      selectedContest,
      email,
      phone,
      college,
      dept,
      participants,
    } = await c.req.json();

    if (!username || !password || !selectedContest)
      return ErrorResponse(c, "Missing required fields", 400);

    const user = await User.findOne({ username });
    if (!user) return ErrorResponse(c, "Invalid credentials", 401);

    const hashed = hashPassword(password);
    if (hashed !== user.hash) return ErrorResponse(c, "Invalid credentials", 401);

    const contest = await Contest.findById(selectedContest);
    if (!contest) return ErrorResponse(c, "Invalid contest", 404);

    const now = new Date();

let session = await Session.findOne({ userId: user._id, contestId: contest._id });

if (session) {
  // Update lastActive
  session.lastActive = now;

  // Calculate remaining time
  const remainingTime =
    contest.durationMinutes * 60000 - session.elapsedTime;

  if (remainingTime <= 0) {
    return ErrorResponse(c, "Contest time over", 403);
  }

  await session.save();

  return SuccessResponse(c, "Resumed session", 200, {
    token: session.token,
    sessionId: session._id,
    user: {
      username: user.username,
      email: session.email,
      phone: session.phone,
      college: session.college,
      dept: session.dept,
      participants: session.participants,
      contest: session.contestDetails,
      remainingTime,
    },
  });
}

const existingSession = await Session.findOne({
  participants: { $in: participants },
});

if (existingSession) {
  return ErrorResponse(
    c,
    "One or more participants are already part of another session",
    403
  );
}
// If no session exists — create new
const token = await sign(
  {
    id: user._id.toString(),
    username: user.username,
    exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
  },
  JWT_SECRET
);

session = await Session.create({
  userId: user._id,
  contestId: contest._id,
  token,
  email,
  phone,
  college,
  dept,
  participants,
  contestDetails: {
    id: contest._id,
    name: contest.name,
    conductedBy: contest.conductedBy,
    numberOfProblems: contest.numberOfProblems,
    durationMinutes: contest.durationMinutes,
    teamSize: contest.teamSize,
  },
});

return SuccessResponse(c, "New session started", 200, {
  token,
  sessionId: session._id,
  user: {
    username: user.username,
    email,
    phone,
    college,
    dept,
    participants,
    contest: session.contestDetails,
    remainingTime: contest.durationMinutes * 60000,
  },
});

  } catch (err: any) {
    return ErrorResponse(c, err.message || "Failed to login user", 500);
  }
};

export const logoutUser = async (c: Context) => {
  try {
    const { sessionId } = await c.req.json();
    if (!sessionId) return ErrorResponse(c, "Session ID required", 400);

    const session = await Session.findById(sessionId);
    if (!session) return ErrorResponse(c, "Session not found", 404);

    const now = new Date();

    if (session.lastActive) {
      const timeSpent = now.getTime() - new Date(session.lastActive).getTime();
      session.elapsedTime += timeSpent;
    }

    // Pause session
    session.lastActive = now;
    await session.save();

    return SuccessResponse(c, "Logged out successfully (session paused)", 200);
  } catch (err: any) {
    return ErrorResponse(c, err.message || "Failed to logout user", 500);
  }
};
