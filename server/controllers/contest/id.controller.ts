import Contest from "../../models/contest.model.js";
import type { Context } from "hono";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const getContestById = async (c: Context) => {
	try {
		const id = c.req.param("id");
		if (!id) {
			return ErrorResponse(c, "Contest ID is required", 400);
		}

		const contest = await Contest.findById(id);
		if (!contest) {
			return ErrorResponse(c, "Contest not found", 404);
		}

		return SuccessResponse(c, "Contest fetched successfully", 200, contest);
	} catch (err: any) {
		return ErrorResponse(c, err.message || "Failed to fetch contest", 500);
	}
};
