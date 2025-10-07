import Contest from "../../models/contest.model.js";
import type { Context } from "hono";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const REQUIRED_QUESTION_FIELDS = [
	"arguments",
	"codes",
	"functionName",
	"hiddenTests",
	"visibleTests",
	"returnType",
	"statement",
];

export const upsertQuestion = async (c: Context) => {
	try {
		const contestId = c.req.param("id");
		if (!contestId) {
			return ErrorResponse(c, "Contest ID is required", 400);
		}

		const body = await c.req.json();
		const { index, question } = body;

		if (index === undefined || index < 0) {
			return ErrorResponse(c, "Valid question index is required", 400);
		}

		if (!question || typeof question !== "object") {
			return ErrorResponse(c, "Question data is required", 400);
		}

		const missingFields = REQUIRED_QUESTION_FIELDS.filter(
			(field) => !(field in question)
		);

		if (missingFields.length > 0) {
			return ErrorResponse(
				c,
				`Missing required question fields: ${missingFields.join(", ")}`,
				400
			);
		}

		const contest = await Contest.findById(contestId);
		if (!contest) {
			return ErrorResponse(c, "Contest not found", 404);
		}

		contest.questions[index] = question;

		await contest.save();

		return SuccessResponse(
			c,
			"Question saved successfully",
			200,
			contest.questions[index]
		);
	} catch (err: any) {
		return ErrorResponse(c, err.message || "Failed to save question", 500);
	}
};
