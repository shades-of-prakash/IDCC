import * as fs from "fs";
import * as path from "path";
import type { Context } from "hono";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

const UPLOADS_PATH = "uploads";
const TEMP_FILE_DB = path.join(UPLOADS_PATH, "uploads.json");

interface UploadMeta {
  path: string;
  status: "pending" | "used";
  createdAt: number;
  contestId: string;
}

type UploadDB = Record<string, UploadMeta>;

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

interface UploadedFile {
  name: string;
  arrayBuffer: () => Promise<ArrayBuffer>;
}

export const uploadImage = async (c: Context) => {
  try {
    const body = (await c.req.parseBody()) as Record<string, any>;
    const file: UploadedFile | undefined = body.file;
    const contestId = body.contestId as string;

    if (!file || typeof file.arrayBuffer !== "function") {
      return ErrorResponse(c, "No valid file uploaded", 400);
    }

    if (!contestId) {
      return ErrorResponse(c, "Contest ID is required", 400);
    }

    const contestFolder = path.join(UPLOADS_PATH, contestId);
    if (!fs.existsSync(contestFolder)) {
      fs.mkdirSync(contestFolder, { recursive: true });
    }

    const filename = `${Date.now()}${path.extname(file.name)}`;
    const filepath = path.join(contestFolder, filename);

    const buffer = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    const baseUrl = Bun.env.IMAGE_URL || "";
    const imageUrl = `${baseUrl}images/${contestId}/${filename}`;

    const db = loadUploads();
    db[filename] = {
      path: filepath,
      status: "pending",
      createdAt: Date.now(),
      contestId,
    };
    saveUploads(db);

    return SuccessResponse(c, "Image uploaded successfully", 201, { imageUrl });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Upload failed";
    return ErrorResponse(c, message, 500);
  }
};
