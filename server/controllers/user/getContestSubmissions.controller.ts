import type { Context } from "hono";
import mongoose from "mongoose";

import Submission from "../../models/submission.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const getContestUserSubmissionSummary = async (c: Context) => {
    try {
        const contestId = c.req.param("contestId");

        if (!contestId || !mongoose.Types.ObjectId.isValid(contestId)) {
            return ErrorResponse(c, "Invalid or missing contest ID", 400);
        }

        const contestObjectId = new mongoose.Types.ObjectId(contestId);

        // 🔹 Pagination params
        const pageParam = c.req.query("page");
        const limitParam = c.req.query("limit");

        let page = Number.parseInt(pageParam || "1", 10);
        let limit = Number.parseInt(limitParam || "20", 10);

        if (Number.isNaN(page) || page < 1) page = 1;
        if (Number.isNaN(limit) || limit < 1 || limit > 200) limit = 20;

        const skip = (page - 1) * limit;

        const result = await Submission.aggregate([
            // 1️⃣ Filter submissions for this contest
            {
                $match: {
                    contestId: contestObjectId,
                },
            },

            // 2️⃣ First group: per user + per problem
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        problemId: "$problemId",
                    },
                    bestPointsForProblem: { $max: "$awardedPoints" },
                    attemptsForProblem: { $sum: 1 },
                    lastSubmissionAt: { $max: "$createdAt" },
                    acceptedCountForProblem: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0],
                        },
                    },
                },
            },

            // 3️⃣ Second group: per user (leaderboard stats)
            {
                $group: {
                    _id: "$_id.userId",
                    submissionCount: { $sum: "$attemptsForProblem" },
                    lastSubmissionAt: { $max: "$lastSubmissionAt" },
                    totalPoints: { $sum: "$bestPointsForProblem" },
                    acceptedCount: { $sum: "$acceptedCountForProblem" },
                    problemsSolvedCount: {
                        $sum: {
                            $cond: [
                                { $gt: ["$bestPointsForProblem", 0] },
                                1,
                                0,
                            ],
                        },
                    },
                    problemsSolved: {
                        $addToSet: {
                            $cond: [
                                { $gt: ["$bestPointsForProblem", 0] },
                                "$_id.problemId",
                                null,
                            ],
                        },
                    },
                },
            },

            // 4️⃣ Clean up problemsSolved (remove null)
            {
                $addFields: {
                    problemsSolved: {
                        $setDifference: ["$problemsSolved", [null]],
                    },
                },
            },

            // 5️⃣ Join with userdetails using userId
            {
                $lookup: {
                    from: "userdetails",
                    localField: "_id",
                    foreignField: "userId",
                    as: "userDetails",
                },
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },

            // 6️⃣ Sort leaderboard-style
            {
                $sort: {
                    totalPoints: -1,
                    problemsSolvedCount: -1,
                    submissionCount: 1,
                    lastSubmissionAt: 1,
                },
            },

            // 7️⃣ ✅ Pagination here
            { $skip: skip },
            { $limit: limit },

            // 8️⃣ Final shape
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    submissionCount: 1,
                    lastSubmissionAt: 1,
                    totalPoints: 1,
                    acceptedCount: 1,
                    problemsSolvedCount: 1,
                    problemsSolved: 1,
                    email: "$userDetails.email",
                    phone: "$userDetails.phone",
                    college: "$userDetails.college",
                    dept: "$userDetails.dept",
                    participants: "$userDetails.participants",
                    createdAt: "$userDetails.createdAt",
                },
            },
        ]);

        // 👉 Simple: return just the page data (frontend will infer hasMore)
        return SuccessResponse(
            c,
            "Contest user submissions summary fetched successfully",
            200,
            result,
        );
    } catch (err: any) {
        console.error("Error fetching contest user submissions summary:", err);
        return ErrorResponse(
            c,
            err.message || "Failed to fetch contest submissions summary",
            500,
        );
    }
};
