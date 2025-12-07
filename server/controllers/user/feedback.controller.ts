import type { Context } from "hono";
import ContestFeedback from "../../models/feedback.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const submitContestFeedback = async (c: Context) => {
    try {
        const body = await c.req.json();
        const { contestId, answers, feedback } = body;

        if (!Array.isArray(answers) || answers.length === 0) {
            return ErrorResponse(c, "answers must be a non-empty array", 400);
        }

        const doc = await ContestFeedback.create({
            contestId: contestId || null,
            answers,
            feedback: feedback || "",
        });

        return SuccessResponse(c, "Feedback submitted successfully", 201, {
            feedback: doc,
        });
    } catch (err: any) {
        return ErrorResponse(
            c,
            err.message || "Failed to submit feedback",
            500,
        );
    }
};
