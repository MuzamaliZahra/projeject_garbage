const db = require("../config/db");

//signup
const signup = (req, res) => {
  const { name, email, phone_no, address, password } = req.body;

  if (!name || !email || !phone_no || !address || !password)
    return res.status(400).send("All fields are required.");

  if ([name, email, phone_no, address, password].some((f) => f.trim() === ""))
    return res.status(400).send("Fields cannot be empty or blank.");

  if (phone_no.length < 10)
    return res.status(400).send("Phone number must be at least 10 digits.");

  if (password.length < 6)
    return res.status(400).send("Password must be at least 6 characters.");

  db.query("SELECT * FROM resident WHERE email = ?", [email], (err, result) => {
    if (err) return res.status(500).send("Database error.");
    if (result.length > 0)
      return res.status(400).send("Email already registered. Please login.");

    const sql = `INSERT INTO resident (name, email, phone_no, address, password) VALUES (?, ?, ?, ?, ?)`;
    db.query(sql, [name.trim(), email.trim(), phone_no.trim(), address.trim(), password], (err) => {
      if (err) return res.status(500).send("Error inserting data.");
      res.send("Registration successful");
    });
  });
};

//login
const login = (req, res) => {
  const { email, password, role } = req.body;

  const roleMap = {
    Resident: { table: "resident", idField: "resident_ID" },
    Admin:    { table: "admin",    idField: "admin_ID"    },
    Collector:{ table: "driver",   idField: "driver_ID"   },
  };

  if (!roleMap[role])
    return res.status(400).json({ success: false, message: "Invalid role" });

  const { table, idField } = roleMap[role];

  db.query(`SELECT * FROM ${table} WHERE email = ? AND password = ?`, [email, password], (err, result) => {
    if (err) return res.status(500).json({ success: false, message: "Database error" });
    if (result.length > 0) {
      const user = result[0];
      return res.json({
        success: true,
        message: "Login successful",
        role,
        user: { id: user[idField], name: user.name, email: user.email },
      });
    }
    res.status(401).json({ success: false, message: "Invalid email or password" });
  });
};

module.exports = { signup, login };