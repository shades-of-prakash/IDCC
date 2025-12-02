import mongoose from "mongoose";

const { Schema } = mongoose;

const TestcaseResultSchema = new Schema(
  {
    visibility: {
      type: String,
      enum: ["visible", "hidden"],
      default: "visible",
    },
    hidden: {
      type: Boolean,
      default: false,
    },

    input: {
      type: String,
      default: null,
    },
    expected: {
      type: String,
      default: null,
    },
    output: {
      type: String,
      default: "",
    },

    passed: {
      type: Boolean,
      default: null,
    },

    error: {
      type: String,
      default: null,
    },
  },
  { _id: false },
);

const SubmissionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    problem: {
      type: Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    code: {
      type: String,
      required: true,
    },

    results: {
      type: [TestcaseResultSchema],
      default: [],
    },

    totalTests: {
      type: Number,
      default: 0,
    },

    passedCount: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: [
        "ACCEPTED",
        "PARTIAL",
        "WRONG_ANSWER",
        "RUNTIME_ERROR",
        "COMPILATION_ERROR",
      ],
      default: "PARTIAL",
    },
  },
  { timestamps: true },
);

const Submission =
  mongoose.models.Submission || mongoose.model("Submission", SubmissionSchema);

export default Submission;
