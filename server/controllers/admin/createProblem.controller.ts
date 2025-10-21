import Problem from "../../models/problem.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

export const upsertProblem = async (c: Context) => {
  try {
    const id = c.req.param("problemId");
    const body = await c.req.json();

    console.log(body, "body i recieved dude");

    const {
      name,
      points,
      arguments: args,
      functionName,
      returnType,
      statement,
      hiddenTests,
      visibleTests,
      submittedBy,
      contestId,
      status,
    } = body;

    if (!name || points == null || !args || !functionName || !returnType) {
      return ErrorResponse(c, "Missing required fields", 400);
    }

    if (!Array.isArray(args)) {
      return ErrorResponse(c, "Arguments must be an array", 400);
    }

    if (hiddenTests && !Array.isArray(hiddenTests)) {
      return ErrorResponse(c, "hiddenTests must be an array", 400);
    }

    if (visibleTests && !Array.isArray(visibleTests)) {
      return ErrorResponse(c, "visibleTests must be an array", 400);
    }

    // ✅ Common problem object
    const problemData = {
      name,
      points: Number(points),
      arguments: args,
      functionName,
      returnType,
      statement: statement || "",
      hiddenTests: hiddenTests || [],
      visibleTests: visibleTests || [],
      submittedBy: submittedBy || null,
      contestId: contestId || null,
      status: status || "pending",
    };

    if (id) {
      const updatedProblem = await Problem.findByIdAndUpdate(id, problemData, {
        new: true,
      });

      if (!updatedProblem) {
        return ErrorResponse(c, "Problem not found", 404);
      }

      return SuccessResponse(
        c,
        "Problem updated successfully",
        200,
        updatedProblem,
      );
    }

    // ✅ Otherwise, create new
    const newProblem = new Problem(problemData);
    await newProblem.save();

    return SuccessResponse(c, "Problem created successfully", 201, newProblem);
  } catch (err: any) {
    console.error("Problem create/update failed:", err);
    return ErrorResponse(c, err.message || "Failed to process problem", 500);
  }
};
