const express = require("express");
const mysql = require("mysql");
const cors = require("cors");



const app = express();
app.use(cors());
app.use(express.json());


const multer = require("multer");
const path   = require("path");
const fs     = require("fs");
const { faL } = require("@fortawesome/free-solid-svg-icons");
//const { default: Feedback } = require("react-bootstrap/esm/Feedback");
const { count } = require("console");
const { request } = require("http");

const router  = express.Router();


// MySQL connection
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "cleanland"
});

db.connect((err) => {
  if(err){
    console.log("Database connection failed", err);
  } else {
    console.log("Connected to MySQL Database");
  }
});


/*--------------------------------------------------*/


app.post("/signup", (req, res) => {
  const { name, email, phone_no, address, password } = req.body;

  if (!name || !email || !phone_no || !address || !password) {
    return res.status(400).send("All fields are required.");
  }

  if (name.trim() === "" || email.trim() === "" || phone_no.trim() === "" || 
      address.trim() === "" || password.trim() === "") {
    return res.status(400).send("Fields cannot be empty or blank.");
  }

  if (phone_no.length < 10) {
    return res.status(400).send("Phone number must be at least 10 digits.");
  }

  if (password.length < 6) {
    return res.status(400).send("Password must be at least 6 characters.");
  }

  const checkEmail = "SELECT * FROM resident WHERE email = ?";
  db.query(checkEmail, [email], (err, result) => {
    if (err) return res.status(500).send("Database error.");
    if (result.length > 0) {
      return res.status(400).send("Email already registered. Please login.");
    }

    const sql = `INSERT INTO resident (name, email, phone_no, address, password) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [name.trim(), email.trim(), phone_no.trim(), address.trim(), password], (err) => {
      if (err) {
        console.log(err);
        return res.status(500).send("Error inserting data.");
      }
      res.send("Registration successful");
    });
  });
});


//-------------------------------------------------------------------------------//


app.post("/login", (req, res) => {
  const { email, password, role } = req.body;

  let table = "";
  let idField = "";

  if (role === "Resident") {
    table = "resident";
    idField = "resident_ID";
  } else if (role === "Admin") {
    table = "admin";
    idField = "admin_ID";
  } else if (role === "Collector") {
    table = "driver";
    idField = "driver_ID";
  } else {
    return res.status(400).json({ success: false, message: "Invalid role" });
  }

  const sql = `SELECT * FROM ${table} WHERE email = ? AND password = ?`;
  db.query(sql, [email, password], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "Database error" });
    }

    if (result.length > 0) {
      const user = result[0];
      res.json({
        success: true,
        message: "Login successful",
        role: role,
        user: {
          id: user[idField],
          name: user.name,
          email: user.email
        }
      });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password" });
    }
  });
});


//---------------------------------------------------------------------------------------------------//


app.post("/add-driver", (req, res) => {
  const { driver_ID, name, email, phone_no, license_no, password } = req.body;

  if (!driver_ID || !name || !email || !phone_no || !license_no || !password) {
    return res.status(400).send("All fields are required.");
  }
  if (driver_ID.toString().trim() === "") {
    return res.status(400).send("Driver ID cannot be empty.");
  }
  if (phone_no.length < 10) {
    return res.status(400).send("Phone number must be at least 10 digits.");
  }
  if (password.length < 6) {
    return res.status(400).send("Password must be at least 6 characters.");
  }

  const checkID = "SELECT * FROM driver WHERE driver_ID = ?";
  db.query(checkID, [driver_ID.toString().trim()], (err, result) => {
    if (err) return res.status(500).send("Database error.");
    if (result.length > 0) return res.status(400).send("Driver ID already exists.");

    const checkEmail = "SELECT * FROM driver WHERE email = ?";
    db.query(checkEmail, [email], (err, result) => {
      if (err) return res.status(500).send("Database error.");
      if (result.length > 0) return res.status(400).send("A driver with this email already exists.");

      const sql = `INSERT INTO driver (driver_ID, name, email, phone_no, license_no, password) 
                   VALUES (?, ?, ?, ?, ?, ?)`;
      db.query(sql, [
        driver_ID.toString().trim(),
        name.trim(),
        email.trim(),
        phone_no.trim(),
        license_no.trim(),
        password
      ], (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Error adding driver.");
        }
        res.send("Driver added successfully.");
      });
    });
  });
});


//_---------------------------------------------------------------------------------------------//


// Get all drivers
app.get("/get-drivers", (req, res) => {
  db.query("SELECT * FROM driver", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database error.");
    }
    res.json(result);
  });
});

// Update driver
app.put("/update-driver/:id", (req, res) => {
  const { name, email, phone_no, license_no } = req.body;
  const { id } = req.params;

  if (!name || !email || !phone_no || !license_no) {
    return res.status(400).send("All fields are required.");
  }

  const sql = `UPDATE driver SET name=?, email=?, phone_no=?, license_no=? WHERE driver_ID=?`;
  db.query(sql, [name, email, phone_no, license_no, id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error updating driver.");
    }
    res.send("Driver updated successfully.");
  });
});

// Delete driver
app.delete("/delete-driver/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM driver WHERE driver_ID = ?", [id], (err) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error deleting driver.");
    }
    res.send("Driver deleted successfully.");
  });
});


//---------------------------------------------------------------


// Get all residents
app.get("/get-resident", (req, res) => {
  db.query("SELECT * FROM resident", (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database error.");
    }
    res.json(result);
  });
});

// Update resident
app.put("/update-resident/:id", (req, res) => {
  const { name, email, phone_no, address } = req.body;
  const { id } = req.params;

  if (!name || !email || !phone_no || !address) {
    return res.status(400).send("All fields are required.");
  }

  const sql = "UPDATE resident SET name=?, email=?, phone_no=?, address=? WHERE resident_ID=?";
  db.query(sql, [name, email, phone_no, address, id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error updating resident.");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Resident not found.");
    }
    res.send("Resident updated successfully.");
  });
});

// Delete resident
app.delete("/delete-resident/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM resident WHERE resident_ID = ?", [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error deleting resident.");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Resident not found.");
    }
    res.send("Resident deleted successfully.");
  });
});


//-------------------------------------------------------------------------------


// ✅ Get available drivers (not assigned to any truck) — used in AddTruck
app.get("/get-unassigned-drivers", (req, res) => {
  const sql = `
    SELECT * FROM driver 
    WHERE driver_ID NOT IN (
      SELECT driver_id FROM truck 
      WHERE driver_id IS NOT NULL AND driver_id != ''
    )
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database error.");
    }
    res.json(result);
  });
});

