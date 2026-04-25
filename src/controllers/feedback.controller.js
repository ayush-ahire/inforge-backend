import Feedback from "../models/feedback.model.js";

export const createFeedback = async (req, res) => {
    try {
        const { name, email, comment } = req.body;
        const feedback = new Feedback({ name, email, comment });
        await feedback.save();
        res.status(201).json({ message: "Feedback created successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to create feedback" });
    }
}

export const getAllFeedback = async (req, res) => {
    try {
        const feedback = await Feedback.find();
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message: "Failed to get feedback" });
    }
}

export const deleteFeedback = async (req, res) => {
    try {
        const { id } = req.params;
        await Feedback.findByIdAndDelete(id);
        res.status(200).json({ message: "Feedback deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete feedback" });
    }
}

export const getFeedbackById = async (req, res) => {
    try {
        const { id } = req.params;
        const feedback = await Feedback.findById(id);
        res.status(200).json(feedback);
    } catch (error) {
        res.status(500).json({ message: "Failed to get feedback" });
    }
}