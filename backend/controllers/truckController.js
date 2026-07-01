const db = require("../config/db");

// POST /add-truck
const addTruck = (req, res) => {
  const { truck_ID, vehicle_number, driver_id } = req.body;

  if (!truck_ID || !vehicle_number || !driver_id)
    return res.status(400).send("All fields are required.");

  db.query("SELECT * FROM truck WHERE truck_ID = ?", [truck_ID.trim()], (err, result) => {
    if (err) return res.status(500).send("Database error.");
    if (result.length > 0) return res.status(400).send("Truck ID already exists.");

    db.query("SELECT * FROM truck WHERE vehicle_number = ?", [vehicle_number.trim()], (err, result) => {
      if (err) return res.status(500).send("Database error.");
      if (result.length > 0) return res.status(400).send("Vehicle number already exists.");

      const sql = `INSERT INTO truck (truck_ID, vehicle_number, driver_id) VALUES (?, ?, ?)`;
      db.query(sql, [truck_ID.trim(), vehicle_number.trim(), driver_id], (err) => {
        if (err) return res.status(500).send("Error adding truck.");
        res.send("Truck added successfully.");
      });
    });
  });
};

// GET /get-trucks
const getTrucks = (req, res) => {
  const sql = `
    SELECT t.*, COUNT(r.route_ID) AS route_count
    FROM truck t
    LEFT JOIN route r ON t.truck_ID = r.truck_ID
    GROUP BY t.truck_ID
  `;
  db.query(sql, (err, result) => {
    if (err) return res.status(500).send("Database error.");
    res.json(result);
  });
};

// PUT /update-truck/:id
const updateTruck = (req, res) => {
  const { vehicle_number, driver_id } = req.body;
  const { id } = req.params;

  if (!vehicle_number || !driver_id)
    return res.status(400).send("All fields are required.");

  const sql = `UPDATE truck SET vehicle_number=?, driver_id=? WHERE truck_ID=?`;
  db.query(sql, [vehicle_number, driver_id, id], (err, result) => {
    if (err) return res.status(500).send("Error updating truck.");
    if (result.affectedRows === 0) return res.status(404).send("Truck not found.");
    res.send("Truck updated successfully.");
  });
};

// DELETE /delete-truck/:id
const deleteTruck = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM truck WHERE truck_ID = ?", [id], (err, result) => {
    if (err) return res.status(500).send("Error deleting truck.");
    if (result.affectedRows === 0) return res.status(404).send("Truck not found.");
    res.send("Truck deleted successfully.");
  });
};



// GET /get-trucks-with-driver
const getTrucksWithDriver = (req, res) => {
  const sql = `
    SELECT t.truck_ID, t.vehicle_number, d.name AS driver_name
    FROM truck t
    LEFT JOIN driver d ON t.driver_id = d.driver_ID
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.log("Truck query error:", err);
      return res.status(500).send("Database error.");
    }
    res.json(result);
  });
};

module.exports = { addTruck, getTrucks, updateTruck, deleteTruck, getTrucksWithDriver };