// ✅ Get available drivers per truck selection — used in AddRoute
// Excludes drivers assigned to OTHER trucks (allows current truck's driver)
app.get("/get-available-drivers/:truckID", (req, res) => {
  const { truckID } = req.params;
  const sql = `
    SELECT * FROM driver
    WHERE driver_ID NOT IN (
      SELECT driver_id FROM truck
      WHERE driver_id IS NOT NULL
      AND truck_ID != ?
    )
  `;
  db.query(sql, [truckID], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database error.");
    }
    res.json(result);
  });
});


//-----------------------------------------------------------------------------------------------------


// ✅ Add truck
app.post("/add-truck", (req, res) => {
  const { truck_ID, vehicle_number, driver_id } = req.body;

  if (!truck_ID || !vehicle_number || !driver_id) {
    return res.status(400).send("All fields are required.");
  }

  const checkTruck = "SELECT * FROM truck WHERE truck_ID = ?";
  db.query(checkTruck, [truck_ID.trim()], (err, result) => {
    if (err) return res.status(500).send("Database error.");
    if (result.length > 0) return res.status(400).send("Truck ID already exists.");

    const checkVehicle = "SELECT * FROM truck WHERE vehicle_number = ?";
    db.query(checkVehicle, [vehicle_number.trim()], (err, result) => {
      if (err) return res.status(500).send("Database error.");
      if (result.length > 0) return res.status(400).send("Vehicle number already exists.");

      const sql = `INSERT INTO truck (truck_ID, vehicle_number, driver_id) VALUES (?, ?, ?)`;
      db.query(sql, [truck_ID.trim(), vehicle_number.trim(), driver_id], (err) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Error adding truck.");
        }
        res.send("Truck added successfully.");
      });
    });
  });
});

// ✅ Get all trucks — includes route_count per truck
app.get("/get-trucks", (req, res) => {
  const sql = `
    SELECT t.*, COUNT(r.route_ID) AS route_count
    FROM truck t
    LEFT JOIN route r ON t.truck_ID = r.truck_ID
    GROUP BY t.truck_ID
  `;
  db.query(sql, (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Database error.");
    }
    res.json(result);
  });
});

// Update truck
app.put("/update-truck/:id", (req, res) => {
  const { vehicle_number, driver_id } = req.body;
  const { id } = req.params;

  if (!vehicle_number || !driver_id) {
    return res.status(400).send("All fields are required.");
  }

  const sql = `UPDATE truck SET vehicle_number=?, driver_id=? WHERE truck_ID=?`;
  db.query(sql, [vehicle_number, driver_id, id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error updating truck.");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Truck not found.");
    }
    res.send("Truck updated successfully.");
  });
});

// Delete truck
app.delete("/delete-truck/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM truck WHERE truck_ID = ?", [id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).send("Error deleting truck.");
    }
    if (result.affectedRows === 0) {
      return res.status(404).send("Truck not found.");
    }
    res.send("Truck deleted successfully.");
  });
});


//============================================================================================================


// Get all routes
app.get("/get-routes", (req, res) => {
  db.query("SELECT * FROM route", (err, result) => {
    if (err) { console.log(err); return res.status(500).send("Database error."); }
    res.json(result);
  });
});

