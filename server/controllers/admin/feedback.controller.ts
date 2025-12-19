import type { Context } from "hono";
import ContestFeedback from "../../models/feedback.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const QUESTIONS = [
    "Problem Statement Clarity",
    "Difficulty Balance",
    "Test Case Strength",
    "Coding Environment",
    "Overall Satisfaction",
];

export const getFeedbackDashboard = async (c: Context) => {
    try {
        const contestId = c.req.param("contestId");

        const filter: any = {};
        if (contestId) filter.contestId = contestId;

        // 1. Sort by creation date descending (Newest first)
        const feedbacks = await ContestFeedback.find(filter)
            .sort({ createdAt: -1 })
            .lean();

        const totalResponses = feedbacks.length;

        if (totalResponses === 0) {
            return SuccessResponse(c, "No feedback found", 200, {
                kpis: {
                    overallRating: 0,
                    totalResponses: 0,
                    completionRate: 0,
                    positivePercentage: 0,
                },
                ratings: [],
                comments: [],
            });
        }

        /* ---------- Aggregation ---------- */
        const sums = Array(QUESTIONS.length).fill(0);
        let positiveCount = 0;

        const comments: any[] = [];

        for (const fb of feedbacks) {
            if (!Array.isArray(fb.answers)) continue;

            fb.answers.forEach((val: number, i: number) => {
                sums[i] += val;
            });

            const overall = fb.answers[4];
            if (overall >= 4) positiveCount++;

            if (fb.feedback && fb.feedback.trim() !== "") {
                comments.push({
                    text: fb.feedback,
                    rating: overall,
                    createdAt: fb.createdAt,
                });
            }
        }

        const averages = sums.map((s) =>
            Number((s / totalResponses).toFixed(2)),
        );

        /* ---------- KPIs ---------- */
        const kpis = {
            overallRating: averages[4],
            totalResponses,
            completionRate: 100, // since answers array exists
            positivePercentage: Math.round(
                (positiveCount / totalResponses) * 100,
            ),
        };

        /* ---------- Category Ratings ---------- */
        const ratings = QUESTIONS.slice(0, 4).map((label, i) => ({
            label,
            average: averages[i],
            percentage: Math.round((averages[i] / 5) * 100),
        }));

        return SuccessResponse(c, "Feedback analytics fetched", 200, {
            kpis,
            ratings,
            // 2. Slice the first 10 comments (Latest 10)
            comments: comments.slice(0, 10),
        });
    } catch (err: any) {
        return ErrorResponse(c, err.message || "Failed to fetch feedback", 500);
    }
};
