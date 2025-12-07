import type { Context } from "hono";
import mongoose from "mongoose";
import { verify } from "hono/jwt";
import { getCookie } from "hono/cookie";

import Submission from "../../models/submission.model.js";
import User from "../../models/user.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const JWT_SECRET = Bun.env.JWT_SECRET || "supersecretkey";

export const getUserSubmissions = async (c: Context) => {
    try {
        const token = getCookie(c, "userAuthToken");
        if (!token) {
            return ErrorResponse(c, "Unauthorized: Missing token", 401);
        }

        let payload;
        try {
            payload = await verify(token, JWT_SECRET);
        } catch (err) {
            return ErrorResponse(c, "Invalid or expired token", 401);
        }

        const userId = payload.id;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return ErrorResponse(c, "Invalid user id", 400);
        }

        const user = await User.findById(userId).select("-hash");
        if (!user) {
            return ErrorResponse(c, "User not found", 404);
        }

        // Fetch only problemId and createdAt
        const submissions = await Submission.find(
            { userId: userId },
            { problemId: 1, createdAt: 1 },
        ).sort({ createdAt: -1 });

        // Map minimal submission list
        const submissionList = submissions.map((s) => ({
            problemId: s.problemId?.toString(),
            createdAt: s.createdAt,
        }));

        // Unique problem IDs
        const questionIds = [
            ...new Set(
                submissions
                    .map((s) => s.problemId)
                    .filter(Boolean)
                    .map((id) => id.toString()),
            ),
        ];

        // Latest submission time per problem
        const latestSubmissions: Record<
            string,
            { problemId: string; latest: Date }
        > = {};

        submissions.forEach((s) => {
            const pid = s.problemId?.toString();
            if (!pid) return;

            if (!latestSubmissions[pid]) {
                latestSubmissions[pid] = {
                    problemId: pid,
                    latest: s.createdAt,
                };
            }
        });

        return SuccessResponse(
            c,
            "User submissions fetched successfully",
            200,
            {
                questions: questionIds,
                submissions: submissionList,
                latestSubmissions: Object.values(latestSubmissions),
            },
        );
    } catch (err: any) {
        console.error("Error fetching submission problem IDs:", err);
        return ErrorResponse(
            c,
            err.message || "Failed to fetch user problem IDs",
            500,
        );
    }
};
