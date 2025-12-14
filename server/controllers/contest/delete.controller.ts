import Contest from "../../models/contest.model.js";
import Problem from "../../models/problem.model.js";
import User from "../../models/user.model.js";
import Session from "../../models/session.model.js";
import Submission from "../../models/submission.model.js"; // <-- adjust if needed
import UserDetails from "../../models/userDetails.model.js"; // <-- adjust if needed

import * as fs from "fs";
import * as path from "path";
import mongoose from "mongoose";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

// Base uploads directory: <project-root>/uploads
const UPLOADS_BASE = path.join(process.cwd(), "uploads");

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

        /** ---------- DELETE FILES (banner, icon, problems, testcases) ---------- **/
        // All assets for this contest live in: uploads/<contestId>/**
        const contestUploadDir = path.join(UPLOADS_BASE, contestId);

        if (fs.existsSync(contestUploadDir)) {
            try {
                // Recursively delete uploads/<contestId>/...
                fs.rmSync(contestUploadDir, { recursive: true, force: true });
                console.log(`Deleted uploads directory: ${contestUploadDir}`);
            } catch (err) {
                console.error("Failed to delete uploads directory:", err);
            }
        } else {
            console.log(
                `No uploads directory found for contest: ${contestUploadDir}`,
            );
        }

        /** ---------- DELETE RELATED DOCUMENTS ---------- **/
        const deletedProblems = await Problem.deleteMany({ contestId });

        const deletedUsers = await User.deleteMany({ contestId });

        const deletedSessions = await Session.deleteMany({ contestId });

        const deletedSubmissions = await Submission.deleteMany({ contestId });

        const deletedUserDetails = await UserDetails.deleteMany({ contestId });

        await Contest.findByIdAndDelete(contestId);

        console.log(
            `Contest deleted: ${contestId} | Problems: ${deletedProblems.deletedCount}, Users: ${deletedUsers.deletedCount}, Sessions: ${deletedSessions.deletedCount}, Submissions: ${deletedSubmissions.deletedCount}, UserDetails: ${deletedUserDetails.deletedCount}`,
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
                deletedSubmissions: deletedSubmissions.deletedCount,
                deletedUserDetails: deletedUserDetails.deletedCount,
            },
        );
    } catch (err: any) {
        console.error("Contest deletion failed:", err);
        return ErrorResponse(c, err.message || "Failed to delete contest", 500);
    }
};
