import mongoose from "mongoose";

const ProblemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        outputType: {
            type: String,
            default: null,
        },

        arguments: [
            {
                name: {
                    type: String,
                    trim: true,
                },
                type: {
                    type: String,
                    trim: true,
                },
            },
        ],

        statement: {
            type: String,
            default: "",
        },

        testcases: [
            {
                type: mongoose.Schema.Types.ObjectId,
                ref: "TestCase",
            },
        ],

        submittedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Admin",
            required: true,
        },

        contestId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Contest",
            required: true,
        },

        status: {
            type: String,
            enum: ["pending", "finalized"],
            default: "pending",
        },

        isCompleted: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

const Problem = mongoose.model("Problem", ProblemSchema);
export default Problem;
