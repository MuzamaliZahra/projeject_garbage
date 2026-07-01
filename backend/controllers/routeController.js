const db = require("../config/db");
//get-routes
const getRoutes = (req, res) => {
  db.query("SELECT * FROM route", (err, result) => {
    if (err) return res.status(500).send("Database error.");
    res.json(result);
  }); };
//add-route
const addRoute = (req, res) => {
  const { route_ID, route_name, start_location, end_location,
          estimated_duration, area_name, driver_ID, truck_ID } = req.body;
  if (!route_ID || !route_name || !start_location || !end_location ||
      !estimated_duration || !area_name || !driver_ID || !truck_ID)
    return res.status(400).send("All fields are required.");
  db.query("SELECT * FROM route WHERE route_ID = ?", [route_ID], (err, result) => {
    if (err) return res.status(500).send("Database error.");
    if (result.length > 0) return res.status(400).send("Route ID already exists.");
    db.query("SELECT COUNT(*) AS count FROM route WHERE truck_ID = ?", [truck_ID], (err, truckResult) => {
      if (err) return res.status(500).send("Database error.");
      if (truckResult[0].count >= 3)
        return res.status(400).send("This truck is already assigned to 3 routes. Maximum limit reached.");
      db.query("SELECT COUNT(*) AS count FROM route WHERE driver_ID = ?", [driver_ID], (err, driverResult) => {
        if (err) return res.status(500).send("Database error.");
        if (driverResult[0].count >= 3)
          return res.status(400).send("This driver is already assigned to 3 routes. Maximum limit reached.");
        const sql = `INSERT INTO route (route_ID, route_name, start_location, end_location,
                     estimated_duration, area_name, driver_ID, truck_ID) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        db.query(sql, [route_ID, route_name, start_location, end_location,
                       estimated_duration, area_name, driver_ID, truck_ID], (err) => {
          if (err) return res.status(500).send("Error adding route.");
          res.send("Route added successfully.");
        }); }); }); }); };

//update route
const updateRoute = (req, res) => {
  const { route_name, start_location, end_location,
          estimated_duration, area_name, driver_ID, truck_ID } = req.body;
  const { id } = req.params;

  const sql = `UPDATE route SET route_name=?, start_location=?, end_location=?,
               estimated_duration=?, area_name=?, driver_ID=?, truck_ID=? WHERE route_ID=?`;

  db.query(sql, [route_name, start_location, end_location,
                 estimated_duration, area_name, driver_ID, truck_ID, id], (err, result) => {
    if (err) return res.status(500).send("Error updating route.");
    if (result.affectedRows === 0) return res.status(404).send("Route not found.");
    res.send("Route updated successfully.");
  });
};
//delete route
const deleteRoute = (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM route WHERE route_ID = ?", [id], (err, result) => {
    if (err) return res.status(500).send("Error deleting route.");
    if (result.affectedRows === 0) return res.status(404).send("Route not found.");
    res.send("Route deleted successfully.");
  });
};

module.exports = { getRoutes, addRoute, updateRoute, deleteRoute };