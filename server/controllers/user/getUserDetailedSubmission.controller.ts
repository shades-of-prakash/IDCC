import type { Context } from "hono";
import mongoose from "mongoose";

import Submission from "../../models/submission.model.js";
import UserDetails from "../../models/userDetails.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const getContestUserProblemSummary = async (c: Context) => {
    try {
        const contestId = c.req.param("contestId");
        const userId = c.req.param("userId");

        console.log(contestId, userId);

        // 1️⃣ Basic validation
        if (
            !contestId ||
            !mongoose.Types.ObjectId.isValid(contestId) ||
            !userId ||
            !mongoose.Types.ObjectId.isValid(userId)
        ) {
            return ErrorResponse(
                c,
                "Invalid or missing contestId / userId",
                400,
            );
        }

        const contestObjectId = new mongoose.Types.ObjectId(contestId);
        const userObjectId = new mongoose.Types.ObjectId(userId);

        // 2️⃣ Ensure user is registered for this contest
        const userDetails = await UserDetails.findOne({
            contestId: contestObjectId,
            userId: userObjectId,
        })
            .populate("userId", "name email username")
            .lean();

        if (!userDetails) {
            return ErrorResponse(
                c,
                "User is not registered for this contest",
                404,
            );
        }

        // 3️⃣ Get all submissions by this user for this contest
        const submissions = await Submission.find({
            userId: userObjectId,
            contestId: contestObjectId,
        })
            .populate({
                path: "problemId",
                // adjust fields as per your Problem schema
                select: "name points statement arguments isCompleted status contest",
            })
            .lean();

        if (!submissions.length) {
            return SuccessResponse(
                c,
                "No submissions found for this user in this contest",
                200,
                {
                    contestId,
                    userId,
                    userDetails,
                    problems: [],
                },
            );
        }

        // 4️⃣ Build clean per-submission / per-problem summary (➕ include code)
        const problemsSummary = submissions.map((sub: any) => {
            const problem = sub.problemId || {};

            return {
                submissionId: sub._id,
                problemId: problem._id,

                // 🧩 Problem info
                problem: {
                    id: problem._id,
                    name: problem.name,
                    statement: problem.statement,
                    arguments: problem.arguments || [],
                    isCompleted: problem.isCompleted,
                    status: problem.status,
                    assignedPoints: problem.points,
                },

                // 🧮 Submission info
                language: sub.language,
                status: sub.status,

                totalTests: sub.totalTests,
                passedTests: sub.passedTests,

                maxPoints: sub.maxPoints,
                pointsPerTest: sub.pointsPerTest,
                awardedPoints: sub.awardedPoints,

                // 🧾 Code
                code: sub.code,

                // timestamps
                createdAt: sub.createdAt,
                updatedAt: sub.updatedAt,
            };
        });

        // 5️⃣ Final response
        return SuccessResponse(
            c,
            "Contest user problem summary fetched successfully",
            200,
            {
                contestId,
                userId,
                userDetails,
                problems: problemsSummary,
            },
        );
    } catch (err: any) {
        console.error("Error fetching contest user problem summary:", err);
        return ErrorResponse(
            c,
            err.message || "Failed to fetch contest user problem summary",
            500,
        );
    }
};
