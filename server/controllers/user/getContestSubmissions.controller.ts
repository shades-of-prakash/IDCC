import type { Context } from "hono";
import mongoose from "mongoose";
import Submission from "../../models/submission.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";

export const getContestUserSubmissionSummary = async (c: Context) => {
    try {
        const contestId = c.req.param("contestId");

        if (!contestId || !mongoose.Types.ObjectId.isValid(contestId)) {
            return ErrorResponse(c, "Invalid contest ID", 400);
        }

        const contestObjectId = new mongoose.Types.ObjectId(contestId);

        const search = (c.req.query("search") || "").trim();
        const page = Math.max(parseInt(c.req.query("page") || "1", 10), 1);
        const limit = Math.min(
            Math.max(parseInt(c.req.query("limit") || "25", 10), 1),
            200,
        );
        const skip = (page - 1) * limit;

        const userMatch: any = {};

        if (search) {
            userMatch.$or = [
                { "userDetails.email": { $regex: search, $options: "i" } },
                { "userDetails.phone": { $regex: search, $options: "i" } },
                {
                    "userDetails.participants.name": {
                        $regex: search,
                        $options: "i",
                    },
                },
                {
                    "userDetails.participants.regNo": {
                        $regex: search,
                        $options: "i",
                    },
                },
            ];
        }

        const result = await Submission.aggregate([
            { $match: { contestId: contestObjectId } },

            {
                $group: {
                    _id: { userId: "$userId", problemId: "$problemId" },
                    bestPoints: { $max: "$awardedPoints" },
                    attempts: { $sum: 1 },
                },
            },
            {
                $group: {
                    _id: "$_id.userId",
                    totalPoints: { $sum: "$bestPoints" },
                    submissionCount: { $sum: "$attempts" },
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
            { $unwind: "$userDetails" },

            { $match: userMatch },

            { $sort: { totalPoints: -1, submissionCount: 1 } },
            { $skip: skip },
            { $limit: limit },

            {
                $project: {
                    _id: 0,
                    userId: "$_id",
                    totalPoints: 1,
                    submissionCount: 1,
                    email: "$userDetails.email",
                    phone: "$userDetails.phone",
                    college: "$userDetails.college",
                    dept: "$userDetails.dept",
                    participants: "$userDetails.participants",
                },
            },
        ]);

        return SuccessResponse(c, "Contest results fetched", 200, result);
    } catch (err: any) {
        console.error(err);
        return ErrorResponse(c, "Failed to fetch contest results", 500);
    }
};
