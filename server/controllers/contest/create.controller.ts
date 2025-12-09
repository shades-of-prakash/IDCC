import Contest from "../../models/contest.model.js";
import * as fs from "fs";
import * as path from "path";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

const UPLOADS_PATH = path.join("uploads", "contests");

export const createContest = async (c: Context) => {
    // Array to hold paths of uploaded files for cleanup in case of error
    const uploadedFilePaths: string[] = [];

    try {
        const formData = await c.req.formData();

        const name = formData.get("name") as string | null;
        const conductedBy =
            (formData.get("conductedBy") as string | null) || "IDCC";
        const numberOfProblems = formData.get("numberOfProblems") as
            | string
            | null;
        const durationMinutes = formData.get("durationMinutes") as
            | string
            | null;

        if (!name || !numberOfProblems || !durationMinutes) {
            return ErrorResponse(c, "Missing required fields", 400);
        }

        if (!fs.existsSync(UPLOADS_PATH)) {
            fs.mkdirSync(UPLOADS_PATH, { recursive: true });
        }

        let bannerImage: string | null = null;
        let iconImage: string | null = null; // New state variable

        /** ---------- FILE UPLOAD UTILITY FUNCTION ---------- **/
        const handleFileUpload = async (
            fileKey: string,
        ): Promise<string | null> => {
            const fileEntry = formData.get(fileKey);

            if (fileEntry && fileEntry instanceof File) {
                const file = fileEntry as File;
                const filename = `${Date.now()}-${fileKey}${path.extname(file.name)}`;
                const filepath = path.join(UPLOADS_PATH, filename);

                const buffer = Buffer.from(await file.arrayBuffer());
                fs.writeFileSync(filepath, buffer);
                uploadedFilePaths.push(filepath); // Add to cleanup list

                return `/contests/${filename}`; // Return the public path
            }
            return null;
        };

        /** ---------- HANDLE BANNER IMAGE UPLOAD ---------- **/
        bannerImage = await handleFileUpload("bannerImage");

        /** ---------- HANDLE CONTEST ICON UPLOAD (NEW) ---------- **/
        iconImage = await handleFileUpload("iconImage");

        /** ---------- PARSE LANGUAGES ---------- **/
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

        /** ---------- CREATE CONTEST ---------- **/
        const contest = new Contest({
            name,
            conductedBy,
            numberOfProblems: Number(numberOfProblems),
            durationMinutes: Number(durationMinutes),
            bannerImage,
            iconImage, // Save the new icon path
            languages: parsedLanguages,
        });

        await contest.save();

        return SuccessResponse(c, "Contest created successfully", 201, contest);
    } catch (err: any) {
        // Cleanup: remove all successfully uploaded files in case of an error
        if (uploadedFilePaths.length > 0) {
            uploadedFilePaths.forEach((filepath) => {
                if (fs.existsSync(filepath)) {
                    try {
                        fs.unlinkSync(filepath);
                    } catch (cleanupErr) {
                        console.error(
                            `Failed to remove uploaded file ${filepath}:`,
                            cleanupErr,
                        );
                    }
                }
            });
        }

        console.error("Contest creation failed:", err);
        return ErrorResponse(c, err.message || "Failed to create contest", 500);
    }
};
