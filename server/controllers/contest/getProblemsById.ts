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

        // Excluding status so that it is NOT sent in the response
        const problems = await Problem.find({ submittedBy: adminId })
            .select("-hiddenTests -visibleTests -status")
            .lean()
            .sort({ createdAt: -1 });

        const problemsWithContest = await Promise.all(
            problems.map(async (problem) => {
                let contestData = null;

                if (problem.contestId) {
                    const contestObjectId = new mongoose.Types.ObjectId(
                        problem.contestId,
                    );

                    const contest = await Contest.findById(
                        contestObjectId,
                    ).select(
                        "name conductedBy numberOfProblems durationMinutes",
                    );

                    if (contest) {
                        contestData = {
                            contestName: contest.name,
                            conductedBy: contest.conductedBy,
                            numberOfProblems: contest.numberOfProblems,
                            durationMinutes: contest.durationMinutes,
                        };
                    }
                }

                return {
                    ...problem,
                    ...(contestData || {}),
                };
            }),
        );

        console.log(problemsWithContest, "problems with contest details");

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
