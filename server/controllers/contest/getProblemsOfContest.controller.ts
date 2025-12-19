import type { Context } from "hono";
import Problem from "../../models/problem.model.js";
import mongoose from "mongoose";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const getContestWithProblems = async (c: Context) => {
    try {
        const contestId = c.req.query("contestId");

        if (!contestId) {
            return ErrorResponse(c, "contestId is required", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return ErrorResponse(c, "Invalid contestId format", 400);
        }

        const problems = await Problem.find(
            { contestId, isCompleted: true },
            {
                name: 1,
                status: 1,
                submittedBy: 1,
                contestId: 1,
            },
        )
            .populate({
                path: "contestId",
                select: "name conductedBy numberOfProblems durationMinutes teamSize bannerImage",
            })
            .populate({
                path: "submittedBy",
                select: "username name role",
            })
            .sort({ createdAt: -1 })
            .lean();

        if (!problems.length) {
            return SuccessResponse(
                c,
                "No problems found for this contest",
                200,
                {
                    contestDetails: null,
                    problems: [],
                },
            );
        }

        const contestDetails = problems[0].contestId;

        const formattedProblems = problems.map((p) => ({
            problemId: p._id,
            name: p.name,
            status: p.status, // ✅ added
            submittedBy: p.submittedBy
                ? {
                      id: p.submittedBy._id,
                      username: p.submittedBy.username,
                      name: p.submittedBy.name,
                      role: p.submittedBy.role,
                  }
                : null,
        }));

        return SuccessResponse(
            c,
            "Contest details and problems fetched successfully",
            200,
            {
                contestDetails,
                problems: formattedProblems,
            },
        );
    } catch (err) {
        console.error("Error fetching contest problems:", err);
        return ErrorResponse(
            c,
            err instanceof Error ? err.message : "Failed to fetch contest data",
            500,
        );
    }
};
