const express = require("express");
const router = express.Router();
const {
  checkTruckAvailability, addSchedule, getSchedules,
  getResidentSchedule, updateSchedule, deleteSchedule, getActiveSchedules
} = require("../controllers/scheduleController");

router.get("/check-truck-availability", checkTruckAvailability);
router.post("/add-schedule", addSchedule);
router.get("/get-schedules", getSchedules);
router.get("/get-resident-schedule/:resident_id", getResidentSchedule);
router.put("/update-schedule/:schedule_id", updateSchedule);
router.delete("/delete-schedule/:schedule_id", deleteSchedule);
router.get("/get-active-schedules", getActiveSchedules);

module.exports = router;