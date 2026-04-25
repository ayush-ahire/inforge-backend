import "dotenv/config";
import express from "express";
import { connectDB } from "./config/db.js";
import cors from "cors";
import morgan from "morgan";

import resumeRoutes from "./routes/resume.routes.js";
import authRoutes from "./routes/auth.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";

// connect to database
connectDB();

const app = express();

// ✅ CORS (FIXED)
app.use(
  cors({
    origin: ["http://localhost:3000", "https://inkforge-jade.vercel.app"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Logs
app.use(morgan("dev"));

// ✅ Routes
app.use("/api/resume", resumeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

// ✅ Health check
app.get("/", (req, res) => {
  res.send("inkforge backend running 🚀");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "OK" });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Route:", req.originalUrl);
  console.error("Stack:", err.stack);

  res.status(500).json({
    message: err.message || "Something went wrong",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
