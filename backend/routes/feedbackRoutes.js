const express = require("express");
const router = express.Router();
const {
  getAllFeedback, getFeedbackByResident,
  submitFeedback, deleteFeedback,
} = require("../controllers/feedbackController");

router.get("/get-feedback", getAllFeedback);
router.get("/get-feedback/:resident_ID", getFeedbackByResident);
router.post("/submit-feedback", submitFeedback);
router.delete("/delete-feedback/:feedback_ID", deleteFeedback);

module.exports = router;