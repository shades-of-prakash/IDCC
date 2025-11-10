import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
    },
    sessionStart: { type: Date, default: Date.now },
    elapsedTime: { type: Number, default: 0 },
    lastActive: { type: Date, default: Date.now },
    email: String,
    phone: String,
    college: String,
    dept: String,
    participants: Array,
    contestDetails: Object,
  },
  { timestamps: true },
);

const Session = mongoose.model("Session", sessionSchema);
export default Session;
