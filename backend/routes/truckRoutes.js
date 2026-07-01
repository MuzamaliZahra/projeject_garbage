const express = require("express");
const router = express.Router();
const { addTruck, getTrucks, updateTruck, deleteTruck, getTrucksWithDriver } = require("../controllers/truckController");


router.post("/add-truck", addTruck);
router.get("/get-trucks", getTrucks);
router.put("/update-truck/:id", updateTruck);
router.delete("/delete-truck/:id", deleteTruck);
router.get("/get-trucks-with-driver", getTrucksWithDriver);

module.exports = router;


