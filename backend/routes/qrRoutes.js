const express = require("express");
const router = express.Router();
const { getQRCodes, addQRCode, updateQRCode, deleteQRCode } = require("../controllers/qrController");

router.get("/get-qrcodes", getQRCodes);
router.post("/add-qrcode", addQRCode);
router.put("/update-qrcode/:id", updateQRCode);
router.delete("/delete-qrcode/:id", deleteQRCode);

module.exports = router;