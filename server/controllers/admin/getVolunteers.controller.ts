import type { Context } from "hono";
import { Admin } from "../../models/admin.model";
import { SuccessResponse, ErrorResponse } from "../../utils/response";

export const getVolunteers = async (c: Context) => {
  try {
    
    const volunteers = await Admin.find({ role: "volunteer" }).select(
      "_id name username role createdAt"
    );

    return SuccessResponse(c, "Volunteers fetched successfully", 200, 
      volunteers,
    );

  } catch (err) {
    console.error("Error fetching volunteers:", err);
    return ErrorResponse(c, "Internal server error", 500);
  }
};
