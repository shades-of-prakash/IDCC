import Contest from "../../models/contest.model.js";
import * as fs from "fs";
import * as path from "path";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

// Base uploads folder: <project-root>/uploads
const UPLOADS_BASE = path.join(process.cwd(), "public", "uploads");

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

        /** ---------- ENSURE uploads/<contestId> FOLDER ---------- **/
        const contestId = existing._id.toString();
        if (!fs.existsSync(UPLOADS_BASE)) {
            fs.mkdirSync(UPLOADS_BASE, { recursive: true });
        }

        const contestDir = path.join(UPLOADS_BASE, contestId);
        if (!fs.existsSync(contestDir)) {
            fs.mkdirSync(contestDir, { recursive: true });
        }

        /** ---------- HELPER TO DELETE OLD FILES BY URL ---------- **/
        const deleteOldFileByUrl = (url?: string | null) => {
            if (!url) return;

            // Format 1: /api/upload/<contestId>/<filename>
            if (url.startsWith("/api/upload/")) {
                const parts = url.split("/"); // ["", "api", "upload", contestId, filename]
                if (parts.length >= 5) {
                    const oldContestId = parts[3];
                    const filename = parts[4];
                    const filePath = path.join(
                        UPLOADS_BASE,
                        oldContestId,
                        filename,
                    );

                    if (fs.existsSync(filePath)) {
                        try {
                            fs.unlinkSync(filePath);
                            console.log("Deleted old file:", filePath);
                        } catch (err) {
                            console.error(
                                "Failed to delete old file:",
                                filePath,
                                err,
                            );
                        }
                    }
                }
                return;
            }

            // Format 2 (legacy): /uploads/<contestId>/<filename>
            if (url.startsWith("/uploads/")) {
                const parts = url.split("/"); // ["", "uploads", contestId, filename]
                if (parts.length >= 4) {
                    const oldContestId = parts[2];
                    const filename = parts[3];
                    const filePath = path.join(
                        UPLOADS_BASE,
                        oldContestId,
                        filename,
                    );

                    if (fs.existsSync(filePath)) {
                        try {
                            fs.unlinkSync(filePath);
                            console.log("Deleted old legacy file:", filePath);
                        } catch (err) {
                            console.error(
                                "Failed to delete old legacy file:",
                                filePath,
                                err,
                            );
                        }
                    }
                }
                return;
            }

            // You can add more legacy formats here if you had older schemes
            console.warn(
                "Unrecognized image URL format, skipping delete:",
                url,
            );
        };

        /** ---------- HANDLE BANNER UPLOAD ---------- **/
        let bannerImage = existing.bannerImage; // default = old banner
        const bannerFile = formData.get("bannerImage");

        if (bannerFile && bannerFile instanceof File) {
            const file = bannerFile as File;
            const filename = `${Date.now()}-banner${path.extname(file.name)}`;

            // Physical path: uploads/<contestId>/<filename>
            const filepath = path.join(contestDir, filename);

            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(filepath, buffer);
            uploadedBannerPath = filepath;

            // Public URL stored in DB: /api/upload/<contestId>/<filename>
            bannerImage = `/api/uploads/${contestId}/${filename}`;

            // delete old banner file if exists
            if (existing.bannerImage) {
                deleteOldFileByUrl(existing.bannerImage);
            }
        }

        /** ---------- HANDLE ICON UPLOAD ---------- **/
        let iconImage = (existing as any).iconImage; // default = old icon
        const iconFile = formData.get("iconImage");

        if (iconFile && iconFile instanceof File) {
            const file = iconFile as File;
            const filename = `${Date.now()}-icon${path.extname(file.name)}`;

            // Physical path: uploads/<contestId>/<filename>
            const filepath = path.join(contestDir, filename);

            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(filepath, buffer);
            uploadedIconPath = filepath;

            iconImage = `/uploads/${contestId}/${filename}`;

            // delete old icon file if exists
            if ((existing as any).iconImage) {
                deleteOldFileByUrl((existing as any).iconImage);
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
        (existing as any).iconImage = iconImage;
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
