import Contest from "../../models/contest.model.js";
import * as fs from "fs";
import * as path from "path";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

const PUBLIC_UPLOADS_BASE = path.join(process.cwd(), "public", "uploads");

export const createContest = async (c: Context) => {
    const uploadedFilePaths: string[] = [];
    let contest: any = null;

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

        /* ---------- UNIQUE NAME CHECK (CASE-INSENSITIVE) ---------- */
        const existingContest = await Contest.findOne({
            name: { $regex: `^${name}$`, $options: "i" },
        });

        if (existingContest) {
            return ErrorResponse(c, "Contest name already exists", 409);
        }

        /* ---------- LANGUAGES ---------- */
        const rawLanguages = formData.get("languages");
        let parsedLanguages: string[] = [];

        if (rawLanguages) {
            try {
                const arr = JSON.parse(String(rawLanguages));
                parsedLanguages = Array.isArray(arr)
                    ? arr.map(String)
                    : [String(rawLanguages)];
            } catch {
                parsedLanguages = [String(rawLanguages)];
            }
        }

        const allowedLanguages = ["python", "c", "cpp", "java"];
        parsedLanguages = parsedLanguages
            .map((l) => l.toLowerCase())
            .filter((l) => allowedLanguages.includes(l));

        /* ---------- ENSURE public/uploads EXISTS ---------- */
        if (!fs.existsSync(PUBLIC_UPLOADS_BASE)) {
            fs.mkdirSync(PUBLIC_UPLOADS_BASE, { recursive: true });
        }

        /* ---------- CREATE CONTEST ---------- */
        contest = new Contest({
            name: name.trim(),
            conductedBy,
            numberOfProblems: Number(numberOfProblems),
            durationMinutes: Number(durationMinutes),
            bannerImage: null,
            iconImage: null,
            languages: parsedLanguages,
        });

        await contest.save();
        const contestId = contest._id.toString();

        /* ---------- public/uploads/<contestId> ---------- */
        const contestDir = path.join(PUBLIC_UPLOADS_BASE, contestId);
        if (!fs.existsSync(contestDir)) {
            fs.mkdirSync(contestDir, { recursive: true });
        }

        /* ---------- FILE UPLOAD HELPER ---------- */
        const handleFileUpload = async (
            fieldName: string,
            prefix: string,
        ): Promise<string | null> => {
            const entry = formData.get(fieldName);

            if (entry && entry instanceof File) {
                const ext = path.extname(entry.name);
                const filename = `${prefix}-${Date.now()}-${Math.random()
                    .toString(36)
                    .slice(2)}${ext}`;

                const filePath = path.join(contestDir, filename);
                const buffer = Buffer.from(await entry.arrayBuffer());

                fs.writeFileSync(filePath, buffer);
                uploadedFilePaths.push(filePath);

                return `/api/uploads/${contestId}/${filename}`;
            }
            return null;
        };

        /* ---------- UPLOAD IMAGES ---------- */
        const bannerImage = await handleFileUpload("bannerImage", "banner");
        const iconImage = await handleFileUpload("iconImage", "icon");

        if (bannerImage) contest.bannerImage = bannerImage;
        if (iconImage) contest.iconImage = iconImage;

        await contest.save();

        return SuccessResponse(c, "Contest created successfully", 201, contest);
    } catch (err: any) {
        /* ---------- CLEANUP ---------- */
        for (const filepath of uploadedFilePaths) {
            try {
                if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
            } catch {}
        }

        if (contest?._id) {
            await Contest.findByIdAndDelete(contest._id).catch(() => {});
        }

        // Mongo unique index safety net
        if (err.code === 11000) {
            return ErrorResponse(c, "Contest name already exists", 409);
        }

        console.error("Contest creation failed:", err);
        return ErrorResponse(c, err.message || "Failed to create contest", 500);
    }
};
