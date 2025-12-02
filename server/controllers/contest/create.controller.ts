import Contest from "../../models/contest.model.js";
import * as fs from "fs";
import * as path from "path";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

const UPLOADS_PATH = path.join("uploads", "contests");

export const createContest = async (c: Context) => {
  let uploadedFilePath: string | null = null;

  try {
    const formData = await c.req.formData();

    const name = formData.get("name") as string | null;
    const conductedBy =
      (formData.get("conductedBy") as string | null) || "IDCC";
    const numberOfProblems = formData.get("numberOfProblems") as string | null;
    const durationMinutes = formData.get("durationMinutes") as string | null;

    if (!name || !numberOfProblems || !durationMinutes) {
      return ErrorResponse(c, "Missing required fields", 400);
    }

    if (!fs.existsSync(UPLOADS_PATH)) {
      fs.mkdirSync(UPLOADS_PATH, { recursive: true });
    }

    let bannerImage: string | null = null;
    const bannerFile = formData.get("bannerImage");

    if (bannerFile && bannerFile instanceof File) {
      const file = bannerFile as File;
      const filename = `${Date.now()}${path.extname(file.name)}`;
      const filepath = path.join(UPLOADS_PATH, filename);

      const buffer = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(filepath, buffer);
      uploadedFilePath = filepath;

      bannerImage = `/contests/${filename}`;
    }

    const rawLanguages = formData.get("languages");

    let parsedLanguages: string[] = [];

    if (rawLanguages) {
      try {
        const arr = JSON.parse(String(rawLanguages));

        if (Array.isArray(arr)) {
          parsedLanguages = arr.map((l) => String(l));
        } else {
          parsedLanguages = [String(rawLanguages)];
        }
      } catch (e) {
        parsedLanguages = [String(rawLanguages)];
      }
    }

    const allowedLanguages = ["python", "c", "cpp", "java"];

    parsedLanguages = parsedLanguages
      .map((l) => l.toLowerCase())
      .filter((l) => allowedLanguages.includes(l));

    const contest = new Contest({
      name,
      conductedBy,
      numberOfProblems: Number(numberOfProblems),
      durationMinutes: Number(durationMinutes),
      bannerImage,
      languages: parsedLanguages,
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

    console.error("Contest creation failed:", err);
    return ErrorResponse(c, err.message || "Failed to create contest", 500);
  }
};
