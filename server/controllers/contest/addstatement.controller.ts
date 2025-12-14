import fs from "node:fs";
import path from "node:path";
import Problem from "../../models/problem.model.js";
import Contest from "../../models/contest.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { Context } from "hono";

/**
 * Extract image src URLs from HTML
 */
function extractImageUrls(html: string): string[] {
    const regex = /<img[^>]+src=["']([^"']+)["']/g;
    return [...html.matchAll(regex)].map((m) => m[1]);
}

export const updateProblemStatement = async (c: Context) => {
    try {
        const body = await c.req.parseBody({ all: true });

        const problemId = body["problemId"] as string | undefined;
        let statement = body["statement"] as string | undefined;
        const uploadedFilesRaw = body["images"] as File | File[] | undefined;

        if (!problemId || !statement) {
            return ErrorResponse(
                c,
                "problemId and statement are required",
                400,
            );
        }

        const problem = await Problem.findById(problemId);
        if (!problem) return ErrorResponse(c, "Problem not found", 404);

        const contest = await Contest.findById(problem.contestId);
        if (!contest) return ErrorResponse(c, "Contest not found", 404);

        if (contest.isRunning) {
            return ErrorResponse(
                c,
                "Cannot update while contest is running",
                400,
            );
        }

        const contestIdStr = contest._id.toString();

        /**
         * Paths
         */
        const uploadsBase = path.join(process.cwd(), "public", "uploads");
        const uploadDir = path.join(uploadsBase, contestIdStr, problemId);

        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        /**
         * Normalize uploaded files
         */
        const uploadedFiles: File[] = Array.isArray(uploadedFilesRaw)
            ? uploadedFilesRaw
            : uploadedFilesRaw
              ? [uploadedFilesRaw]
              : [];

        /**
         * OLD images (from DB)
         */
        const oldStatement = problem.statement || "";
        const oldImages = extractImageUrls(oldStatement).filter((src) =>
            src.startsWith("/api/uploads/"),
        );

        /**
         * Replace temp image src with uploaded images
         */
        const imgTagRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/g;
        const matches = [...statement.matchAll(imgTagRegex)];

        let fileIndex = 0;

        for (const match of matches) {
            const originalSrc = match[1];

            // Already stored or external → skip
            if (
                originalSrc.startsWith("/api/uploads/") ||
                originalSrc.startsWith("http://") ||
                originalSrc.startsWith("https://")
            ) {
                continue;
            }

            const file = uploadedFiles[fileIndex++];
            if (!file) continue;

            let ext = path.extname((file as any).name || "");
            if (!ext) {
                if (file.type.includes("jpeg")) ext = ".jpg";
                else if (file.type.includes("gif")) ext = ".gif";
                else if (file.type.includes("webp")) ext = ".webp";
                else if (file.type.includes("svg")) ext = ".svg";
                else ext = ".png";
            }

            const fileName = `img-${Date.now()}-${Math.random()
                .toString(36)
                .slice(2)}${ext}`;

            const filePath = path.join(uploadDir, fileName);
            const buffer = Buffer.from(await file.arrayBuffer());
            fs.writeFileSync(filePath, buffer);

            const publicUrl = `/api/uploads/${contestIdStr}/${problemId}/${fileName}`;
            statement = statement.replace(originalSrc, publicUrl);
        }

        /**
         * NEW images (after update)
         */
        const newImages = extractImageUrls(statement).filter((src) =>
            src.startsWith("/api/uploads/"),
        );

        /**
         * DELETE removed images
         */
        const removedImages = oldImages.filter(
            (img) => !newImages.includes(img),
        );

        for (const imgUrl of removedImages) {
            const relativePath = imgUrl.replace("/api/uploads/", "");
            const filePath = path.join(uploadsBase, relativePath);

            // Safety check
            if (!filePath.startsWith(uploadsBase)) continue;

            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        /**
         * Save updated statement
         */
        problem.statement = statement;
        await problem.save();

        return SuccessResponse(
            c,
            "Problem statement updated successfully",
            200,
            problem,
        );
    } catch (err: any) {
        console.error("updateProblemStatement failed:", err);
        return ErrorResponse(
            c,
            err.message || "Failed to update problem statement",
            500,
        );
    }
};
