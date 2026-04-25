import express from "express";
import {
  generateResume,
  updateResume,
  downloadResume,
  getUsageStatus,
  getMyResume,
  getSingleResume
} from "../controllers/resume.controller.js";

import { protect } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/generate", protect, generateResume);
router.put("/:id", protect, updateResume);
router.get("/download/:id", protect, downloadResume); 
router.get("/usage", protect, getUsageStatus);
router.get("/my-resume", protect, getMyResume);
router.get("/single-resume/:id", protect, getSingleResume);

export default router;
