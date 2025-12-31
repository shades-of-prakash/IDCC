import Problem from "../../models/problem.model.js";
import Contest from "../../models/contest.model.js";
import type { Context } from "hono";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import mongoose from "mongoose";

import Testcase from "../../models/testcase.model.js";

export const getPreviewById = async (c: Context) => {
    try {
        const problemId = c.req.param("problemId");

        if (!problemId) {
            return ErrorResponse(c, "problemId is required", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return ErrorResponse(c, "Invalid problemId", 400);
        }

        const problem = await Problem.findById(problemId)
            .populate({
                path: "submittedBy",
                select: "username role",
            })
            .lean();

        if (!problem) {
            return ErrorResponse(c, "Problem not found", 404);
        }

        // ✅ FETCH ALL TESTCASES BY problemId
        const testcases = await Testcase.find({ problemId })
            .sort({ createdAt: 1 })
            .lean();

        let contestData = null;

        if (problem.contestId) {
            const contest = await Contest.findById(problem.contestId)
                .select(
                    "name conductedBy numberOfProblems durationMinutes iconImage bannerImage",
                )
                .lean();

            if (contest) {
                contestData = {
                    contestName: contest.name,
                    conductedBy: contest.conductedBy,
                    numberOfProblems: contest.numberOfProblems,
                    durationMinutes: contest.durationMinutes,
                    iconImage: contest.iconImage || null,
                    bannerImage: contest.bannerImage || null,
                };
            }
        }

        return SuccessResponse(c, "Problem fetched successfully", 200, {
            ...problem,
            testcases, // ✅ ALL testcases now included
            contest: contestData,
        });
    } catch (err: any) {
        console.error("Error fetching problem:", err);
        return ErrorResponse(c, err.message || "Failed to fetch problem", 500);
    }
};
