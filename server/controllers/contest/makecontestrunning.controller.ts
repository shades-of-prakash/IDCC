import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

export const makeContestRunning = async (c: Context) => {
    try {
        const id = c.req.param("id");
        const body = await c.req.json().catch(() => null);

        if (!body || typeof body.isRunning !== "boolean") {
            return ErrorResponse(c, "isRunning (boolean) is required", 400);
        }

        const contest = await Contest.findById(id).populate("questions");

        if (!contest) {
            return ErrorResponse(c, "Contest not found", 404);
        }

        if (body.isRunning === true) {
            const totalProblemsAdded = contest.questions.length;

            if (totalProblemsAdded === 0) {
                return ErrorResponse(
                    c,
                    "Contest cannot start. No problems added.",
                    400,
                );
            }

            if (totalProblemsAdded !== contest.numberOfProblems) {
                return ErrorResponse(
                    c,
                    `Contest incomplete. Expected ${contest.numberOfProblems} problems but found ${totalProblemsAdded}.`,
                    400,
                );
            }
        }

        contest.isRunning = body.isRunning;
        await contest.save();

        return SuccessResponse(
            c,
            body.isRunning
                ? "Contest started successfully!"
                : "Contest stopped successfully!",
            200,
            contest,
        );
    } catch (err) {
        console.error("Failed to update contest running:", err);
        return ErrorResponse(
            c,
            err.message || "Failed to update contest running",
            500,
        );
    }
};
