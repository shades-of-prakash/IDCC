import type { Context } from "hono";
import mongoose from "mongoose";
import TestCase from "../../models/testcase.model.js";
import Problem from "../../models/problem.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const getTestCases = async (c: Context) => {
    try {
        const body = await c.req.json();
        const { problemId } = body;

        if (!problemId) {
            return ErrorResponse(c, "problemId is required", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return ErrorResponse(c, "Invalid problemId", 400);
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return ErrorResponse(c, "Problem not found", 404);
        }

        const testCases = await TestCase.find({ problemId }).lean();

        return SuccessResponse(
            c,
            "Testcases fetched successfully",
            200,
            testCases,
        );
    } catch (err: any) {
        console.error("Error fetching testcases:", err);
        return ErrorResponse(
            c,
            err.message || "Failed to fetch testcases",
            500,
        );
    }
};
