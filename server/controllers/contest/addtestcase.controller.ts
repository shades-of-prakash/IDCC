import type { Context } from "hono";
import mongoose from "mongoose";
import TestCase from "../../models/testcase.model.js";
import Problem from "../../models/problem.model.js";
import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const addTestCase = async (c: Context) => {
    try {
        const body = await c.req.json();

        console.log("addTestCase body:", body);

        const { problemId, input, output, isHidden, points } = body;

        // Validate problemId
        if (!problemId || !mongoose.Types.ObjectId.isValid(problemId)) {
            return ErrorResponse(c, "Invalid problemId", 400);
        }

        const problem = await Problem.findById(problemId);
        if (!problem) {
            return ErrorResponse(c, "Problem not found", 404);
        }

        const contest = await Contest.findById(problem.contestId);
        if (!contest) {
            return ErrorResponse(c, "Contest not found", 404);
        }

        if (contest.isRunning) {
            return ErrorResponse(
                c,
                "Cannot add testcase while contest is running",
                400,
            );
        }

        // 🔥 Validate points (0–10)
        if (points === undefined || points === null) {
            return ErrorResponse(c, "points is required", 400);
        }

        const numericPoints = Number(points);
        if (
            Number.isNaN(numericPoints) ||
            numericPoints < 0 ||
            numericPoints > 10
        ) {
            return ErrorResponse(
                c,
                "points must be a number between 0 and 10",
                400,
            );
        }

        // Validate output
        if (typeof output !== "string") {
            return ErrorResponse(c, "output must be a string", 400);
        }

        // Validate input structure
        if (
            typeof input !== "object" ||
            input === null ||
            Array.isArray(input)
        ) {
            return ErrorResponse(c, "input must be an object", 400);
        }

        // Validate arguments
        if (!Array.isArray(problem.arguments)) {
            return ErrorResponse(c, "Problem arguments not defined", 400);
        }

        for (const argDef of problem.arguments as any[]) {
            const { name, type } = argDef;

            if (!(name in input)) {
                return ErrorResponse(c, `Missing argument '${name}'`, 400);
            }

            const value = input[name];

            if (type === "number" && typeof value !== "number") {
                return ErrorResponse(c, `'${name}' must be a number`, 400);
            }

            if (type === "string" && typeof value !== "string") {
                return ErrorResponse(c, `'${name}' must be a string`, 400);
            }

            if (type === "boolean" && typeof value !== "boolean") {
                return ErrorResponse(c, `'${name}' must be a boolean`, 400);
            }

            if (type.endsWith("[]") && !Array.isArray(value)) {
                return ErrorResponse(c, `'${name}' must be an array`, 400);
            }
        }

        // 🔹 Generate rawInput from arguments
        const lines: string[] = (problem.arguments as any[]).map(
            (argDef: any) => {
                const { name } = argDef;
                const value = input[name];

                if (Array.isArray(value)) return value.join(" ");
                if (typeof value === "object" && value !== null)
                    return JSON.stringify(value);

                return String(value);
            },
        );

        const rawInput = lines.join("\n") + "\n";

        // CREATE NEW TESTCASE ONLY
        const testCase = await TestCase.create({
            problemId,
            input,
            rawInput,
            output,
            isHidden: isHidden ?? false,
            points: numericPoints,
        });

        return SuccessResponse(c, "Testcase added successfully", 201, testCase);
    } catch (err: any) {
        console.error("Error adding testcase:", err);
        return ErrorResponse(c, err.message || "Failed to add testcase", 500);
    }
};
