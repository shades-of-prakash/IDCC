// models/contestFeedback.model.js
import mongoose from "mongoose";

const contestFeedbackSchema = new mongoose.Schema(
    {
        // Optional: if you pass a contestId from frontend/route
        contestId: {
            type: String,
            default: null,
        },
        // Array of ratings like [3, 4, 5, 4, 3, 5]
        answers: {
            type: [Number],
            required: true,
        },
        // Additional feedback text (optional)
        feedback: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true, // createdAt, updatedAt
    },
);

const ContestFeedback = mongoose.model(
    "ContestFeedback",
    contestFeedbackSchema,
);

export default ContestFeedback;
