import mongoose from "mongoose";

const ContestSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true },
        conductedBy: { type: String, default: "IDCC" },
        numberOfProblems: { type: Number, required: true },
        durationMinutes: { type: Number, required: true },
        bannerImage: { type: String },
        iconImage: { type: String },
        isRunning: { type: Boolean, default: false },
        languages: {
            type: [String],
            default: [],
        },
        instructions: {
            type: [String],
            default: [],
        },
        questions: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Problem",
            },
        ],
    },
    { timestamps: true },
);

const Contest = mongoose.model("Contest", ContestSchema);
export default Contest;
