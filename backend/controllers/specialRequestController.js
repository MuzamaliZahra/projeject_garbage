const db = require("../config/db");

// GET /special-requests/:residentID
const getRequestsByResident = (req, res) => {
  const { residentID } = req.params;
  const sql = `
    SELECT request_ID, request_date, request_time, location, email,
           address, description, status, schedule_date, schedule_time, item_type
    FROM special_request WHERE resident_ID = ? ORDER BY request_date DESC, request_time DESC
  `;
  db.query(sql, [residentID], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error." });
    res.json({ success: true, requests: results });
  });
};

// POST /special-requests
const createRequest = (req, res) => {
  const { resident_ID, location, email, address, description, item_type, request_date, request_time } = req.body;

  if (!resident_ID || !location || !email || !address || !item_type || !request_date || !request_time)
    return res.status(400).json({ success: false, message: "All required fields must be provided." });

  const sql = `
    INSERT INTO special_request (request_date, request_time, location, email, address, description, status, resident_ID, item_type)
    VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
  `;
  db.query(sql, [request_date, request_time, location, email, address, description || null, resident_ID, item_type], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to submit request." });
    res.json({ success: true, message: "Request submitted successfully.", request_ID: result.insertId });
  });
};

// GET /admin/special-requests
const getAllRequests = (req, res) => {
  const sql = `
    SELECT sr.*, r.name AS resident_name
    FROM special_request sr
    LEFT JOIN resident r ON sr.resident_ID = r.resident_ID
    ORDER BY sr.request_date DESC
  `;
  db.query(sql, (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Database error." });
    res.json({ success: true, requests: results });
  });
};

// PATCH /admin/special-requests/:requestID
const updateRequestStatus = (req, res) => {
  const { requestID } = req.params;
  const { status, schedule_date, schedule_time } = req.body;

  const allowed = ["Pending", "Scheduled", "Completed", "Rejected"];
  if (!status || !allowed.includes(status))
    return res.status(400).json({ success: false, message: "Invalid status value." });

  const sql = `UPDATE special_request SET status=?, schedule_date=?, schedule_time=? WHERE request_ID=?`;
  db.query(sql, [status, schedule_date || null, schedule_time || null, requestID], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to update request." });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Request not found." });
    res.json({ success: true, message: "Request updated successfully." });
  });
};

// DELETE /admin/special-requests/:requestID
const deleteRequest = (req, res) => {
  const { requestID } = req.params;
  db.query("DELETE FROM special_request WHERE request_ID = ?", [requestID], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Failed to delete request." });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Request not found." });
    res.json({ success: true, message: "Request deleted successfully." });
  });
};

module.exports = { getRequestsByResident, createRequest, getAllRequests, updateRequestStatus, deleteRequest };