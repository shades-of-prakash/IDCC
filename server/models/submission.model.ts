import mongoose from "mongoose";

const TestResultSchema = new mongoose.Schema(
    {
        testcase: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "TestCase",
            required: true,
        },
        input: { type: String, default: "" },
        output: { type: String, default: "" },
        expected: { type: String, default: "" },
        passed: { type: Boolean, default: false },
        error: { type: String, default: null },
        isHidden: { type: Boolean, default: false },
        pointsAwarded: { type: Number, default: 0 },
    },
    { _id: false },
);

const SubmissionSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        problemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Problem",
            required: true,
        },

        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            required: true,
        },

        language: {
            type: String,
            enum: ["c", "cpp", "java", "python"],
            required: true,
        },

        code: {
            type: String,
            required: true,
        },

        totalTests: { type: Number, required: true },
        passedTests: { type: Number, required: true },

        maxPoints: { type: Number, required: true },
        pointsPerTest: { type: Number, required: true },
        awardedPoints: { type: Number, required: true },

        results: [TestResultSchema],

        status: {
            type: String,
            enum: [
                "Accepted",
                "Wrong Answer",
                "Runtime Error",
                "Compile Error",
            ],
            required: true,
        },
    },
    { timestamps: true },
);

// OPTIONAL BUT HIGHLY RECOMMENDED
// Ensures 1 submission per (user, contest, problem)
SubmissionSchema.index({ user: 1, contest: 1, problem: 1 }, { unique: true });

const Submission = mongoose.model("Submission", SubmissionSchema);
export default Submission;
