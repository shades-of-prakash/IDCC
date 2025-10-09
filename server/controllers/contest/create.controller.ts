import Contest from "../../models/contest.model.js";
import * as fs from "fs";
import * as path from "path";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

const UPLOADS_PATH = "C:/uploads";

export const createContest = async (c:Context) => {
	let uploadedFilePath = null;

	try {
		const body = await c.req.parseBody();

		const {
			name,
			conductedBy,
			numberOfProblems,
			durationMinutes,
			teamSize,
			questions,
		} = body;

		if (!name || !numberOfProblems || !durationMinutes || !teamSize) {
			return ErrorResponse(c, "Missing required fields", 400);
		}

		if (!fs.existsSync(UPLOADS_PATH)) {
			fs.mkdirSync(UPLOADS_PATH, { recursive: true });
		}

		let bannerImage = null;

		if (body.bannerImage && body.bannerImage instanceof File) {
			const file = body.bannerImage;
			const filename = Date.now() + path.extname(file.name);
			const filepath = path.join(UPLOADS_PATH, filename);

			const buffer = Buffer.from(await file.arrayBuffer());
			fs.writeFileSync(filepath, buffer);

			uploadedFilePath = filepath;
			bannerImage = `/images/${filename}`;
		}

		let parsedQuestions = [];
		try {
			if (typeof questions === "string") {
				parsedQuestions = JSON.parse(questions);
			} else if (Array.isArray(questions)) {
				parsedQuestions = questions;
			}
		} catch (err) {
			console.error("Invalid questions JSON:", err);
			return ErrorResponse(c, "Invalid questions format", 400);
		}

		for (const q of parsedQuestions) {
			if (!q.name || q.points == null) {
				return ErrorResponse(c, "Each question must include name and points", 400);
			}
		}

		const contest = new Contest({
			name,
			conductedBy: conductedBy || "IDCC",
			numberOfProblems: Number(numberOfProblems),
			durationMinutes: Number(durationMinutes),
			teamSize,
			bannerImage,
			questions: parsedQuestions,
		});

		await contest.save();

		return SuccessResponse(c, "Contest created successfully", 201, contest);
	} catch (err:any) {
		if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
			try {
				fs.unlinkSync(uploadedFilePath);
			} catch (cleanupErr) {
				console.error("Failed to remove uploaded file:", cleanupErr);
			}
		}

		console.error("Contest creation failed:", err);
		return ErrorResponse(c, err.message || "Failed to create contest", 500);
	}
};
