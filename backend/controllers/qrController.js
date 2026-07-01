const db = require("../config/db");

// GET /get-qrcodes
const getQRCodes = (req, res) => {
  db.query("SELECT * FROM qr_code", (err, result) => {
    if (err) return res.status(500).send("Database error.");
    res.json(result);
  });
};

// POST /add-qrcode
const addQRCode = (req, res) => {
  const { QR_id, data } = req.body;

  if (!QR_id || !data) return res.status(400).send("All fields are required.");

  db.query("SELECT * FROM qr_code WHERE QR_id = ?", [QR_id.trim()], (err, result) => {
    if (err) return res.status(500).send("Database error.");
    if (result.length > 0) return res.status(400).send("QR ID already exist.");

    db.query("SELECT * FROM qr_code WHERE data = ?", [data.trim()], (err, result) => {
      if (err) return res.status(500).send("Database error.");
      if (result.length > 0) return res.status(400).send("QR data already exist.");

      db.query("INSERT INTO qr_code (QR_id, data) VALUES (?, ?)", [QR_id.trim(), data.trim()], (err) => {
        if (err) return res.status(500).send("Error adding QR code.");
        res.send("QR code added successfully.");
      });
    });
  });
};

// PUT /update-qrcode/:id
const updateQRCode = (req, res) => {
  const { data } = req.body;
  const { id } = req.params;

  if (!data) return res.status(400).send("Data field is required.");

  db.query("UPDATE qr_code SET data=? WHERE QR_id=?", [data, id], (err, result) => {
    if (err) return res.status(500).send("Error updating QR code.");
    if (result.affectedRows === 0) return res.status(404).send("QR code not found.");
    res.send("QR code updated successfully.");
  });
};

// DELETE /delete-qrcode/:id
const deleteQRCode = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM qr_code WHERE QR_id = ?", [id], (err, result) => {
    if (err) return res.status(500).send("Error deleting the code.");
    if (result.affectedRows === 0) return res.status(404).send("QR code not found.");
    res.send("QR code deleted successfully.");
  });
};

module.exports = { getQRCodes, addQRCode, updateQRCode, deleteQRCode };