import Problem from "../../models/problem.model.js";
import Contest from "../../models/contest.model.js";
import { Context } from "hono";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const addProblemToContest = async (c: Context) => {
    try {
        const body = await c.req.json();

        const {
            contestId,
            name,
            points,
            arguments: args,
            functionName,
            returnType,
            statement,
        } = body;

        if (!contestId || !name || points == null || !args || !functionName || !returnType) {
            return ErrorResponse(c, "Missing required fields", 400);
        }

        const contest = await Contest.findById(contestId);
        if (!contest) {
            return ErrorResponse(c, "Contest not found", 404);
        }

        const problem = new Problem({
            name,
            points,
            arguments: args,
            functionName,
            returnType,
            statement: statement || "",
            contestId: contest._id,
        });

        await problem.save();

        return SuccessResponse(c, "Problem added successfully", 201, problem);
    } catch (err: any) {
        console.error("Failed to add problem:", err);
        return ErrorResponse(c, err.message || "Failed to add problem", 500);
    }
};
