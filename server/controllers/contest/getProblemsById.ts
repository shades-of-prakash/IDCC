import Problem from "../../models/problem.model.js";
import Contest from "../../models/contest.model.js";
import type { Context } from "hono";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import mongoose from "mongoose";

export const getProblemsByUser = async (c: Context) => {
    try {
        const adminId = c.req.query("adminId");
        console.log(adminId, "adminId received");

        if (!adminId) {
            return ErrorResponse(c, "adminId is required", 400);
        }

        const problems = await Problem.find({ submittedBy: adminId })
            .select("-hiddenTests -visibleTests -status")
            .sort({ createdAt: -1 })
            .lean();

        const problemsWithContest = await Promise.all(
            problems.map(async (problem) => {
                let contestData = null;

                if (problem.contestId) {
                    const contestObjectId = new mongoose.Types.ObjectId(
                        problem.contestId,
                    );

                    const contest = await Contest.findById(contestObjectId)
                        .select(
                            "name conductedBy numberOfProblems durationMinutes iconImage",
                        )
                        .lean();

                    if (contest) {
                        contestData = {
                            contestName: contest.name,
                            conductedBy: contest.conductedBy,
                            numberOfProblems: contest.numberOfProblems,
                            durationMinutes: contest.durationMinutes,
                            iconImage: contest.iconImage || null,
                        };
                    }
                }

                return {
                    ...problem,
                    ...(contestData || {}),
                };
            }),
        );

        return SuccessResponse(
            c,
            "Problems fetched successfully",
            200,
            problemsWithContest,
        );
    } catch (err: any) {
        console.error("Error fetching problems:", err);
        return ErrorResponse(c, err.message || "Failed to fetch problems", 500);
    }
};
