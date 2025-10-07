import Contest from "../../models/contest.model.js";
import * as fs from "fs";
import * as path from "path";
import type { Context } from "hono";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const UPLOADS_PATH = "C:/uploads";

export const createContest = async (c: Context) => {
	let uploadedFilePath: string | null = null;
	try {
		const body = await c.req.parseBody();

		const { name, conductedBy, numberOfProblems, durationMinutes, teamSize } =
			body;

		if (!name || !numberOfProblems || !durationMinutes || !teamSize) {
			return ErrorResponse(c, "Missing required fields", 400);
		}

		if (!fs.existsSync(UPLOADS_PATH)) {
			fs.mkdirSync(UPLOADS_PATH, { recursive: true });
		}

		let bannerImage: string | null = null;

		if (body.bannerImage && body.bannerImage instanceof File) {
			const file = body.bannerImage;
			const filename = Date.now() + path.extname(file.name);
			const filepath = path.join(UPLOADS_PATH, filename);

			const buffer = Buffer.from(await file.arrayBuffer());
			fs.writeFileSync(filepath, buffer);

			uploadedFilePath = filepath;
			bannerImage = `/images/${filename}`;
		}

		const contest = new Contest({
			name,
			conductedBy,
			numberOfProblems: Number(numberOfProblems),
			durationMinutes: Number(durationMinutes),
			teamSize,
			bannerImage,
		});

		await contest.save();
		return SuccessResponse(c, "Contest created successfully", 201, contest);
	} catch (err: any) {
		if (uploadedFilePath && fs.existsSync(uploadedFilePath)) {
			try {
				fs.unlinkSync(uploadedFilePath);
			} catch (cleanupErr) {
				console.error("Failed to remove uploaded file:", cleanupErr);
			}
		}

		return ErrorResponse(c, err.message || "Failed to create contest", 500);
	}
};
