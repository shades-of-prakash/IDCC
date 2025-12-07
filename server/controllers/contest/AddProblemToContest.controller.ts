import type { Context } from "hono";
import mongoose from "mongoose";
import Contest from "../../models/contest.model.js";
import Problem from "../../models/problem.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const finalizeProblem = async (c: Context) => {
    try {
        const { contestId, problemId } = await c.req.json();

        if (!contestId || !problemId) {
            return ErrorResponse(
                c,
                "contestId and problemId are required",
                400,
            );
        }

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return ErrorResponse(c, "Contest not found", 404);
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return ErrorResponse(c, "Problem not found", 404);
        }

        const alreadyInContest = contest.questions.some(
            (pId) => pId.toString() === problemId,
        );

        if (
            alreadyInContest &&
            problem.status === "finalized" &&
            problem.contestId?.toString() === contestId
        ) {
            return SuccessResponse(
                c,
                "Problem already finalized and added to this contest",
                200,
                problem,
            );
        }

        if (contest.isRunning) {
            return ErrorResponse(
                c,
                "Contest is currently running. You cannot add or modify problems.",
                400,
            );
        }

        const finalizedCount = await Problem.countDocuments({
            contestId: new mongoose.Types.ObjectId(contestId),
            status: "finalized",
        });

        console.log("Finalize check:", {
            contestId,
            numberOfProblems: contest.numberOfProblems,
            finalizedCount,
            questionsLength: contest.questions.length,
        });

        const isAlreadyFinalizedForThisContest =
            problem.status === "finalized" &&
            problem.contestId?.toString() === contestId;

        if (
            !isAlreadyFinalizedForThisContest &&
            finalizedCount >= contest.numberOfProblems
        ) {
            return ErrorResponse(
                c,
                `Contest already has the maximum number of problems (${contest.numberOfProblems})`,
                400,
            );
        }

        problem.status = "finalized";
        problem.contestId = new mongoose.Types.ObjectId(contestId);
        await problem.save();

        if (!alreadyInContest) {
            contest.questions.push(problem._id);
            await contest.save();
        }

        return SuccessResponse(
            c,
            "Problem finalized and added to contest successfully",
            200,
            problem,
        );
    } catch (err) {
        console.error("Error finalizing problem:", err);
        return ErrorResponse(
            c,
            err instanceof Error ? err.message : "Failed to finalize problem",
            500,
        );
    }
};
