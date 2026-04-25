import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  editCount: {
    type: Number,
    default: 0,
  },
  editResetTime: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

export default mongoose.model("User", userSchema);
