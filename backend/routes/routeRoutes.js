const express = require("express");
const router = express.Router();
const { getRoutes, addRoute, updateRoute, deleteRoute } = require("../controllers/routeController");

router.get("/get-routes", getRoutes);
router.post("/add-route", addRoute);
router.put("/update-route/:id", updateRoute);
router.delete("/delete-route/:id", deleteRoute);

module.exports = router;