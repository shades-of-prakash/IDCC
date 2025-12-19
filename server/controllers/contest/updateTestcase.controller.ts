import type { Context } from "hono";
import mongoose from "mongoose";
import TestCase from "../../models/testcase.model.js";
import Problem from "../../models/problem.model.js";
import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import generateRawInput from "../../utils/generateRawInput.js";

// ✅ Same validation helper (can be extracted to a separate util file)
const validateTypeMatch = (value: any, type: string): boolean => {
    if (value === null) return true;

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

export const updateTestCase = async (c: Context) => {
    try {
        const { id } = c.req.param();
        const body = await c.req.json();
        const { problemId, input, output, isHidden, points } = body;

        /* ---------------- validations ---------------- */

        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return ErrorResponse(c, "Invalid testcase id", 400);
        }

        const testCase = await TestCase.findById(id);
        if (!testCase) {
            return ErrorResponse(c, "Testcase not found", 404);
        }

        const effectiveProblemId = problemId ?? testCase.problemId;

        if (!mongoose.Types.ObjectId.isValid(effectiveProblemId)) {
            return ErrorResponse(c, "Invalid problemId", 400);
        }

        const problem = await Problem.findById(effectiveProblemId);
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
                "Cannot update testcase while contest is running",
                400,
            );
        }

        /* ---------------- points ---------------- */

        if (points === undefined || points === null) {
            return ErrorResponse(c, "points is required", 400);
        }

        const numericPoints = Number(points);
        if (
            Number.isNaN(numericPoints) ||
            numericPoints < 0 ||
            numericPoints > 10
        ) {
            return ErrorResponse(c, "points must be between 0 and 10", 400);
        }

        /* ---------------- input ---------------- */

        let effectiveInput = testCase.input;

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

            testCase.input = input;
            effectiveInput = input;
        }

        /* ---------------- output ---------------- */

        if (output !== undefined && output !== null) {
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

            testCase.output = output;
        }

        /* ---------------- misc ---------------- */

        if (typeof isHidden === "boolean") {
            testCase.isHidden = isHidden;
        }

        testCase.points = numericPoints;

        testCase.rawInput = generateRawInput(
            effectiveInput,
            problem.arguments as any[],
        );

        await testCase.save();

        return SuccessResponse(
            c,
            "Testcase updated successfully",
            200,
            testCase,
        );
    } catch (err: any) {
        console.error("updateTestCase error:", err);
        return ErrorResponse(c, err.message, 500);
    }
};
