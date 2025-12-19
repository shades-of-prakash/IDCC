import mongoose from "mongoose";

const contestFeedbackSchema = new mongoose.Schema(
    {
        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            required: true,
        },

        answers: {
            type: [Number],
            required: true,
        },

        feedback: {
            type: String,
            trim: true,
            default: "",
        },
    },
    {
        timestamps: true,
    },
);

const ContestFeedback = mongoose.model(
    "ContestFeedback",
    contestFeedbackSchema,
);

export default ContestFeedback;