// ✅ Add route — checks truck and driver are not assigned to more than 3 routes
app.post("/add-route", (req, res) => {
  const { route_ID, route_name, start_location, end_location,
          estimated_duration, area_name, driver_ID, truck_ID } = req.body;

  if (!route_ID || !route_name || !start_location || !end_location ||
      !estimated_duration || !area_name || !driver_ID || !truck_ID) {
    return res.status(400).send("All fields are required.");
  }

  // Check duplicate route ID
  const checkID = "SELECT * FROM route WHERE route_ID = ?";
  db.query(checkID, [route_ID], (err, result) => {
    if (err) return res.status(500).send("Database error.");
    if (result.length > 0) return res.status(400).send("Route ID already exists.");

    // ✅ Check truck route limit (max 3)
    const checkTruck = "SELECT COUNT(*) AS count FROM route WHERE truck_ID = ?";
    db.query(checkTruck, [truck_ID], (err, truckResult) => {
      if (err) return res.status(500).send("Database error.");
      if (truckResult[0].count >= 3) {
        return res.status(400).send(
          "This truck is already assigned to 3 routes. Maximum limit reached."
        );
      }

      // ✅ Check driver route limit (max 3)
      const checkDriver = "SELECT COUNT(*) AS count FROM route WHERE driver_ID = ?";
      db.query(checkDriver, [driver_ID], (err, driverResult) => {
        if (err) return res.status(500).send("Database error.");
        if (driverResult[0].count >= 3) {
          return res.status(400).send(
            "This driver is already assigned to 3 routes. Maximum limit reached."
          );
        }

        // ✅ All checks passed — insert route
        const sql = `INSERT INTO route (route_ID, route_name, start_location, end_location,
                     estimated_duration, area_name, driver_ID, truck_ID)
                     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;

        db.query(sql, [route_ID, route_name, start_location, end_location,
                       estimated_duration, area_name, driver_ID, truck_ID], (err) => {
          if (err) { console.log(err); return res.status(500).send("Error adding route."); }
          res.send("Route added successfully.");
        });
      });
    });
  });
});

// Update route
app.put("/update-route/:id", (req, res) => {
  const { route_name, start_location, end_location,
          estimated_duration, area_name, driver_ID, truck_ID } = req.body;
  const { id } = req.params;

  const sql = `UPDATE route SET route_name=?, start_location=?, end_location=?,
               estimated_duration=?, area_name=?, driver_ID=?, truck_ID=?
               WHERE route_ID=?`;

  db.query(sql, [route_name, start_location, end_location,
                 estimated_duration, area_name, driver_ID, truck_ID, id], (err, result) => {
    if (err) { console.log(err); return res.status(500).send("Error updating route."); }
    if (result.affectedRows === 0) return res.status(404).send("Route not found.");
    res.send("Route updated successfully.");
  });
});

// Delete route
app.delete("/delete-route/:id", (req, res) => {
  const { id } = req.params;
  db.query("DELETE FROM route WHERE route_ID = ?", [id], (err, result) => {
    if (err) { console.log(err); return res.status(500).send("Error deleting route."); }
    if (result.affectedRows === 0) return res.status(404).send("Route not found.");
    res.send("Route deleted successfully.");
  });
});


//============================================================================================================




//========================================================Bins//==============================

// Get all bins

app.get("/get-bins", (req, res) => {
    db.query("SELECT * FROM bin", (err, result) => {
        if (err) {console.log(err); return res.status(500).send("Database error.");}
        res.json(result);
    });
});

// Add bin
app.post("/add-bin", (req, res) => {
  const { bin_ID, type, status, location, route_ID, QR_ID } = req.body;

  if (!bin_ID || !type || !status || !location || !route_ID || !QR_ID) {
    return res.status(400).send("All fields are required.");
  }

const checkID = "SELECT * FROM bin WHERE bin_ID =?";
db.query(checkID, [bin_ID.trim()], (err, result) => {
    if (err) return res.status(500).send("Database error.");
    if (result.length > 0 ) return res.status(400).send("Bin ID already exists.");


const checkQR = "SELECT * FROM bin WHERE QR_ID= ?";
db.query(checkQR, [QR_ID.trim()], (err, result) => {
    if (err) return res.status(500).send("Database error");
    if (result.length > 0) return res.status(400).send("QR ID already exists.");




//update bin
app.put("/update-bin/:id", (req, res) => {
    const { type, status, location, route_ID, QR_ID, lst_clctn_time, lst_clctn_date } = req.body;
    const { id } = req.params;

    if (!type || !status || !location || !route_ID || ! QR_ID)
    {
        return res.status(400).send("All fields are required.");
    }

    const sql = `UPDATE bin SET type=?, status=?, location=?, route_ID=?, QR_ID=?, lst_clctn_time=?, lst_clctn_date=? WHERE bin_ID=? `;
    db.query(sql, [type, status, location, route_ID, QR_ID, lst_clctn_time || null, lst_clctn_date || null, id], (err,result) => {
        if (err) { console.log (err); 
          return res.status(500).send("Error updating bin.");}
        if (result.affectedRows === 0) return res.status(404).send("Bin not found.");
        res.send("Bin updated successfully.");
    });
});


//Delete bin
app.delete("/delete-bin/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM bin WHERE bin_ID = ?", [id], (err) => {
    if (err) { console.log(err); return res.status(500).send("Error deleting bin."); }
    if (result.affectedRows === 0 ) return res.status(404).send ("Bin not found.");
    res.send("Bin deleted successfully.");
    });
});




//Driver update collection time, date

app.put("/update-bin-collection/:id", (req, res) => {
  const { lst_clctn_time, lst_clctn_date } = req.body;
  const { id } = req.params;

  if (!lst_clctn_time || !lst_clctn_date) {
    return res.status(400).json({success: false, message: "Date and time are required."});
  }

  const sql = `UPDATE bin SET lst_clctn_time=?, lst_clctn_date=?, status='Empty' WHERE bin_ID=?`;
  db.query(sql, [lst_clctn_time, lst_clctn_date, id], (err, result) => {
    if (err) { console.log(err); 
      return res.status(500).json({success: false, message: "Error updating." });
    }
    if (result.affectedRows === 0) 
      return res.status(404).json({ success: false, message: "Bin not found."});
    res.json({ success: true, message: "Collection time updated successfully."});
  });
});
    



//check exists routes

const checkRoute = "SELECT * FROM route WHERE route_ID = ?";
db.query(checkRoute, [route_ID.trim()], (err, result) => {

    if (err) return res.status(500).send("Database error");
    if (result.length === 0) return res.status(400).send ("Route ID does not exist.");


    const sql = `INSERT INTO bin (bin_ID, type, status, location, route_ID, QR_ID)
                 VALUES (?,?,?,?,?,?)`;
                
    db.query(sql, [bin_ID.trim(), type, status, location.trim(),route_ID.trim(), QR_ID.trim()], (err) =>{
        if (err) {console.log(err); return res.status(500).send("Error adding bin.");}
        res.send("Bin added successfully.");
    });             
});
});
});
});




//===========================================================================================================================//


//get all QR codes
app.get("/get-qrcodes", (req,res) => {
    db.query("SELECT * FROM qr_code", (err, result) =>{
        if (err) {console.log(err); return res.status(500).send("Database error.");}
        res.json(result);
    });
});



//Add QR code
app.post("/add-qrcode", (req, res) => {
    const { QR_id, data} = req.body;

    if (!QR_id || !data) {
        return res.status(400).send("All fields are required.");
    }

    const checkID = "SELECT * FROM qr_code WHERE QR_id = ? ";
    db.query(checkID, [QR_id.trim()], (err, result) => {
        if (err) return res.status(500).send("Database error.");
        if (result.length > 0 ) return res.status(400).send("QR ID already exist.");

        const checkData = "SELECT * FROM qr_code WHERE data = ?";
        db.query(checkData, [data.trim()], (err, result) => {
            if (err) return res.status(500).send("Database error.");
            if (result.length > 0) return res.status(400).send("QR data already exist.");

            const sql = `INSERT INTO qr_code (QR_id, data) VALUES (?, ?)`;
            db.query(sql, [QR_id.trim(), data.trim()], (err) => {
                if (err) { console.log(err); return res.status(500).send("Error adding QR code."); }
                res.send("QR code added successfully.");
            });
        });
    });
});


//Update QR code

app.put("/update-qrcode/:id", (req, res) =>{
    const { data } = req.body;
    const { id } = req.params;

    if (!data) {
        return res.status(400).send(" Data field is required")
    }

    const sql = `UPDATE qr_code SET data=? WHERE QR_id=?`;
    db.query(sql, [data, id], (err, result) => {
        if (err) { console.log(err); return res.status(500).send("Error updating QR code");}
        if (result.affectedRows === 0 ) return res.status(404).send("QR code not found");
        res.send("QR code updated successfully");
    });
});


//Delete QR code


app.delete("/delete-qrcode/:id", (req, res) => {
    const { id } = req.params;
    db.query("DELETE FROM qr_code WHERE QR_id = ?", [id], (err,result) => {
        if (err) { console.log(err); return res.status(500).send("Error deleting the code.");}
        if (result.affectedRows === 0 ) return res.status (404).send("QR code not found.");
        res.send("QR code deleted successfully.");
    });
});


//===============================================================================================================
// ── Check truck availability ─────────────────────────────────
app.get("/check-truck-availability", (req, res) => {
  const { truck_ID, time, day_of_week } = req.query;
 
  if (!truck_ID || !day_of_week || !time) {
    return res.status(400).json({ error: "truck_ID, day_of_week, and time are required." });
  }
 
  const query = `
    SELECT s.schedule_id, s.time, s.day_of_week, r.route_name, r.route_ID
    FROM schedule s
    JOIN route r ON s.route_ID = r.route_ID
    WHERE r.truck_ID = ?
      AND s.day_of_week = ?
      AND s.time = ?
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
        },
      });
    }
    return res.json({ conflict: false, conflictDetails: null });
  });
});
 
