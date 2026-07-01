const express = require("express");
const router = express.Router();
const {
  addDriver, getDrivers, getUnassignedDrivers,
  getAvailableDrivers, updateDriver, deleteDriver,
} = require("../controllers/driverController");

router.post("/add-driver", addDriver);
router.get("/get-drivers", getDrivers);
router.get("/get-unassigned-drivers", getUnassignedDrivers);
router.get("/get-available-drivers/:truckID", getAvailableDrivers);
router.put("/update-driver/:id", updateDriver);
router.delete("/delete-driver/:id", deleteDriver);

module.exports = router;