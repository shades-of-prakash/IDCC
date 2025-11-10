import { Context } from "hono";
import { sign } from "hono/jwt";
import { setCookie } from "hono/cookie";
import UserDetails from "../../models/userDetails.model.js";
import Session from "../../models/session.model.js";
import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import User from "../../models/user.model.js";
import { Types } from "mongoose";
import { createHash } from "crypto";

const JWT_SECRET = Bun.env.JWT_SECRET || "supersecretkey";

const hashPassword = (password: string) =>
  createHash("sha256").update(password).digest("hex");

type Participant = {
  name: string;
  regNo: string;
};

type userPayload = {
  username: string;
  password: string;
  contestId: string;
  email: string;
  phone: string;
  college: string;
  dept: string;
  participants: Participant[];
};

export const loginUser = async (c: Context) => {
  try {
    const payload: userPayload = await c.req.json();
    const {
      username,
      password,
      contestId,
      email,
      phone,
      college,
      dept,
      participants,
    } = payload;

    // 🔹 Basic validation
    if (!username || !password) {
      return ErrorResponse(c, "Missing login credentials.", 400);
    }

    const user = await User.findOne({ username });
    if (!user) {
      return ErrorResponse(c, "Invalid username or password.", 401);
    }

    const hashed = hashPassword(password);
    if (hashed !== user.hash) {
      return ErrorResponse(c, "Invalid username or password.", 401);
    }

    const userId = user._id.toString();

    if (!contestId || !email || !participants || participants.length === 0) {
      return ErrorResponse(c, "Missing required registration fields.", 400);
    }

    if (!Types.ObjectId.isValid(contestId)) {
      return ErrorResponse(c, "Invalid contest ID format.", 400);
    }

    // 🔹 Fetch contest and any existing session
    const contest = await Contest.findById(contestId);
    if (!contest) {
      return ErrorResponse(c, "Contest not found.", 404);
    }

    const existingSession = await Session.findOne({ userId, contestId });
    const existingDetails = await UserDetails.findOne({ userId, contestId });

    // 🔹 If contest time has expired
    if (
      existingSession &&
      existingSession.elapsedTime >= contest.durationMinutes * 60 * 1000
    ) {
      return ErrorResponse(
        c,
        "The contest duration has expired. Please contact the event coordinator.",
        403,
      );
    }

    if (
      existingDetails &&
      existingSession &&
      existingSession.elapsedTime === 0
    ) {
      return ErrorResponse(
        c,
        "The contest time has ended. Please contact the event coordinator.",
        403,
      );
    }

    // 🔹 Validate participant details
    const allUserDetails = await UserDetails.find({ contestId, userId });
    let matchingUserDetails = null;

    if (allUserDetails.length > 0) {
      for (const userDetail of allUserDetails) {
        const registeredRegNos = userDetail.participants.map((p) =>
          p.regNo.toLowerCase(),
        );

        const allMatch = participants.every((p) =>
          registeredRegNos.includes(p.regNo.toLowerCase()),
        );

        if (allMatch) {
          matchingUserDetails = userDetail;
          break;
        }

        // 🔹 Allow expansion (1 → 2 members)
        if (userDetail.participants.length === 1 && participants.length === 2) {
          const existingRegNo = userDetail.participants[0].regNo.toLowerCase();
          const newOnes = participants.filter(
            (p) => p.regNo.toLowerCase() !== existingRegNo,
          );

          if (newOnes.length === 1) {
            const existingRegistrations = await UserDetails.find({ contestId });
            const conflictingEntry = existingRegistrations.find((u) =>
              u.participants.some((p) =>
                newOnes.some(
                  (ip) => ip.regNo.toLowerCase() === p.regNo.toLowerCase(),
                ),
              ),
            );

            if (
              conflictingEntry &&
              conflictingEntry.userId.toString() !== userId
            ) {
              return ErrorResponse(
                c,
                `Participant ${newOnes[0].regNo} is already registered by another account.`,
                403,
              );
            }

            userDetail.participants.push(...newOnes);
            await userDetail.save();
            matchingUserDetails = userDetail;
            break;
          }
        }
      }

      if (!matchingUserDetails) {
        return ErrorResponse(
          c,
          "These participant credentials are already registered under another account.",
          403,
        );
      }
    } else {
      // 🔹 Check for duplicate participants before new registration
      const existingRegistrations = await UserDetails.find({ contestId });
      const conflictingEntry = existingRegistrations.find((u) =>
        u.participants.some((p) =>
          participants.some(
            (ip) => ip.regNo.toLowerCase() === p.regNo.toLowerCase(),
          ),
        ),
      );

      if (conflictingEntry && conflictingEntry.userId.toString() !== userId) {
        return ErrorResponse(
          c,
          "These participant credentials are already registered by another account.",
          403,
        );
      }
    }

    // 🔹 Create JWT Token
    const token = await sign(
      {
        id: userId,
        username: user.username,
        contestId,
        exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
      },
      JWT_SECRET,
    );

    // 🔹 Store token in cookie
    setCookie(c, "userAuthToken", token, {
      httpOnly: true,
      secure: Bun.env.NODE_ENV === "production",
      sameSite: "Lax",
      maxAge: 24 * 60 * 60,
      path: "/",
    });

    // 🔹 Create registration if not found (no session creation)
    let registration = matchingUserDetails;
    if (!matchingUserDetails) {
      registration = new UserDetails({
        userId,
        contestId,
        email,
        phone,
        college,
        dept,
        participants,
      });
      await registration.save();
    }

    return SuccessResponse(c, "Login successful.", 200, {
      user: {
        username: user.username,
        id: userId,
        registrationId: registration?._id.toString(),
      },
      contest: {
        id: contest._id.toString(),
        name: contest.name,
        durationMinutes: contest.durationMinutes,
      },
    });
  } catch (err: any) {
    console.error("Login Error:", err);
    return ErrorResponse(c, err.message || "Failed to process login.", 500);
  }
};