// ── Add schedule ─────────────────────────────────────────────
app.post("/add-schedule", (req, res) => {
  const { schedule_id, time, area, status, day_of_week, route_ID } = req.body;
 
  if (!schedule_id || !time || !area || !status || !day_of_week || !route_ID) {
    return res.status(400).json("All fields are required.");
  }
 
  // 1 — Check duplicate schedule ID
  const checkID = "SELECT * FROM schedule WHERE schedule_id = ?";
  db.query(checkID, [schedule_id], (err, result) => {
    if (err) return res.status(500).json("Database error.");
    if (result.length > 0) {
      return res.status(409).json(`Schedule ID "${schedule_id}" already exists.`);
    }
 
    // 2 — Check if truck assigned to this route is already busy on this day+time
    const truckConflictCheck = `
      SELECT s.schedule_id, s.day_of_week, s.time, r.route_name, r.truck_ID
      FROM schedule s
      JOIN route r ON s.route_ID = r.route_ID
      WHERE r.truck_ID = (
          SELECT truck_ID FROM route WHERE route_ID = ?
      )
        AND s.day_of_week = ?
        AND s.time = ?
      LIMIT 1
    `;
 
    db.query(truckConflictCheck, [route_ID, day_of_week, time], (err, conflicts) => {
      if (err) return res.status(500).json("Server error checking truck conflicts.");
 
      if (conflicts.length > 0) {
        return res.status(409).json(
          `Truck is already assigned to route "${conflicts[0].route_name}" on ${day_of_week} at ${time}. Please choose a different time.`
        );
      }
 
      // 3 — Insert schedule
      const insert = `
        INSERT INTO schedule (schedule_id, time, area, status, day_of_week, route_ID)
        VALUES (?, ?, ?, ?, ?, ?)
      `;
 
      db.query(insert, [schedule_id, time, area, status, day_of_week, route_ID], (err2) => {
        if (err2) {
          if (err2.code === "ER_DUP_ENTRY") {
            return res.status(409).json(`Schedule ID "${schedule_id}" already exists.`);
          }
          return res.status(500).json("Failed to add schedule.");
        }
        return res.status(200).json("Schedule added successfully.");
      });
    });
  });
});
 
 
// ── GET all schedules ────────────────────────────────────────
app.get("/get-schedules", (req, res) => {
  const query = `
    SELECT
      s.schedule_id, s.time, s.area, s.status, s.day_of_week, s.route_ID,
      r.route_name, r.area_name, r.truck_ID
    FROM schedule s
    LEFT JOIN route r ON s.route_ID = r.route_ID
    ORDER BY FIELD(s.day_of_week,
      'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
    ), s.time ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json("Failed to fetch schedules.");
    return res.json(results);
  });
});
 
// ── Update schedule ──────────────────────────────────────────
app.put("/update-schedule/:schedule_id", (req, res) => {
  const { schedule_id } = req.params;
  const { time, area, status, day_of_week, route_ID } = req.body;
 
  if (!time || !area || !status || !day_of_week || !route_ID) {
    return res.status(400).json("All fields are required.");
  }
 
  // Check truck conflict excluding THIS schedule
  const truckConflictCheck = `
    SELECT s.schedule_id, r.route_name
    FROM schedule s
    JOIN route r ON s.route_ID = r.route_ID
    WHERE r.truck_ID = (
        SELECT truck_ID FROM route WHERE route_ID = ?
    )
      AND s.day_of_week = ?
      AND s.time = ?
      AND s.schedule_id != ?
    LIMIT 1
  `;
 
  db.query(truckConflictCheck, [route_ID, day_of_week, time, schedule_id], (err, conflicts) => {
    if (err) return res.status(500).json("Server error checking conflicts.");
 
    if (conflicts.length > 0) {
      return res.status(409).json(
        `Truck is already assigned to route "${conflicts[0].route_name}" on ${day_of_week} at ${time}. Please choose a different time.`
      );
    }
 
    const update = `
      UPDATE schedule
      SET time = ?, area = ?, status = ?, day_of_week = ?, route_ID = ?
      WHERE schedule_id = ?
    `;
 
    db.query(update, [time, area, status, day_of_week, route_ID, schedule_id], (err2) => {
      if (err2) return res.status(500).json("Failed to update schedule.");
      return res.status(200).json("Schedule updated successfully.");
    });
  });
});
 
 
// ── Delete schedule ──────────────────────────────────────────
app.delete("/delete-schedule/:schedule_id", (req, res) => {
  const { schedule_id } = req.params;
 
  db.query("DELETE FROM schedule WHERE schedule_id = ?", [schedule_id], (err, result) => {
    if (err) return res.status(500).json("Failed to delete schedule.");
    if (result.affectedRows === 0) return res.status(404).json("Schedule not found.");
    return res.status(200).json("Schedule deleted successfully.");
  });
});
//===================================================================



// ── Multer setup — saves images to /uploads folder ──
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, unique + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|webp|gif/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) return cb(null, true);
    cb(new Error("Only image files are allowed."));
  },
});



// ── GET all awareness content ──
app.get("/get-awareness-content", (req, res) => {
  const query = `
    SELECT content_ID, title, content_type, image, content_body, description
    FROM awareness_content
    ORDER BY content_ID ASC
  `;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json("Failed to fetch awareness content.");
    return res.json(results);
  });
});


// ── POST add new awareness content ──
app.post("/add-awareness-content", upload.single("image"), (req, res) => {
  const { content_ID, title, content_type, content_body, description } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!content_ID || !title || !content_type || !content_body || !description) {
    return res.status(400).json("All fields are required.");
  }

  const query = `
    INSERT INTO awareness_content (content_ID, title, content_type, image, content_body, description)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(query, [content_ID, title, content_type, image, content_body, description], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") {
        return res.status(409).json(`Content ID "${content_ID}" already exists.`);
      }
      return res.status(500).json("Failed to add content.");
    }
    return res.status(200).json("Content added successfully.");
  });
});


