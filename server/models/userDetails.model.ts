import mongoose, { Schema } from "mongoose";

const participantSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    regNo: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { _id: false },
);

const userDetailsSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  contestId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Contest",
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
  },
  college: {
    type: String,
    required: true,
  },
  dept: {
    type: String,
    required: true,
  },

  participants: {
    type: [participantSchema],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const UserDetails = mongoose.model("UserDetails", userDetailsSchema);

export default UserDetails;
