import Contest from "../../models/contest.model.js";
import type { Context } from "hono";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const getContests = async (c: Context) => {
	try {
		const contests = await Contest.find().sort({ createdAt: -1 });
		return SuccessResponse(c, "Contests fetched successfully", 200, contests);
	} catch (err: any) {
		return ErrorResponse(c, err.message || "Failed to fetch contests", 500);
	}
};
