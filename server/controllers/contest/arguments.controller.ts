import type { Context } from "hono";
import mongoose from "mongoose";
import Problem from "../../models/problem.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const addProblemArguments = async (c: Context) => {
    try {
        const body = await c.req.json();

        const { problemId, output, arguments: args } = body;

        console.log(problemId, output, args);

        if (!problemId) {
            return ErrorResponse(c, "problemId is required", 400);
        }

        if (!mongoose.Types.ObjectId.isValid(problemId)) {
            return ErrorResponse(c, "Invalid problemId", 400);
        }

        if (!output || typeof output !== "string") {
            return ErrorResponse(
                c,
                "output is required and must be a string",
                400,
            );
        }

        if (!Array.isArray(args) || args.length === 0) {
            return ErrorResponse(c, "arguments must be a non-empty array", 400);
        }

        for (const arg of args) {
            if (
                !arg ||
                typeof arg.name !== "string" ||
                typeof arg.type !== "string" ||
                !arg.name.trim() ||
                !arg.type.trim()
            ) {
                return ErrorResponse(
                    c,
                    "Each argument must have non-empty 'name' and 'type'",
                    400,
                );
            }
        }

        const updatedProblem = await Problem.findByIdAndUpdate(
            problemId,
            {
                $set: {
                    outputType: output,
                    arguments: args,
                },
            },
            { new: true },
        );

        if (!updatedProblem) {
            return ErrorResponse(c, "Problem not found", 404);
        }

        return SuccessResponse(
            c,
            "Function signature updated successfully",
            200,
            {
                problemId: updatedProblem._id,
                outputType: updatedProblem.output,
                arguments: updatedProblem.arguments,
            },
        );
    } catch (err: any) {
        console.error("Error adding problem arguments:", err);
        return ErrorResponse(
            c,
            err.message || "Failed to add problem arguments",
            500,
        );
    }
};
