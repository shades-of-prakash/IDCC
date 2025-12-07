import type { Context } from "hono";
import mongoose from "mongoose";

import Submission from "../../models/submission.model.js";
import UserDetails from "../../models/userDetails.model.js";
import TestCase from "../../models/testcase.model.js";
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

        // 4️⃣ Load testcases for all problems used in these submissions
        const problemIds = submissions
            .map((sub: any) =>
                sub.problemId
                    ? sub.problemId._id?.toString?.() ||
                      sub.problemId.toString()
                    : null,
            )
            .filter(Boolean);

        const uniqueProblemIds = [...new Set(problemIds)].map(
            (id) => new mongoose.Types.ObjectId(id as string),
        );

        const testcases = await TestCase.find({
            problemId: { $in: uniqueProblemIds },
        })
            .select("_id problemId points")
            .lean();

        // Group testcases by problemId → { problemId: [{_id, points}, ...] }
        const testcasesByProblem: Record<
            string,
            { _id: mongoose.Types.ObjectId; points: number }[]
        > = {};

        for (const tc of testcases) {
            const key = tc.problemId.toString();
            if (!testcasesByProblem[key]) testcasesByProblem[key] = [];
            testcasesByProblem[key].push({
                _id: tc._id,
                points: tc.points,
            });
        }

        // 5️⃣ Build per-submission / per-problem summary
        const problemsSummary = submissions.map((sub: any) => {
            const problem = sub.problemId || {};
            const problemKey = problem._id?.toString?.() || "";

            const tcList = testcasesByProblem[problemKey] || [];
            const testcasePointsArray = tcList.map((tc) => tc.points);
            const testcasePointsSum = testcasePointsArray.reduce(
                (sum, val) => sum + (typeof val === "number" ? val : 0),
                0,
            );

            const assignedPoints =
                typeof problem.points === "number"
                    ? problem.points
                    : testcasePointsSum;

            const awardedPoints =
                typeof sub.awardedPoints === "number" ? sub.awardedPoints : 0;

            // Map testcaseId → max points (from TestCase)
            const pointsByTestcaseId: Record<string, number> = {};
            for (const tc of tcList) {
                pointsByTestcaseId[tc._id.toString()] = tc.points;
            }

            // ✅ Build passedTestcasePoints from real submission results
            let passedTestcasePoints: number[] = [];
            if (Array.isArray(sub.results)) {
                passedTestcasePoints = sub.results
                    .filter((r: any) => r.passed)
                    .map((r: any) => {
                        if (typeof r.pointsAwarded === "number") {
                            return r.pointsAwarded;
                        }
                        const key = r.testcase?.toString?.();
                        return key && pointsByTestcaseId[key]
                            ? pointsByTestcaseId[key]
                            : 0;
                    })
                    .filter(
                        (p: number) =>
                            typeof p === "number" && Number.isFinite(p),
                    );
            }

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
                    assignedPoints, // total points for problem
                    testcasePointsSum, // sum of all testcase max points
                },

                // 🧮 Submission info
                language: sub.language,
                status: sub.status,

                totalTests: sub.totalTests,
                passedTests: sub.passedTests,

                maxPoints: sub.maxPoints ?? assignedPoints,

                // ✅ arrays for frontend
                testcasePoints: testcasePointsArray, // all testcase max points: [8, 5, 4]
                passedTestcasePoints, // real passed test points from results
                awardedPoints, // total awarded: e.g. 12

                // 🧾 Code
                code: sub.code,

                createdAt: sub.createdAt,
                updatedAt: sub.updatedAt,
            };
        });

        // 6️⃣ Final response
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
