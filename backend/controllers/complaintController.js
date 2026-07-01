const db = require("../config/db");
const path = require("path");
const fs = require("fs");

// get-complaints resident_ID
const getComplaintsByResident = (req, res) => {
  const { resident_ID } = req.params;
  const sql = `
    SELECT complaint_ID, resident_ID, complaint_type, description, image, location, status, date
    FROM complaint WHERE resident_ID = ? ORDER BY date DESC
  `;
  db.query(sql, [resident_ID], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error." });
    res.json({ success: true, complaints: results });
  });
};

//get all complaints
const getAllComplaints = (req, res) => {
  const sql = `
    SELECT c.complaint_ID, c.resident_ID, c.complaint_type, c.description, c.image,
           c.location, c.status, c.date, r.name AS resident_name, r.email AS resident_email
    FROM complaint c
    LEFT JOIN resident r ON c.resident_ID = r.resident_ID
    ORDER BY c.date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error." });
    res.json({ success: true, complaints: results });
  });
};

// submit-complaint
const submitComplaint = (req, res) => {
  const { complaint_type, description, location, date, resident_ID } = req.body;

  if (!complaint_type || !location || !resident_ID)
    return res.status(400).json({ success: false, message: "complaint_type, location, and resident_ID are required." });

  const image = req.file ? req.file.filename : null;
  const complaintDate = date || new Date().toISOString().split("T")[0];
  const insertSql = `
    INSERT INTO complaint (complaint_type, description, image, location, status, resident_ID, date)
    VALUES (?,?,?,?,?,?,?)
  `;
  db.query(insertSql, [complaint_type, description || "", image, location, "pending", resident_ID, complaintDate], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to submit complaint." });
    res.status(200).json({ success: true, message: "Complaint submitted successfully.", complaint_ID: result.insertId });
  });
};
// update complaint status
const updateComplaintStatus = (req, res) => {
  const { complaint_ID } = req.params;
  const { status } = req.body;
  const allowed = ["pending", "in progress", "completed"];
  if (!status || !allowed.includes(status))
    return res.status(400).json({ success: false, message: "status must be one of: pending, in progress, completed" });
  db.query("UPDATE complaint SET status = ? WHERE complaint_ID = ?", [status, complaint_ID], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error." });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Complaint not found." });
    res.status(200).json({ success: true, message: "Status updated successfully." });
  });
};

// delete complaint
const deleteComplaint = (req, res) => {
  const { complaint_ID } = req.params;
  db.query("SELECT image FROM complaint WHERE complaint_ID = ?", [complaint_ID], (err, rows) => {
    if (!err && rows.length > 0 && rows[0].image) {
      const imgPath = path.join(__dirname, "../uploads", rows[0].image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }
    db.query("DELETE FROM complaint WHERE complaint_ID = ?", [complaint_ID], (err, result) => {
      if (err) return res.status(500).json({ success: false, message: "Error deleting complaint." });
      if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Complaint not found." });
      res.status(200).json({ success: true, message: "Complaint deleted successfully." });
    });
  });
};
// get recent complaints for admin dashboard
const getRecentComplaints = (req, res) => {
  const sql = `
    SELECT c.complaint_ID, c.complaint_type, c.status, c.date,
           r.name AS resident_name
    FROM complaint c
    LEFT JOIN resident r ON c.resident_ID = r.resident_ID
    WHERE c.status IN ('pending', 'in progress')
    ORDER BY c.date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error." });
    res.json({ success: true, complaints: results });
  });
};
module.exports = { getComplaintsByResident, getAllComplaints, submitComplaint, updateComplaintStatus, deleteComplaint, getRecentComplaints };