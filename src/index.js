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

app.use(cors());
app.use(express.json());

// ✅ Log all API calls
app.use(morgan("dev"));

app.use("/api/resume", resumeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/feedback", feedbackRoutes);

app.get("/", (req, res) => {
  res.send("inkforge backend running 🚀");
});


// ✅ Simple error logger
app.use((err, req, res, next) => {
  console.error("Error:", err.message);
  console.error("Route:", req.originalUrl);
  console.error("Stack:", err.stack);

  res.status(500).json({
    message: "Something went wrong"
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});