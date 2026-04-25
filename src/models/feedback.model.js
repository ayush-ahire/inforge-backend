import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Please enter a valid email address"],
    },

    comment: {
      type: String,
      trim: true,
      maxlength: [1000, "Comment cannot be longer than 1000 characters"],
      default: "",
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
  }
);



export default mongoose.model("Feedback", feedbackSchema);