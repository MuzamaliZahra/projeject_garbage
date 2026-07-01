const express = require("express");
const router = express.Router();
const { getBins, addBin, updateBin, deleteBin, updateBinCollection, getBinByQR } = require("../controllers/binController");

router.get("/get-bins", getBins);
router.post("/add-bin", addBin);
router.put("/update-bin/:id", updateBin);
router.delete("/delete-bin/:id", deleteBin);
router.put("/update-bin-collection/:id", updateBinCollection);
router.get("/get-bin-by-qr/:qr_id", getBinByQR);

module.exports = router;