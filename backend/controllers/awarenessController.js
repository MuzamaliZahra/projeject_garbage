const db = require("../config/db");
const path = require("path");
const fs = require("fs");

// GET /get-awareness-content
const getAwarenessContent = (req, res) => {
  const query = `SELECT content_ID, title, content_type, image, content_body, description FROM awareness_content ORDER BY content_ID ASC`;
  db.query(query, (err, results) => {
    if (err) return res.status(500).json("Failed to fetch awareness content.");
    res.json(results);
  });
};

// POST /add-awareness-content
const addAwarenessContent = (req, res) => {
  const { content_ID, title, content_type, content_body, description } = req.body;
  const image = req.file ? req.file.filename : null;

  if (!content_ID || !title || !content_type || !content_body || !description)
    return res.status(400).json("All fields are required.");

  const query = `INSERT INTO awareness_content (content_ID, title, content_type, image, content_body, description) VALUES (?, ?, ?, ?, ?, ?)`;
  db.query(query, [content_ID, title, content_type, image, content_body, description], (err) => {
    if (err) {
      if (err.code === "ER_DUP_ENTRY") return res.status(409).json(`Content ID "${content_ID}" already exists.`);
      return res.status(500).json("Failed to add content.");
    }
    res.status(200).json("Content added successfully.");
  });
};

// PUT /update-awareness-content/:content_ID
const updateAwarenessContent = (req, res) => {
  const { content_ID } = req.params;
  const { title, content_type, content_body, description } = req.body;

  if (!title || !content_type || !content_body || !description)
    return res.status(400).json("All fields are required.");

  if (req.file) {
    db.query("SELECT image FROM awareness_content WHERE content_ID = ?", [content_ID], (err, rows) => {
      if (!err && rows.length > 0 && rows[0].image) {
        const oldPath = path.join(__dirname, "../uploads", rows[0].image);
        if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
      }
    });

    const query = `UPDATE awareness_content SET title=?, content_type=?, image=?, content_body=?, description=? WHERE content_ID=?`;
    db.query(query, [title, content_type, req.file.filename, content_body, description, content_ID], (err) => {
      if (err) return res.status(500).json("Failed to update content.");
      res.status(200).json("Content updated successfully.");
    });
  } else {
    const query = `UPDATE awareness_content SET title=?, content_type=?, content_body=?, description=? WHERE content_ID=?`;
    db.query(query, [title, content_type, content_body, description, content_ID], (err) => {
      if (err) return res.status(500).json("Failed to update content.");
      res.status(200).json("Content updated successfully.");
    });
  }
};

// DELETE /delete-awareness-content/:content_ID
const deleteAwarenessContent = (req, res) => {
  const { content_ID } = req.params;

  db.query("SELECT image FROM awareness_content WHERE content_ID = ?", [content_ID], (err, rows) => {
    if (!err && rows.length > 0 && rows[0].image) {
      const imgPath = path.join(__dirname, "../uploads", rows[0].image);
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

    db.query("DELETE FROM awareness_content WHERE content_ID = ?", [content_ID], (err) => {
      if (err) return res.status(500).json("Failed to delete content.");
      res.status(200).json("Content deleted successfully.");
    });
  });
};

module.exports = { getAwarenessContent, addAwarenessContent, updateAwarenessContent, deleteAwarenessContent };