// ── PUT update awareness content ──
app.put("/update-awareness-content/:content_ID", upload.single("image"), (req, res) => {
  const { content_ID } = req.params;
  const { title, content_type, content_body, description } = req.body;

  if (!title || !content_type || !content_body || !description) {
    return res.status(400).json("All fields are required.");
  }

  // If a new image was uploaded, update it; otherwise keep existing
  if (req.file) {
    // Delete old image if it exists
    const getOldImage = `SELECT image FROM awareness_content WHERE content_ID = ?`;
    db.query(getOldImage, [content_ID], (err, rows) => {
      if (!err && rows.length > 0 && rows[0].image) {
        const oldPath = path.join(__dirname, "uploads", rows[0].image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    });

    const query = `
      UPDATE awareness_content
      SET title = ?, content_type = ?, image = ?, content_body = ?, description = ?
      WHERE content_ID = ?
    `;
    db.query(query, [title, content_type, req.file.filename, content_body, description, content_ID], (err) => {
      if (err) return res.status(500).json("Failed to update content.");
      return res.status(200).json("Content updated successfully.");
    });

  } else {
    // No new image — keep existing
    const query = `
      UPDATE awareness_content
      SET title = ?, content_type = ?, content_body = ?, description = ?
      WHERE content_ID = ?
    `;
    db.query(query, [title, content_type, content_body, description, content_ID], (err) => {
      if (err) return res.status(500).json("Failed to update content.");
      return res.status(200).json("Content updated successfully.");
    });
  }
});


// ── DELETE awareness content ──
app.delete("/delete-awareness-content/:content_ID", (req, res) => {
  const { content_ID } = req.params;

  // Delete image file from disk first
  const getImage = `SELECT image FROM awareness_content WHERE content_ID = ?`;
  db.query(getImage, [content_ID], (err, rows) => {
    if (!err && rows.length > 0 && rows[0].image) {
      const imgPath = path.join(__dirname, "uploads", rows[0].image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    db.query("DELETE FROM awareness_content WHERE content_ID = ?", [content_ID], (err2) => {
      if (err2) return res.status(500).json("Failed to delete content.");
      return res.status(200).json("Content deleted successfully.");
    });
  });
});



//----------------------------------------------------------------




//get complaints for specific  resident

app.get("/get-complaints/:resident_ID", (req, res ) => {
  const { resident_ID } = req.params;

  const sql = `
    SELECT complaint_ID, complaint_type, description, image, location, status, date
    FROM complaint 
    WHERE resident_ID = ?
    ORDER BY date DESC
    `;

    db.query(sql, [resident_ID], (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({success: false, message: "Database error."});
      }
      return res.json({ success: true, complaints: results });
    });
});


// get all complaints for admin dashboard
app.get("/get-all-complaints", (req, res) => {
  const sql = `
  SELECT c.complaint_ID, c.complaint_type, c.description, c.image,
         c.location, c.status, c.date, r.name AS resident_name, r.email AS resident_email
  FROM complaint c
  LEFT JOIN resident r ON c.resident_ID = r.resident_ID
  ORDER BY c.date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "Database error."});
    }
    return res.json({ success: true, complaints: results });
  });
});



// submit new complaint with optional image

app.post("submit-complaint", upload.single("image"), (req, res) => {
  const { complaint_type, description, location, date, resident_ID } = req.body;

  if (!complaint_type || !location || !resident_ID) {
    return res.status(400).json({
      success: false,
      message: "complaint_type, location, and resident_ID are requires"
    });
  }

  const image = req.file ? req.file.filename : null;
  const complaintDate = date || new Date().toISOString().split("T")[0];
  const status = "panding";

  // auto-increment complaint id

  const insertSql = `
    INSERT INTO complaint
      (complaint_type, description, image, location, status, resident_ID, date)
    VALUES (?,?,?,?,?,?,?)
    `;

    db.query(
      insertSql,
        [complaint_type, description || "", image, location, status, resident_ID, complaintDate],
        (err, result) => {
          if (err) {
            console.log(err); 
            return res.status(500).json({ success: false, message: "Failed to submit complaint."});

          }
          return res.status(200).json({
            success: true,
            message: "Complaint submitted successfully.",
            complaint_ID: result.insertId, //returns the new auto-increment I
          });
        }
    );
});

























// ── PUT update complaint status (admin) ─────────────────────
app.put("/update-complaint-status/:complaint_ID", (req, res) => {
  const { complaint_ID } = req.params;
  const { status } = req.body;

  const allowed = ["pending", "in progress", "completed"];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: "status must be one of: pending, in progress, completed",
    });
  }

  const sql = "UPDATE complaint SET status = ? WHERE complaint_ID = ?";
  db.query(sql, [status, complaint_ID], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "Database error." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Complaint not found." });
    }
    return res.status(200).json({ success: true, message: "Status updated successfully." });
  });
});


// ── DELETE a complaint ──────────────────────────────────────
app.delete("/delete-complaint/:complaint_ID", (req, res) => {
  const { complaint_ID } = req.params;

  // Delete associated image from disk first
  const getImageSql = "SELECT image FROM complaint WHERE complaint_ID = ?";
  db.query(getImageSql, [complaint_ID], (err, rows) => {
    if (!err && rows.length > 0 && rows[0].image) {
      const imgPath = path.join(__dirname, "uploads", rows[0].image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    db.query("DELETE FROM complaint WHERE complaint_ID = ?", [complaint_ID], (err2, result) => {
      if (err2) {
        console.log(err2);
        return res.status(500).json({ success: false, message: "Error deleting complaint." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Complaint not found." });
      }
      return res.status(200).json({ success: true, message: "Complaint deleted successfully." });
    });
  });
});









//---------------------------------------------------------
//Feedback

//get all Feedback for all feedback section

app.get("/get-feedback", (req, res) => {
  const sql =`
    SELECT f.feedback_ID, f.comment, f.rating, f.submitted_date, f.resident_ID,
          r.name AS resident_name
    FROM feedback f
    LEFT JOIN resident r ON f.resident_ID = r.resident_ID
    ORDER BY f.submitted_date DESC
    `;

    db.query(sql, (err, results) => {
      if (err) {
        console.log(err);
        return res.status(500).json({success: false, message: "Database error."});
      }
      return res.json({ success: true, Feedback: results});
    });
});


// get feedback for specific resident

app.get("/get-feedback/:resident_ID", (req, res) => {
  const { resident_ID } = req.params;

  const sql = `
    SELECT feedback_ID, comment, rating, submitted_date
    FROM feedback
    WHERE resident_ID = ?
    ORDER BY submitted_date DESC
  `;
  db.query(sql, [resident_ID], (err, results) => {
    if (err) {
      console.log(err);
      return res.status(500).json({success: false, message: "Database error"});
    }
    return res.json({ success: true, Feedback: results});
  });
});



//submit feedback

app.post("/submit-feedback", (req, res) => {
  const { comment, rating, resident_ID } = req.body;

  if (!rating || !resident_ID) {
    return res.status(400).json({
      success: false,
      message: "Rating and resident_ID are required.",
    });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({
       success: false,
      message: "Rating must be between 1 and 5.",
    });
  }


    // Generate feedback_ID

    const countSql = "SELECT COUNT(*) AS cnt FROM feedback";
    db.query(countSql, (err, countResult) => {
      if (err) {
        console.log (err);
        return res.status(500).json({ success: false, message: "Database error."});

      }

      const count = countResult[0].cnt + 1;
      const feedback_ID = "F" + String(count).padStart(3, "0");
      const submitted_date = new Date().toISOString().split("T")[0];

      const insertSql = `
        INSERT INTO feedback (feedback_ID, comment, rating, submitted_date, resident_ID)
        VALUES (?,?,?,?,?)
        `;

        db.query(
          insertSql,
          [feedback_ID, comment || "", rating, submitted_date, resident_ID],
          (err2) => {
            if (err2) {
              console.log(err2);
              return res.status(500).json({success: false, message: "Failed to submit feedback."});
            }
            return res.status(200).json({
              success: true,
              message: "Feedback submitted successfully.",
              feedback_ID,
            });
          }
        );
    });
});



//Delete feedback

app.delete("/delete-feedback/:feedback_ID", (req, res) => {
  const { feedback_ID } = req.params;

  db.query("DELETE FROM feedback WHERE feedback_ID = ?" , [feedback_ID], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "Error deleting feedback." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Feedback not found."});
    }
      return res.status(200).json({success: true, message: "Feedback deleted successfully."})
  });
});




// GET bin details by QR ID
app.get("/get-bin-by-qr/:qr_id", (req, res) => {
  const { qr_id } = req.params;

  const sql = `
    SELECT b.*, r.route_name
    FROM bin b
    LEFT JOIN route r ON b.route_ID = r.route_ID
    WHERE b.QR_ID = ?
    LIMIT 1
  `;

  db.query(sql, [qr_id], (err, result) => {
    if (err) {
      console.log(err);
      return res.status(500).json({ success: false, message: "Database error." });
    }
    if (result.length === 0) {
      return res.status(404).json({ success: false, message: "No bin found for this QR code." });
    }
    return res.json({ success: true, bin: result[0] });
  });
});




//===========================================================================================
//Collection schedule

app.get("/get-resident-schedule/:resident_id", (req, res) => {
  const { resident_id } = req.params;

  db.query(
    "SELECT * FROM resident WHERE resident_ID = ? LIMIT 1",
    [resident_id],
    (err, residentResult) => {
      if (err)                         return res.status(500).json({ error: "DB error fetching resident." });
      if (residentResult.length === 0) return res.status(404).json({ error: "Resident not found." });

      const resident = residentResult[0];
      const address  = (resident.address || "").toLowerCase().trim();

      if (!address) return res.json({ resident, schedules: [], matchedArea: null });

      db.query("SELECT * FROM route", (err2, routes) => {
        if (err2) return res.status(500).json({ error: "DB error fetching routes." });

        // Match route_name inside resident's address
        let matchedRoute = routes.find((r) => {
          const routeName = (r.route_name || "").toLowerCase().trim();
          return routeName.length > 0 && address.includes(routeName);
        });

        // Fallback: match area_name
        if (!matchedRoute) {
          matchedRoute = routes.find((r) => {
            const areaName = (r.area_name || "").toLowerCase().trim();
            return areaName.length > 0 && address.includes(areaName);
          });
        }

        if (!matchedRoute) return res.json({ resident, schedules: [], matchedArea: null });

        const scheduleQuery = `
          SELECT s.schedule_id, s.time, s.area, s.status, s.day_of_week, s.route_ID,
                 r.route_name, r.area_name, r.truck_ID
          FROM schedule s
          LEFT JOIN route r ON s.route_ID = r.route_ID
          WHERE s.route_ID = ?
          ORDER BY FIELD(s.day_of_week,
            'Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'
          ), s.time ASC
        `;

        db.query(scheduleQuery, [matchedRoute.route_ID], (err3, schedules) => {
          if (err3) return res.status(500).json({ error: "DB error fetching schedules." });
          return res.json({ resident, schedules, matchedArea: matchedRoute.route_name });
        });
      });
    }
  );
});

//=====================special request=======================================================================================


app.get("/special-requests/:residentID", (req, res) => {
  const { residentID } = req.params;

  const sql = ` 
    SELECT request_ID, request_date, request_time, location, email,
          address, description, status, schedule_date, schedule_time,
          item_type
    FROM special_request
    WHERE resident_ID = ?
    ORDER BY request_date DESC, request_time DESC
    `;

  db.query(sql, [residentID], (err, results) => {
    if (err) {
      console.error("GET special-requests error:", err);
      return res.status(500).json({success: false, message: "Database error."});
    }
    res.json({ success: true, requests: results });
  });
});


//create a new special request 

app.post("/special-requests", (req, res) => {
  const {
    resident_ID, location, email, address, description, item_type, request_date, request_time,} = req.body;

  if (!resident_ID || !location || !email || !address || !item_type || !request_date || !request_time) {
    return res.status(400).json({ success: false, message: "All required fields must be provided."});
  }

const sql = `
  INSERT INTO special_request
    (request_date, request_time, location, email,
     address, description, status, resident_ID, item_type)
  VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?)
`;

db.query(
  sql,
  [request_date, request_time, location, email, address, description || null, resident_ID, item_type],
  (err, result) => {
    if (err) {
      console.error("POST special-requests error:", err);
      return res.status(500).json({ success: false, message: "Failed to submit request." });
    }
    res.json({ success: true, message: "Request submitted successfully.", request_ID: result.insertId });
  }
);

 });



// get all requests for admin

app.get("/admin/special-requests", (req, res) => {
  const sql = `
    SELECT sr.*, r.name AS resident_name
    FROM special_request sr
    LEFT JOIN resident r ON sr.resident_ID = r.resident_ID
    ORDER BY sr.request_date DESC
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error("GET admin special-requests error:", err);
      return res.status(500).json({ success: false, message: "Database error." });

    }
    res.json({ success: true, requests: results });
  });
});

