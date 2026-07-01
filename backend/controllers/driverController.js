const db = require("../config/db");
// POST /add-driver
const addDriver = (req, res) => {
  const { driver_ID, name, email, phone_no, license_no, password } = req.body;

  if (!driver_ID || !name || !email || !phone_no || !license_no || !password)
    return res.status(400).send("All fields are required.");

  if (driver_ID.toString().trim() === "")
    return res.status(400).send("Driver ID cannot be empty.");

  if (phone_no.length < 10)
    return res.status(400).send("Phone number must be at least 10 digits.");

  if (password.length < 6)
    return res.status(400).send("Password must be at least 6 characters.");

  db.query("SELECT * FROM driver WHERE driver_ID = ?", [driver_ID.toString().trim()], (err, result) => {
    if (err) return res.status(500).send("Database error.");
    if (result.length > 0) return res.status(400).send("Driver ID already exists.");

    db.query("SELECT * FROM driver WHERE email = ?", [email], (err, result) => {
      if (err) return res.status(500).send("Database error.");
      if (result.length > 0) return res.status(400).send("A driver with this email already exists.");

      const sql = `INSERT INTO driver (driver_ID, name, email, phone_no, license_no, password) VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(sql, [driver_ID.toString().trim(), name.trim(), email.trim(), phone_no.trim(), license_no.trim(), password], (err) => {
        if (err) return res.status(500).send("Error adding driver.");
        res.send("Driver added successfully.");
      }); });   }); };

// get drivers
const getDrivers = (req, res) => {
  db.query("SELECT * FROM driver", (err, result) => {
    if (err) return res.status(500).send("Database error.");
    res.json(result);
  }); };
//get-unassigned drivers
const getUnassignedDrivers = (req, res) => {
  const sql = `
    SELECT * FROM driver 
    WHERE driver_ID NOT IN (
      SELECT driver_id FROM truck WHERE driver_id IS NOT NULL AND driver_id != ''
    )
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send("Database error.");
    res.json(result);
  }); };
//get-available-drivers/truckID
const getAvailableDrivers = (req, res) => {
  const { truckID } = req.params;
  const sql = `
    SELECT * FROM driver
    WHERE driver_ID NOT IN (
      SELECT driver_id FROM truck WHERE driver_id IS NOT NULL AND truck_ID != ?
    )
  `;
  db.query(sql, [truckID], (err, result) => {
    if (err) return res.status(500).send("Database error.");
    res.json(result);
  }); };

//update-driver
const updateDriver = (req, res) => {
  const { name, email, phone_no, license_no } = req.body;
  const { id } = req.params;

  if (!name || !email || !phone_no || !license_no)
    return res.status(400).send("All fields are required.");

  const sql = `UPDATE driver SET name=?, email=?, phone_no=?, license_no=? WHERE driver_ID=?`;
  db.query(sql, [name, email, phone_no, license_no, id], (err) => {
    if (err) return res.status(500).send("Error updating driver.");
    res.send("Driver updated successfully.");
  });
};

//delete-driver
const deleteDriver = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM driver WHERE driver_ID = ?", [id], (err) => {
    if (err) return res.status(500).send("Error deleting driver.");
    res.send("Driver deleted successfully.");
  });
};

module.exports = { addDriver, getDrivers, getUnassignedDrivers, getAvailableDrivers, updateDriver, deleteDriver };