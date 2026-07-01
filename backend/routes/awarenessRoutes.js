const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  getAwarenessContent, addAwarenessContent,
  updateAwarenessContent, deleteAwarenessContent,
} = require("../controllers/awarenessController");

router.get("/get-awareness-content", getAwarenessContent);
router.post("/add-awareness-content", upload.single("image"), addAwarenessContent);
router.put("/update-awareness-content/:content_ID", upload.single("image"), updateAwarenessContent);
router.delete("/delete-awareness-content/:content_ID", deleteAwarenessContent);

module.exports = router;