import type { Context } from "hono";
import mongoose from "mongoose";
import TestCase from "../../models/testcase.model.js";
import Problem from "../../models/problem.model.js";
import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const updateTestCase = async (c: Context) => {
    try {
        const { id } = c.req.param();
        const body = await c.req.json();

        console.log("updateTestCase id:", id);
        console.log("updateTestCase body:", body);

        const { problemId, input, output, isHidden, points } = body;

        if (!id) {
            return ErrorResponse(c, "Testcase id is required", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return ErrorResponse(c, "Invalid testcase id", 400);
        }

        const testCase = await TestCase.findById(id);

        if (!testCase) {
            return ErrorResponse(c, "Testcase not found", 404);
        }

        // 🔍 Determine which problemId to use (existing or new one from body)
        let problemIdToCheck: any = testCase.problemId;

        if (problemId) {
            if (!mongoose.Types.ObjectId.isValid(problemId)) {
                return ErrorResponse(c, "Invalid problemId", 400);
            }
            problemIdToCheck = problemId;
        }

        // 🔥 Load problem & contest to enforce isRunning rule
        const problem = await Problem.findById(problemIdToCheck);

        if (!problem) {
            return ErrorResponse(c, "Problem not found", 404);
        }

        if (!problem.contestId) {
            return ErrorResponse(
                c,
                "Problem is not linked to any contest",
                400,
            );
        }

        const contest = await Contest.findById(problem.contestId);

        if (!contest) {
            return ErrorResponse(c, "Contest not found", 404);
        }

        if (contest.isRunning) {
            return ErrorResponse(
                c,
                "Cannot update testcase while contest is running",
                400,
            );
        }

        // 🔥 points is required on update as well (schema requires it)
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

        // ✅ Safe to update fields now

        if (problemId) {
            testCase.problemId = problemId;
        }

        // we’ll use effectiveInput to generate rawInput
        let effectiveInput: any = testCase.input;

        if (input !== undefined) {
            if (
                typeof input !== "object" ||
                input === null ||
                Array.isArray(input)
            ) {
                return ErrorResponse(c, "input must be an object", 400);
            }

            if (!Array.isArray(problem.arguments)) {
                return ErrorResponse(c, "Problem arguments not defined", 400);
            }

            // validate dynamic arguments
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

            testCase.input = input;
            effectiveInput = input;
        }

        if (output !== undefined) {
            if (typeof output !== "string") {
                return ErrorResponse(c, "output must be a string", 400);
            }
            testCase.output = output;
        }

        if (typeof isHidden === "boolean") {
            testCase.isHidden = isHidden;
        }

        // update points
        testCase.points = numericPoints;

        // 🔹 Regenerate rawInput based on latest input + problem.arguments
        if (!Array.isArray(problem.arguments)) {
            return ErrorResponse(c, "Problem arguments not defined", 400);
        }

        if (
            typeof effectiveInput !== "object" ||
            effectiveInput === null ||
            Array.isArray(effectiveInput)
        ) {
            return ErrorResponse(c, "Stored testcase input is invalid", 400);
        }

        const lines: string[] = (problem.arguments as any[]).map(
            (argDef: any) => {
                const { name } = argDef;
                const value = effectiveInput[name];

                if (Array.isArray(value)) {
                    return value.join(" ");
                }

                if (typeof value === "object" && value !== null) {
                    return JSON.stringify(value);
                }

                return String(value);
            },
        );

        testCase.rawInput = lines.join("\n") + "\n";

        await testCase.save();

        return SuccessResponse(
            c,
            "Testcase updated successfully",
            200,
            testCase,
        );
    } catch (err: any) {
        console.error("Error updating testcase:", err);
        return ErrorResponse(
            c,
            err.message || "Failed to update testcase",
            500,
        );
    }
};
