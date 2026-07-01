const db = require("../config/db");
//get-bins
const getBins = (req, res) => {
  db.query("SELECT * FROM bin", (err, result) => {
    if (err) return res.status(500).send("Database error.");
    res.json(result);
  });
};
//  add-bin
const addBin = (req, res) => {
  const { bin_ID, type, status, location, route_ID, QR_ID } = req.body;

  if (!bin_ID || !type || !status || !location || !route_ID || !QR_ID)
    return res.status(400).send("All fields are required.");
  db.query("SELECT * FROM bin WHERE bin_ID = ?", [bin_ID.trim()], (err, result) => {
    if (err) return res.status(500).send("Database error.");
    if (result.length > 0) return res.status(400).send("Bin ID already exists.");
    db.query("SELECT * FROM bin WHERE QR_ID = ?", [QR_ID.trim()], (err, result) => {
      if (err) return res.status(500).send("Database error.");
      if (result.length > 0) return res.status(400).send("QR ID already exists.");
      db.query("SELECT * FROM route WHERE route_ID = ?", [route_ID.trim()], (err, result) => {
        if (err) return res.status(500).send("Database error.");
        if (result.length === 0) return res.status(400).send("Route ID does not exist.");
        const sql = `INSERT INTO bin (bin_ID, type, status, location, route_ID, QR_ID) VALUES (?,?,?,?,?,?)`;
        db.query(sql, [bin_ID.trim(), type, status, location.trim(), route_ID.trim(), QR_ID.trim()], (err) => {
          if (err) return res.status(500).send("Error adding bin.");
          res.send("Bin added successfully.");
        });   }); }); }); };

//update-bin/
const updateBin = (req, res) => {
  const { type, status, location, route_ID, QR_ID, lst_clctn_time, lst_clctn_date } = req.body;
  const { id } = req.params;
  if (!type || !status || !location || !route_ID || !QR_ID)
    return res.status(400).send("All fields are required.");
  const sql = `UPDATE bin SET type=?, status=?, location=?, route_ID=?, QR_ID=?, lst_clctn_time=?, lst_clctn_date=? WHERE bin_ID=?`;
  db.query(sql, [type, status, location, route_ID, QR_ID, lst_clctn_time || null, lst_clctn_date || null, id], (err, result) => {
    if (err) return res.status(500).send("Error updating bin.");
    if (result.affectedRows === 0) return res.status(404).send("Bin not found.");
    res.send("Bin updated successfully.");
  }); };
// delete-bin/
const deleteBin = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM bin WHERE bin_ID = ?", [id], (err, result) => {
    if (err) return res.status(500).send("Error deleting bin.");
    if (result.affectedRows === 0) return res.status(404).send("Bin not found.");
    res.send("Bin deleted successfully.");
  }); };
//update-bin-collection
const updateBinCollection = (req, res) => {
  const { lst_clctn_time, lst_clctn_date } = req.body;
  const { id } = req.params;
  if (!lst_clctn_time || !lst_clctn_date)
    return res.status(400).json({ success: false, message: "Date and time are required." });
  const sql = `UPDATE bin SET lst_clctn_time=?, lst_clctn_date=?, status='Empty' WHERE bin_ID=?`;
  db.query(sql, [lst_clctn_time, lst_clctn_date, id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Error updating." });
    if (result.affectedRows === 0) return res.status(404).json({ success: false, message: "Bin not found." });
    res.json({ success: true, message: "Collection time updated successfully." });
  });};

//get-bin-by-qr
const getBinByQR = (req, res) => {
  const { qr_id } = req.params;
  const sql = `
    SELECT b.*, r.route_name
    FROM bin b
    LEFT JOIN route r ON b.route_ID = r.route_ID
    WHERE b.QR_ID = ? LIMIT 1
  `;
  db.query(sql, [qr_id], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error." });
    if (result.length === 0) return res.status(404).json({ success: false, message: "No bin found for this QR code." });
    res.json({ success: true, bin: result[0] });
  });
};

module.exports = { getBins, addBin, updateBin, deleteBin, updateBinCollection, getBinByQR };