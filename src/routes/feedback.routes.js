import express from "express";
import { createFeedback, deleteFeedback, getAllFeedback, getFeedbackById } from "../controllers/feedback.controller.js";

const router = express.Router();

router.post("/", createFeedback);
router.get("/", getAllFeedback);
router.get("/:id", getFeedbackById);
router.delete("/:id", deleteFeedback);

export default router;
