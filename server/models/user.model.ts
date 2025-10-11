import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    hash: {
      type: String,
      required: true,
    },
    contestId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

export default User;
