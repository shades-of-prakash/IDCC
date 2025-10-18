import mongoose from "mongoose";

const ProblemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    points: { type: Number, required: true, min: 0, default: 10 },
    arguments: { type: Array, required: true },
    functionName: { type: String, required: true },
    hiddenTests: { type: Array, default: [] },
    visibleTests: { type: Array, default: [] },
    returnType: { type: String, required: true },
    statement: { type: String, default: "" },
    submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: "Admin" },
    contestId: { type: mongoose.Schema.Types.ObjectId, ref: "Contest" },
    status: {
      type: String,
      enum: ["pending", "finalized"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Problem = mongoose.model("Problem", ProblemSchema);
export default Problem;
