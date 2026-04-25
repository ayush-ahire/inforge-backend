import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    name: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Name must be at least 2 characters"],
    },
    contactNumber: {
      type: String, 
      required: false,
      trim: true,
      match: [/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"], 
    },
    email: {
      type: String,
      required: false,
      trim: true,
      lowercase: true,
      match: [/\S+@\S+\.\S+/, "Invalid email format"],
    },
    socialLinks: [
      {
        label: {
          type: String,
          required: true,
          trim: true,
        },
        link: {
          type: String,
          required: true,
          trim: true,
          match: [/^https?:\/\//, "Link must start with http/https"],
        },
      },
    ],
    photoUrl: {
      type: String,
      required: false,
      trim: true, // Optional: store S3/Cloudinary URL or base64
    },

    jobDescription: {
      type: String,
      required: [true, "Job description is required"],
      trim: true,
    },

    experience: [
      {
        company: { type: String, required: true, trim: true },
        role: { type: String, required: true, trim: true },
        startDate: { type: String, required: true, trim: true },
        endDate: { type: String, default: "Present", trim: true },
        description: { type: String, required: true, trim: true },
        location: {
          type: String,
          required: [true, "Location is required for experience entries"],
          trim: true,
        },
      },
    ],

    education: [
      {
        degree: { type: String, required: true, trim: true },
        institution: { type: String, required: true, trim: true },
        startYear: { type: String, required: true, trim: true },
        endYear: { type: String, required: true, trim: true },
        location: {
          type: String,
          required: false, // Nice-to-have for education
          trim: true,
        },
      },
    ],

    summary: { type: String, trim: true },
    skills: [{ type: String, trim: true }],
    projects: [
      {
        title: { type: String, trim: true },
        description: { type: String, trim: true },
        technologies: [{ type: String, trim: true }],
      },
    ],

    // ── Calculated Stats (added after generation) ──
    atsScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    riskLevel: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Low",
    },
    fabricationLevel: {
      type: String,
      enum: ["None", "Low", "Medium", "High"],
      default: "None",
    },

    // Metadata
    version: { type: Number, default: 1 }, // For future schema changes
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

export default mongoose.model("Resume", resumeSchema);