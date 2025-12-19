import mongoose from "mongoose";
import ContestFeedback from "../../models/feedback.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

export const submitContestFeedback = async (c: Context) => {
    try {
        const body = await c.req.json();
        const { contestId, answers, feedback } = body;

        console.log(contestId, "received contestId");

        if (!contestId) {
            return ErrorResponse(c, "contestId is required", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(contestId)) {
            return ErrorResponse(c, "Invalid contestId", 400);
        }

        if (!Array.isArray(answers) || answers.length === 0) {
            return ErrorResponse(c, "answers must be a non-empty array", 400);
        }

        const doc = await ContestFeedback.create({
            contestId: new mongoose.Types.ObjectId(contestId),
            answers,
            feedback: feedback || "",
        });

        return SuccessResponse(c, "Feedback submitted successfully", 201, {
            feedback: doc,
        });
    } catch (err: any) {
        console.error(err);
        return ErrorResponse(
            c,
            err.message || "Failed to submit feedback",
            500,
        );
    }
};
