const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
  getComplaintsByResident, getAllComplaints, submitComplaint,
  updateComplaintStatus, deleteComplaint, getRecentComplaints,
} = require("../controllers/complaintController");

router.get("/get-complaints/:resident_ID", getComplaintsByResident);
router.get("/get-all-complaints", getAllComplaints);
router.post("/submit-complaint", upload.single("image"), submitComplaint);
router.put("/update-complaint-status/:complaint_ID", updateComplaintStatus);
router.delete("/delete-complaint/:complaint_ID", deleteComplaint);
router.get("/get-recent-complaints", getRecentComplaints);

module.exports = router;