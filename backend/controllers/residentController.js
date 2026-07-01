const db = require("../config/db");

// GET /get-resident
const getResidents = (req, res) => {
  db.query("SELECT * FROM resident", (err, result) => {
    if (err) return res.status(500).send("Database error.");
    res.json(result);
  });
};

// PUT /update-resident/:id
const updateResident = (req, res) => {
  const { name, email, phone_no, address } = req.body;
  const { id } = req.params;

  if (!name || !email || !phone_no || !address)
    return res.status(400).send("All fields are required.");

  const sql = "UPDATE resident SET name=?, email=?, phone_no=?, address=? WHERE resident_ID=?";
  db.query(sql, [name, email, phone_no, address, id], (err, result) => {
    if (err) return res.status(500).send("Error updating resident.");
    if (result.affectedRows === 0) return res.status(404).send("Resident not found.");
    res.send("Resident updated successfully.");
  });
};

// DELETE /delete-resident/:id
const deleteResident = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM resident WHERE resident_ID = ?", [id], (err, result) => {
    if (err) return res.status(500).send("Error deleting resident.");
    if (result.affectedRows === 0) return res.status(404).send("Resident not found.");
    res.send("Resident deleted successfully.");
  });
};

module.exports = { getResidents, updateResident, deleteResident };