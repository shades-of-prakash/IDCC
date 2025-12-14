import type { Context } from "hono";
import mongoose from "mongoose";
import ExcelJS from "exceljs";

import Submission from "../../models/submission.model.js";
import Contest from "../../models/contest.model.js";
import { ErrorResponse } from "../../utils/response.js";

export const downloadResults = async (c: Context) => {
    try {
        const contestId = c.req.param("contestId");

        if (!contestId || !mongoose.Types.ObjectId.isValid(contestId)) {
            return ErrorResponse(c, "Invalid or missing contest ID", 400);
        }

        const contestObjectId = new mongoose.Types.ObjectId(contestId);

        /* =========================
           FETCH CONTEST NAME
        ========================== */
        const contest = await Contest.findById(contestObjectId)
            .select("name")
            .lean();

        const contestName = contest?.name || `contest-${contestId}`;

        // Make filename OS-safe
        const safeFileName = contestName
            .replace(/[^a-zA-Z0-9-_ ]/g, "")
            .replace(/\s+/g, "_");

        /* =========================
           AGGREGATION (UNCHANGED)
        ========================== */
        const result = await Submission.aggregate([
            {
                $match: {
                    contestId: contestObjectId,
                },
            },
            {
                $group: {
                    _id: {
                        userId: "$userId",
                        problemId: "$problemId",
                    },
                    bestPointsForProblem: { $max: "$awardedPoints" },
                    attemptsForProblem: { $sum: 1 },
                    lastSubmissionAt: { $max: "$createdAt" },
                    acceptedCountForProblem: {
                        $sum: {
                            $cond: [{ $eq: ["$status", "Accepted"] }, 1, 0],
                        },
                    },
                },
            },
            {
                $group: {
                    _id: "$_id.userId",
                    submissionCount: { $sum: "$attemptsForProblem" },
                    lastSubmissionAt: { $max: "$lastSubmissionAt" },
                    totalPoints: { $sum: "$bestPointsForProblem" },
                    acceptedCount: { $sum: "$acceptedCountForProblem" },
                    problemsSolvedCount: {
                        $sum: {
                            $cond: [
                                { $gt: ["$bestPointsForProblem", 0] },
                                1,
                                0,
                            ],
                        },
                    },
                    problemsSolved: {
                        $addToSet: {
                            $cond: [
                                { $gt: ["$bestPointsForProblem", 0] },
                                "$_id.problemId",
                                null,
                            ],
                        },
                    },
                },
            },
            {
                $addFields: {
                    problemsSolved: {
                        $setDifference: ["$problemsSolved", [null]],
                    },
                },
            },
            {
                $lookup: {
                    from: "userdetails",
                    localField: "_id",
                    foreignField: "userId",
                    as: "userDetails",
                },
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $sort: {
                    totalPoints: -1,
                    problemsSolvedCount: -1,
                    submissionCount: 1,
                    lastSubmissionAt: 1,
                },
            },
            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    submissionCount: 1,
                    lastSubmissionAt: 1,
                    totalPoints: 1,
                    acceptedCount: 1,
                    problemsSolvedCount: 1,
                    email: "$userDetails.email",
                    phone: "$userDetails.phone",
                    college: "$userDetails.college",
                    dept: "$userDetails.dept",
                    participants: "$userDetails.participants",
                },
            },
        ]);

        /* =========================
           EXCEL GENERATION
        ========================== */
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Contest Results");

        sheet.columns = [
            { header: "Rank", key: "rank", width: 8 },
            { header: "Participant 1 Name", key: "p1name", width: 22 },
            { header: "Participant 1 ID", key: "p1id", width: 18 },
            { header: "Participant 2 Name", key: "p2name", width: 22 },
            { header: "Participant 2 ID", key: "p2id", width: 18 },
            { header: "Email", key: "email", width: 30 },
            { header: "Phone", key: "phone", width: 15 },
            { header: "College", key: "college", width: 25 },
            { header: "Department", key: "dept", width: 18 },
            { header: "Total Points", key: "points", width: 14 },
            { header: "Solved", key: "solved", width: 10 },
            { header: "Submissions", key: "subs", width: 14 },
            { header: "Accepted", key: "accepted", width: 12 },
            { header: "Last Submission", key: "last", width: 22 },
        ];

        result.forEach((row, index) => {
            const p1 = row.participants?.[0] || {};
            const p2 = row.participants?.[1] || {};

            sheet.addRow({
                rank: index + 1,
                p1name: p1.name || "-",
                p1id: p1.regNo || "-",
                p2name: p2.name || "-",
                p2id: p2.regNo || "-",
                email: row.email || "-",
                phone: row.phone || "-",
                college: row.college || "-",
                dept: row.dept || "-",
                points: row.totalPoints ?? 0,
                solved: row.problemsSolvedCount ?? 0,
                subs: row.submissionCount ?? 0,
                accepted: row.acceptedCount ?? 0,
                last: row.lastSubmissionAt
                    ? new Date(row.lastSubmissionAt).toLocaleString()
                    : "-",
            });
        });

        /* =========================
           RESPONSE (BINARY)
        ========================== */
        c.header(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        );
        c.header(
            "Content-Disposition",
            `attachment; filename="${safeFileName}.xlsx"`,
        );

        const buffer = await workbook.xlsx.writeBuffer();
        return c.body(buffer);
    } catch (err: any) {
        console.error("Export error:", err);
        return ErrorResponse(
            c,
            err.message || "Failed to export contest results",
            500,
        );
    }
};
