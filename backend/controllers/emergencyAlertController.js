const db = require("../config/db");

const addEmergencyAlert = (req, res) => {
  const { alert_ID, tittle, alert_type, message, expired_time, is_active, resident_ids } = req.body;

  if (!alert_ID || !tittle || !alert_type || !message || !expired_time) {
    return res.status(400).send("All fields are required.");
  }

  db.query("SELECT * FROM emergency_alert WHERE alert_ID = ?", [alert_ID], (err, result) => {
    if (err) return res.status(500).send("Database error.");
    if (result.length > 0) return res.status(400).send("Alert ID already exists.");

    // resident_ids is an array from frontend; store as comma-separated string
    const residentIdStr = Array.isArray(resident_ids) ? resident_ids.join(",") : (resident_ids || "");

    const sql = `
      INSERT INTO emergency_alert
      (alert_ID, tittle, alert_type, message, expired_time, is_active, create_time, resident_id)
      VALUES (?, ?, ?, ?, ?, ?, NOW(), ?)
    `;

    db.query(sql, [alert_ID, tittle.trim(), alert_type.trim(), message.trim(), expired_time, is_active ?? 1, residentIdStr],
      (err) => {
        if (err) { console.error(err); return res.status(500).send("Error adding alert."); }
        res.send("Emergency alert added successfully.");
      }
    );
  });
};

// GET /get-alerts
const getAlerts = (req, res) => {
  db.query(
    "SELECT * FROM emergency_alert ORDER BY create_time DESC",
    (err, result) => {
      if (err) return res.status(500).send("Database error.");
      res.json(result);
    }
  );
};

// GET /get-alert/:id
const getAlertById = (req, res) => {
  const { id } = req.params;

  db.query(
    "SELECT * FROM emergency_alert WHERE alert_ID = ?",
    [id],
    (err, result) => {
      if (err) return res.status(500).send("Database error.");

      if (result.length === 0) {
        return res.status(404).send("Alert not found.");
      }

      res.json(result[0]);
    }
  );
};

// PUT /update-alert/:id
// PUT /update-alert/:id — extended to support resident_ids
const updateAlert = (req, res) => {
  const { id } = req.params;
  const { tittle, alert_type, message, expired_time, is_active, resident_ids } = req.body;

  if (!tittle || !alert_type || !message || !expired_time) {
    return res.status(400).send("All fields are required.");
  }

  const residentIdStr = Array.isArray(resident_ids) ? resident_ids.join(",") : (resident_ids || "");

  const sql = `
    UPDATE emergency_alert
    SET tittle = ?, alert_type = ?, message = ?, expired_time = ?, is_active = ?, resident_ID = ?
    WHERE alert_ID = ?
  `;

  db.query(
    sql,
    [tittle.trim(), alert_type.trim(), message.trim(), expired_time, is_active, residentIdStr, id],
    (err) => {
      if (err) { console.error(err); return res.status(500).send("Error updating alert."); }
      res.send("Emergency alert updated successfully.");
    }
  );
};

// DELETE /delete-alert/:id
const deleteAlert = (req, res) => {
  const { id } = req.params;

  db.query(
    "DELETE FROM emergency_alert WHERE alert_ID = ?",
    [id],
    (err) => {
      if (err) return res.status(500).send("Error deleting alert.");

      res.send("Emergency alert deleted successfully.");
    }
  );
};

// GET /get-locations — distinct area names from resident addresses (3rd comma-part)
const getLocations = (req, res) => {
  db.query("SELECT address FROM resident", (err, rows) => {
    if (err) return res.status(500).send("Database error.");

    const locations = [
      ...new Set(
        rows
          .map((r) => {
            const parts = r.address.split(",").map((p) => p.trim());
            return parts[1] || null; // 2rd part (index 2)
          })
          .filter(Boolean)
      ),
    ];

    res.json(locations);
  });
};


// GET /get-residents-by-location/:location
const getResidentsByLocation = (req, res) => {
  const { location } = req.params;

  db.query("SELECT resident_ID, name, address FROM resident", (err, rows) => {
    if (err) return res.status(500).send("Database error.");

    const matched = rows.filter((r) => {
      const parts = r.address.split(",").map((p) => p.trim());
      return (parts[1] || "").toLowerCase() === location.toLowerCase();
    });

    res.json(matched);
  });
};


const getAlertsForResident = (req, res) => {
  const { residentId } = req.params;

  db.query(
    "SELECT * FROM emergency_alert WHERE is_active = 1 AND expired_time > NOW() ORDER BY create_time DESC",
    (err, result) => {
      if (err) return res.status(500).send("Database error.");

      const filtered = result.filter((alert) => {
        if (!alert.resident_ID) return false;
        const ids = alert.resident_ID.split(",").map((id) => id.trim());
        return ids.includes(String(residentId));
      });

      res.json(filtered);
    }
  );
};










module.exports = {
  addEmergencyAlert, getAlerts, getAlertById, updateAlert, deleteAlert,
  getLocations, getResidentsByLocation, getAlertsForResident,
};

