import mongoose from "mongoose";

const TestCaseSchema = new mongoose.Schema(
    {
        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
        },

        rawInput: {
            type: String,
            required: true,
        },

        input: {
            type: mongoose.Schema.Types.Mixed,
            required: false,
            default: null,
        },

        output: {
            type: String,
            required: true,
        },

        points: {
            type: Number,
            required: true,
            min: 0,
        },

        isHidden: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

const TestCase = mongoose.model("TestCase", TestCaseSchema);
export default TestCase;
