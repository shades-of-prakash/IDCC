import mongoose from "mongoose";
import Problem from "../../models/problem.model.js";
import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

export const createSimpleProblem = async (c: Context) => {
  try {
    const body = await c.req.json();
    const { name, points, contestId, submittedBy } = body;

    console.log(name, points, contestId, submittedBy);

    if (!name || points == null || !contestId || !submittedBy) {
      return ErrorResponse(
        c,
        "name, points, contestId, submittedBy are required",
        400,
      );
    }

    const contestObjectId =
      mongoose.Types.ObjectId.createFromHexString(contestId);

    const contest = await Contest.findById(contestObjectId);

    if (!contest) {
      return ErrorResponse(c, "Contest not found", 404);
    }

    if (contest.isRunning) {
      return ErrorResponse(c, "Cannot add problems to a running contest", 400);
    }

    const problemData = {
      name,
      points: Number(points),
      contestId: contestObjectId,
      submittedBy: mongoose.Types.ObjectId.createFromHexString(submittedBy),
      arguments: [],
      functionName: "",
      returnType: "",
      statement: "",
      hiddenTests: [],
      visibleTests: [],
      status: "pending",
    };

    const newProblem = new Problem(problemData);
    console.log(newProblem);
    await newProblem.save();

    return SuccessResponse(c, "Problem created successfully", 201, newProblem);
  } catch (err: any) {
    console.error("Problem creation failed:", err);
    return ErrorResponse(c, err.message || "Failed to create problem", 500);
  }
};
