const db = require("../config/db");

const getDashboardStats = (req, res) => {
  const queries = {
    residents: "SELECT COUNT(*) AS count FROM resident",
    trucks: "SELECT COUNT(*) AS count FROM truck",
    pendingComplaints: "SELECT COUNT(*) AS count FROM complaint WHERE status = 'pending'",
    bins: "SELECT COUNT(*) AS count FROM bin",
  };

  const keys = Object.keys(queries);
  const results = {};
  let completed = 0;
  let hasError = false;

  keys.forEach((key) => {
    db.query(queries[key], (err, result) => {
      if (err) {
        console.log("Stats query error:", err);
        if (!hasError) {
          hasError = true;
          return res.status(500).json({ error: "Database error fetching stats." });
        }
        return;
      }
      results[key] = result[0].count;
      completed++;
      if (completed === keys.length) {
        res.json(results);
      }
    });
  });
};

module.exports = { getDashboardStats };