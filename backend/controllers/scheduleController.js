const db = require("../config/db");

 //check truck availability
const checkTruckAvailability = (req, res) => {
  const { truck_ID, time, day_of_week } = req.query;

  if (!truck_ID || !day_of_week || !time)
    return res.status(400).json({ error: "truck_ID, day_of_week, and time are required." });

  const query = `
    SELECT s.schedule_id, s.time, s.day_of_week, r.route_name, r.route_ID
    FROM schedule s
    JOIN route r ON s.route_ID = r.route_ID
    WHERE r.truck_ID = ? AND s.day_of_week = ? AND s.time = ?
    LIMIT 1
  `;
  db.query(query, [truck_ID, day_of_week, time], (err, results) => {
    if (err) return res.status(500).json({ error: "DB error checking truck availability." });
    if (results.length > 0) {
      return res.json({
        conflict: true,
        conflictDetails: {
          schedule_id: results[0].schedule_id,
          route_name:  results[0].route_name,
          route_ID:    results[0].route_ID,
          time:        results[0].time,
          day_of_week: results[0].day_of_week,
        },  });   }
    res.json({ conflict: false, conflictDetails: null });
  }); };

//add-schedule
const addSchedule = (req, res) => {
  const { schedule_id, time, area, status, day_of_week, route_ID } = req.body;
  if (!schedule_id || !time || !area || !status || !day_of_week || !route_ID)
    return res.status(400).json("All fields are required.");
  db.query("SELECT * FROM schedule WHERE schedule_id = ?", [schedule_id], (err, result) => {
    if (err) return res.status(500).json("Database error.");
    if (result.length > 0) return res.status(409).json(`Schedule ID "${schedule_id}" already exists.`);
    const truckConflictCheck = `
      SELECT s.schedule_id, s.day_of_week, s.time, r.route_name
      FROM schedule s
      JOIN route r ON s.route_ID = r.route_ID
      WHERE r.truck_ID = (SELECT truck_ID FROM route WHERE route_ID = ?)
        AND s.day_of_week = ? AND s.time = ?
      LIMIT 1
    `;
    db.query(truckConflictCheck, [route_ID, day_of_week, time], (err, conflicts) => {
      if (err) return res.status(500).json("Server error checking truck conflicts.");
      if (conflicts.length > 0)
        return res.status(409).json(
          `Truck is already assigned to route "${conflicts[0].route_name}" on ${day_of_week} at ${time}. Please choose a different time.`
        );
      const insert = `INSERT INTO schedule (schedule_id, time, area, status, day_of_week, route_ID) VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(insert, [schedule_id, time, area, status, day_of_week, route_ID], (err) => {
        if (err) {
          if (err.code === "ER_DUP_ENTRY") return res.status(409).json(`Schedule ID "${schedule_id}" already exists.`);
          return res.status(500).json("Failed to add schedule.");
        }
        res.status(200).json("Schedule added successfully.");
      });   });  });  };

//get schedules
const getSchedules = (req, res) => {
  const query = `
    SELECT s.schedule_id, s.time, s.area, s.status, s.day_of_week, s.route_ID,
           r.route_name, r.area_name, r.truck_ID
    FROM schedule s
    LEFT JOIN route r ON s.route_ID = r.route_ID
    ORDER BY FIELD(s.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), s.time ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json("Failed to fetch schedules.");
    res.json(results);
  }); };
//resident-schedule
const getResidentSchedule = (req, res) => {
  const { resident_id } = req.params;
  db.query("SELECT * FROM resident WHERE resident_ID = ? LIMIT 1", [resident_id], (err, residentResult) => {
    if (err) return res.status(500).json({ error: "DB error fetching resident." });
    if (residentResult.length === 0) return res.status(404).json({ error: "Resident not found." });
    const resident = residentResult[0];
    const address = (resident.address || "").toLowerCase().trim();
    if (!address) return res.json({ resident, schedules: [], matchedArea: null });
    db.query("SELECT * FROM route", (err, routes) => {
      if (err) return res.status(500).json({ error: "DB error fetching routes." });
      let matchedRoute = routes.find((r) => {
        const routeName = (r.route_name || "").toLowerCase().trim();
        return routeName.length > 0 && address.includes(routeName);
      });
      if (!matchedRoute) {
        matchedRoute = routes.find((r) => {
          const areaName = (r.area_name || "").toLowerCase().trim();
          return areaName.length > 0 && address.includes(areaName);
        });}
      if (!matchedRoute) return res.json({ resident, schedules: [], matchedArea: null });
      const scheduleQuery = `
        SELECT s.schedule_id, s.time, s.area, s.status, s.day_of_week, s.route_ID,
               r.route_name, r.area_name, r.truck_ID
        FROM schedule s
        LEFT JOIN route r ON s.route_ID = r.route_ID
        WHERE s.route_ID = ?
        ORDER BY FIELD(s.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), s.time ASC`;
      db.query(scheduleQuery, [matchedRoute.route_ID], (err, schedules) => {
        if (err) return res.status(500).json({ error: "DB error fetching schedules." });
        res.json({ resident, schedules, matchedArea: matchedRoute.route_name });
      }); }); }); };

//update schedule
const updateSchedule = (req, res) => {
  const { schedule_id } = req.params;
  const { time, area, status, day_of_week, route_ID } = req.body;

  if (!time || !area || !status || !day_of_week || !route_ID)
    return res.status(400).json("All fields are required.");
  const truckConflictCheck = `
    SELECT s.schedule_id, r.route_name
    FROM schedule s
    JOIN route r ON s.route_ID = r.route_ID
    WHERE r.truck_ID = (SELECT truck_ID FROM route WHERE route_ID = ?)
      AND s.day_of_week = ? AND s.time = ? AND s.schedule_id != ?
    LIMIT 1
  `;
  db.query(truckConflictCheck, [route_ID, day_of_week, time, schedule_id], (err, conflicts) => {
    if (err) return res.status(500).json("Server error checking conflicts.");
    if (conflicts.length > 0)
      return res.status(409).json(
        `Truck is already assigned to route "${conflicts[0].route_name}" on ${day_of_week} at ${time}. Please choose a different time.`
      );
    const update = `UPDATE schedule SET time=?, area=?, status=?, day_of_week=?, route_ID=? WHERE schedule_id=?`;
    db.query(update, [time, area, status, day_of_week, route_ID, schedule_id], (err) => {
      if (err) return res.status(500).json("Failed to update schedule.");
      res.status(200).json("Schedule updated successfully.");
    });
  });
};

//delete schedule
const deleteSchedule = (req, res) => {
  const { schedule_id } = req.params;
  db.query("DELETE FROM schedule WHERE schedule_id = ?", [schedule_id], (err, result) => {
    if (err) return res.status(500).json("Failed to delete schedule.");
    if (result.affectedRows === 0) return res.status(404).json("Schedule not found.");
    res.status(200).json("Schedule deleted successfully.");
  });
};


// get active schedules (for home page)
const getActiveSchedules = (req, res) => {
  const query = `
    SELECT s.schedule_id, s.time, s.area, s.status, s.day_of_week, s.route_ID,
           r.route_name, r.area_name, r.truck_ID
    FROM schedule s
    LEFT JOIN route r ON s.route_ID = r.route_ID
    WHERE s.status = 'Active'
    ORDER BY FIELD(s.day_of_week,'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'), s.time ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json("Failed to fetch schedules.");
    res.json(results);
  });
};

module.exports = { checkTruckAvailability, addSchedule, getSchedules, getResidentSchedule, updateSchedule, deleteSchedule, getActiveSchedules };