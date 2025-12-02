import type { Context } from "hono";
import mongoose from "mongoose";
import TestCase from "../../models/testcase.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const removeTestCase = async (c: Context) => {
  try {
    const { testcaseId } = await c.req.json();

    console.log("testcase", testcaseId);

    if (!testcaseId) {
      return ErrorResponse(c, "testcaseId is required", 400);
    }

    if (!mongoose.Types.ObjectId.isValid(testcaseId)) {
      return ErrorResponse(c, "Invalid testcaseId", 400);
    }

    const testCase = await TestCase.findById(testcaseId);

    console.log("e", testCase);

    if (!testCase) {
      return ErrorResponse(c, "Testcase not found", 404);
    }

    await testCase.deleteOne();

    return SuccessResponse(c, "Testcase removed successfully", 200, {
      _id: testcaseId,
    });
  } catch (err: any) {
    console.error("Error removing testcase:", err);
    return ErrorResponse(c, err.message || "Failed to remove testcase", 500);
  }
};
