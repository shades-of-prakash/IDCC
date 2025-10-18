import mongoose from "mongoose";

const ContestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    conductedBy: { type: String, default: "IDCC" },
    numberOfProblems: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    teamSize: { type: String, enum: ["Individual", "Team"], required: true },
    bannerImage: { type: String },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Problem",
      },
    ],
  },
  { timestamps: true }
);

const Contest = mongoose.model("Contest", ContestSchema);
export default Contest;
