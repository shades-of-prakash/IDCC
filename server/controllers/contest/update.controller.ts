import Contest from "../../models/contest.model.js";
import * as fs from "fs";
import * as path from "path";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

const UPLOADS_PATH = path.join("uploads", "contests");

export const updateContest = async (c: Context) => {
    let uploadedBannerPath: string | null = null;
    let uploadedIconPath: string | null = null;

    try {
        const id = c.req.param("id");
        const existing = await Contest.findById(id);

        if (!existing) {
            return ErrorResponse(c, "Contest not found", 404);
        }

        const formData = await c.req.formData();

        const name = formData.get("name") as string | null;
        const conductedBy = formData.get("conductedBy") as string | null;
        const numberOfProblems = formData.get("numberOfProblems") as
            | string
            | null;
        const durationMinutes = formData.get("durationMinutes") as
            | string
            | null;

        /** ---------- ENSURE UPLOADS FOLDER ---------- **/
        if (!fs.existsSync(UPLOADS_PATH)) {
            fs.mkdirSync(UPLOADS_PATH, { recursive: true });
        }

        /** ---------- HANDLE BANNER UPLOAD ---------- **/
        let bannerImage = existing.bannerImage; // default = old banner
        const bannerFile = formData.get("bannerImage");

        if (bannerFile && bannerFile instanceof File) {
            const file = bannerFile as File;
            const filename = `${Date.now()}${path.extname(file.name)}`;
            const filepath = path.join(UPLOADS_PATH, filename);

            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(filepath, buffer);
            uploadedBannerPath = filepath;

            // what you store in DB (used later as /contests/... from backend url)
            bannerImage = `/contests/${filename}`;

            // delete old banner file if exists
            if (existing.bannerImage) {
                const oldPath = path.join(
                    "uploads",
                    existing.bannerImage.replace("/contests/", "contests/"),
                );
                if (fs.existsSync(oldPath)) {
                    try {
                        fs.unlinkSync(oldPath);
                    } catch (err) {
                        console.error("Failed to delete old banner:", err);
                    }
                }
            }
        }

        /** ---------- HANDLE ICON UPLOAD (NEW) ---------- **/
        let iconImage = (existing as any).iconImage; // default = old icon
        const iconFile = formData.get("iconImage");

        if (iconFile && iconFile instanceof File) {
            const file = iconFile as File;
            const filename = `${Date.now()}-icon${path.extname(file.name)}`;
            const filepath = path.join(UPLOADS_PATH, filename);

            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(filepath, buffer);
            uploadedIconPath = filepath;

            // what you store in DB
            iconImage = `/contests/${filename}`;

            // delete old icon file if exists
            if ((existing as any).iconImage) {
                const oldIconPath = path.join(
                    "uploads",
                    (existing as any).iconImage.replace(
                        "/contests/",
                        "contests/",
                    ),
                );
                if (fs.existsSync(oldIconPath)) {
                    try {
                        fs.unlinkSync(oldIconPath);
                    } catch (err) {
                        console.error("Failed to delete old icon:", err);
                    }
                }
            }
        }

        /** ---------- PARSE LANGUAGES ---------- **/
        const rawLanguages = formData.get("languages");

        let parsedLanguages: string[] = [];

        if (rawLanguages) {
            try {
                const arr = JSON.parse(String(rawLanguages));
                parsedLanguages = Array.isArray(arr)
                    ? arr.map(String)
                    : [String(rawLanguages)];
            } catch (e) {
                parsedLanguages = [String(rawLanguages)];
            }
        } else {
            // If no languages sent → keep old languages
            parsedLanguages = existing.languages;
        }

        const allowedLanguages = ["python", "c", "cpp", "java"];
        parsedLanguages = parsedLanguages
            .map((l) => l.toLowerCase())
            .filter((l) => allowedLanguages.includes(l));

        /** ---------- PARSE INSTRUCTIONS ---------- **/
        const rawInstructions = formData.get("instructions");

        let parsedInstructions: string[] = [];

        if (rawInstructions) {
            try {
                const arr = JSON.parse(String(rawInstructions));
                parsedInstructions = Array.isArray(arr)
                    ? arr.map(String)
                    : [String(rawInstructions)];
            } catch (e) {
                console.error("Failed to parse instructions JSON:", e);
                parsedInstructions = [String(rawInstructions)];
            }
            parsedInstructions = parsedInstructions
                .map((i) => String(i).trim())
                .filter((i) => i.length > 0);
        } else {
            parsedInstructions = existing.instructions;
        }

        /** ---------- APPLY UPDATES ---------- **/
        existing.name = name ?? existing.name;
        existing.conductedBy = conductedBy ?? existing.conductedBy;
        existing.numberOfProblems = numberOfProblems
            ? Number(numberOfProblems)
            : existing.numberOfProblems;

        existing.durationMinutes = durationMinutes
            ? Number(durationMinutes)
            : existing.durationMinutes;

        existing.bannerImage = bannerImage;
        (existing as any).iconImage = iconImage; // NEW: save icon path
        existing.languages = parsedLanguages;
        existing.instructions = parsedInstructions;

        await existing.save();

        return SuccessResponse(
            c,
            "Contest updated successfully",
            200,
            existing,
        );
    } catch (err: any) {
        // cleanup newly uploaded files on failure
        if (uploadedBannerPath && fs.existsSync(uploadedBannerPath)) {
            try {
                fs.unlinkSync(uploadedBannerPath);
            } catch (cleanupErr) {
                console.error(
                    "Failed to remove uploaded banner file:",
                    cleanupErr,
                );
            }
        }
        if (uploadedIconPath && fs.existsSync(uploadedIconPath)) {
            try {
                fs.unlinkSync(uploadedIconPath);
            } catch (cleanupErr) {
                console.error(
                    "Failed to remove uploaded icon file:",
                    cleanupErr,
                );
            }
        }

        console.error("Contest update failed:", err);
        return ErrorResponse(c, err.message || "Failed to update contest", 500);
    }
};
