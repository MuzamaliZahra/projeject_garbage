const express = require("express");
const router = express.Router();
const { getResidents, updateResident, deleteResident } = require("../controllers/residentController");

router.get("/get-resident", getResidents);
router.put("/update-resident/:id", updateResident);
router.delete("/delete-resident/:id", deleteResident);

module.exports = router;