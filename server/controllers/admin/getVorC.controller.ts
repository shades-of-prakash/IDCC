import type { Context } from "hono";
import { Admin } from "../../models/admin.model";
import { SuccessResponse, ErrorResponse } from "../../utils/response";

export const getVorc = async (c: Context) => {
  try {
    const users = await Admin.find({
      role: { $in: ["volunteer", "coordinator"] },
    }).select("_id name username role createdAt");

    return SuccessResponse(c, "Users fetched successfully", 200, users);
  } catch (err) {
    console.error("Error fetching users:", err);
    return ErrorResponse(c, "Internal server error", 500);
  }
};
