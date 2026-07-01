const express = require("express");
const router = express.Router();

const {
  addEmergencyAlert,
  getAlerts,
  getAlertById,
  updateAlert,
  deleteAlert,
  getLocations,
  getResidentsByLocation,
  getAlertsForResident
} = require("../controllers/emergencyAlertController");

router.post("/add-emergency-alert", addEmergencyAlert);
router.get("/get-alerts", getAlerts);
router.get("/get-alert/:id", getAlertById);
router.put("/update-alert/:id", updateAlert);
router.delete("/delete-alert/:id", deleteAlert);
router.get("/get-locations", getLocations);
router.get("/get-residents-by-location/:location", getResidentsByLocation);
router.get("/get-alerts/resident/:residentId", getAlertsForResident);

module.exports = router;