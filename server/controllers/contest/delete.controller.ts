import Contest from "../../models/contest.model.js";
import Problem from "../../models/problem.model.js";
import User from "../../models/user.model.js";
import Session from "../../models/session.model.js";
import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

const UPLOADS_PATH = path.join("uploads", "contests");

export const deleteContest = async (c: Context) => {
  try {
    const contestId = c.req.param("contestId");

    if (!contestId) {
      return ErrorResponse(c, "Contest ID is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(contestId)) {
      return ErrorResponse(c, "Invalid contest ID", 400);
    }

    const contest = await Contest.findById(contestId);
    if (!contest) {
      return ErrorResponse(c, "Contest not found", 404);
    }

    if (contest.bannerImage) {
      const filename = path.basename(contest.bannerImage);
      const filePath = path.join(UPLOADS_PATH, filename);

      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
          console.log(`Deleted banner image: ${filePath}`);
        } catch (err) {
          console.error("Failed to delete banner image:", err);
        }
      }
    }

    const deletedProblems = await Problem.deleteMany({ contestId });

    const deletedUsers = await User.deleteMany({ contestId });

    const deletedSessions = await Session.deleteMany({ contestId });

    await Contest.findByIdAndDelete(contestId);

    console.log(
      `Contest deleted: ${contestId} | Problems: ${deletedProblems.deletedCount}, Users: ${deletedUsers.deletedCount}, Sessions: ${deletedSessions.deletedCount}`,
    );

    return SuccessResponse(
      c,
      "Contest and all related data deleted successfully",
      200,
      {
        deletedId: contestId,
        deletedProblems: deletedProblems.deletedCount,
        deletedUsers: deletedUsers.deletedCount,
        deletedSessions: deletedSessions.deletedCount,
      },
    );
  } catch (err: any) {
    console.error("Contest deletion failed:", err);
    return ErrorResponse(c, err.message || "Failed to delete contest", 500);
  }
};
