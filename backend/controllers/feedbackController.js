const db = require("../config/db");

// GET /get-feedback  (all feedback for admin)
const getAllFeedback = (req, res) => {
  const sql = `
    SELECT f.feedback_ID, f.comment, f.rating, f.submitted_date, f.resident_ID, r.name AS resident_name
    FROM feedback f
    LEFT JOIN resident r ON f.resident_ID = r.resident_ID
    ORDER BY f.submitted_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error." });
    res.json({ success: true, feedback: results });
  });
};

// GET /get-feedback/:resident_ID
const getFeedbackByResident = (req, res) => {
  const { resident_ID } = req.params;
  const sql = `SELECT feedback_ID, comment, rating, submitted_date FROM feedback WHERE resident_ID = ? ORDER BY submitted_date DESC`;
  db.query(sql, [resident_ID], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error." });
    res.json({ success: true, feedback: results });
  });
};

// POST /submit-feedback
const submitFeedback = (req, res) => {
  const { comment, rating, resident_ID } = req.body;

  if (!rating || !resident_ID)
    return res.status(400).json({ success: false, message: "Rating and resident_ID are required." });

  if (rating < 1 || rating > 5)
    return res.status(400).json({ success: false, message: "Rating must be between 1 and 5." });

  db.query("SELECT COUNT(*) AS cnt FROM feedback", (err, countResult) => {
    if (err) return res.status(500).json({ success: false, message: "Database error." });

    const count = countResult[0].cnt + 1;
    const feedback_ID = "F" + String(count).padStart(3, "0");
    const submitted_date = new Date().toISOString().split("T")[0];

    const insertSql = `INSERT INTO feedback (feedback_ID, comment, rating, submitted_date, resident_ID) VALUES (?,?,?,?,?)`;
    db.query(insertSql, [feedback_ID, comment || "", rating, submitted_date, resident_ID], (err) => {
      if (err) return res.status(500).json({ success: false, message: "Failed to submit feedback." });
      res.status(200).json({ success: true, message: "Feedback submitted successfully.", feedback_ID });
    });
  });
};

// DELETE /delete-feedback/:feedback_ID
const deleteFeedback = (req, res) => {
  const { feedback_ID } = req.params;
  db.query("DELETE FROM feedback WHERE feedback_ID = ?", [feedback_ID], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Error deleting feedback." });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Feedback not found." });
    res.status(200).json({ success: true, message: "Feedback deleted successfully." });
  });
};

module.exports = { getAllFeedback, getFeedbackByResident, submitFeedback, deleteFeedback };