//update status by admin

app.patch("/admin/special-requests/:requestID", (req, res) => {
  const { requestID } = req.params;
  const { status, schedule_date, schedule_time } = req.body;

const allowed = ["Pending", "Scheduled", "Completed", "Rejected"];
  if (!status || !allowed.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status value." });
  }

  const sql = `
    UPDATE special_request
    SET    status        = ?, schedule_date = ?, schedule_time = ?
    WHERE  request_ID    = ?
  `;


  db.query(sql, [status, schedule_date || null, schedule_time || null, requestID], (err, result) => {
      if (err) {
        console.error("PATCH special-requests error:", err);
        return res.status(500).json({ success: false, message: "Failed to update request." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ success: false, message: "Request not found." });
      }
      res.json({ success: true, message: "Request updated successfully." });
    });
  });
  



// DELETE — admin removes a request
app.delete("/admin/special-requests/:requestID", (req, res) => {
  const { requestID } = req.params;

  db.query("DELETE FROM special_request WHERE request_ID = ?", [requestID], (err, result) => {
    if (err) {
      console.error("DELETE special-requests error:", err);
      return res.status(500).json({ success: false, message: "Failed to delete request." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ success: false, message: "Request not found." });
    }
    res.json({ success: true, message: "Request deleted successfully." });
  });
});



















app.listen(5000, () => {
  console.log("Server running on port 5000");
});