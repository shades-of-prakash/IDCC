import * as fs from "fs";
import * as path from "path";
import type { Context } from "hono";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const UPLOADS_PATH = "C:/uploads";
const TEMP_FILE_DB = path.join(UPLOADS_PATH, "uploads.json");

interface UploadMeta {
	path: string;
	status: "pending" | "used";
	createdAt: number;
	contestId: string;
}

type UploadDB = Record<string, UploadMeta>;

interface CleanupRequestBody {
	usedImages?: string[];
	contestId?: string;
}

function loadUploads(): UploadDB {
	if (!fs.existsSync(TEMP_FILE_DB)) return {};
	try {
		const content = fs.readFileSync(TEMP_FILE_DB, "utf8");
		return JSON.parse(content) as UploadDB;
	} catch {
		return {};
	}
}

function saveUploads(data: UploadDB): void {
	fs.writeFileSync(TEMP_FILE_DB, JSON.stringify(data, null, 2), "utf8");
}

export const cleanupUnusedImages = async (c: Context) => {
	try {
		const body = (await c.req.json()) as CleanupRequestBody;
		const usedImages = body.usedImages ?? [];
		const contestIdFilter = body.contestId;

		const usedSet = new Set(usedImages.map((url) => path.basename(url)));
		const db = loadUploads();

		for (const [filename, meta] of Object.entries(db)) {
			if (contestIdFilter && meta.contestId !== contestIdFilter) continue;

			if (!usedSet.has(filename) && fs.existsSync(meta.path)) {
				fs.unlinkSync(meta.path);
				delete db[filename];
			} else {
				db[filename].status = "used";
			}
		}

		saveUploads(db);
		return SuccessResponse(c, "Cleaned up unused images", 200);
	} catch (err: unknown) {
		const message = err instanceof Error ? err.message : "Cleanup failed";
		return ErrorResponse(c, message, 500);
	}
};
