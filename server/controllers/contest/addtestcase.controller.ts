import type { Context } from "hono";
import mongoose from "mongoose";
import TestCase from "../../models/testcase.model.js";
import Problem from "../../models/problem.model.js";
import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import generateRawInput from "../../utils/generateRawInput.js";

// ✅ Add validation helper
const validateTypeMatch = (value: any, type: string): boolean => {
    if (value === null) return true;

    // Parse nested array types (e.g., "array<string>", "array<array<number>>")
    let depth = 0;
    let innerType = type;
    while (innerType.startsWith("array<")) {
        depth++;
        innerType = innerType.slice(6, -1);
    }

    const validatePrimitive = (val: any): boolean => {
        if (val === null) return true;
        if (innerType === "string") return typeof val === "string";
        if (innerType === "char")
            return typeof val === "string" && val.length <= 1;
        if (innerType === "number")
            return typeof val === "number" && !isNaN(val);
        if (innerType === "boolean") return typeof val === "boolean";
        return false;
    };

    const validateArray = (val: any, currentDepth: number): boolean => {
        if (val === null) return true;
        if (!Array.isArray(val)) return false;

        if (currentDepth === depth) {
            return val.every((element: any) => validatePrimitive(element));
        }

        return val.every((inner: any) =>
            validateArray(inner, currentDepth + 1),
        );
    };

    if (depth > 0) {
        return validateArray(value, 1);
    }

    return validatePrimitive(value);
};

export const addTestCase = async (c: Context) => {
    try {
        const body = await c.req.json();
        const { problemId, input, output, isHidden, points } = body;

        /* ---------------- validations ---------------- */

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

        const numericPoints = Number(points);
        if (
            points === undefined ||
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

        // ✅ Output validation
        if (output === undefined || output === null) {
            return ErrorResponse(c, "output is required", 400);
        }

        // ✅ Validate output type if outputType is defined
        if (problem.outputType && problem.outputType.trim() !== "") {
            if (!validateTypeMatch(output, problem.outputType)) {
                return ErrorResponse(
                    c,
                    `output must be of type ${problem.outputType}`,
                    400,
                );
            }
        }

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

        /* -------- argument validation -------- */

        for (const arg of problem.arguments as any[]) {
            const { name, type } = arg;

            if (!(name in input)) {
                return ErrorResponse(c, `Missing argument '${name}'`, 400);
            }

            const val = input[name];

            // ✅ Use the same validation for input arguments
            if (!validateTypeMatch(val, type)) {
                return ErrorResponse(
                    c,
                    `'${name}' must be of type ${type}`,
                    400,
                );
            }
        }

        /* ---------------- generate raw input ---------------- */

        const rawInput = generateRawInput(input, problem.arguments as any[]);

        /* ---------------- save ---------------- */

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
        console.error("addTestCase error:", err);
        return ErrorResponse(c, err.message, 500);
    }
};
