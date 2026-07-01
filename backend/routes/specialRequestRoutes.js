const express = require("express");
const router = express.Router();
const {
  getRequestsByResident, createRequest, getAllRequests,
  updateRequestStatus, deleteRequest,
} = require("../controllers/specialRequestController");

router.get("/special-requests/:residentID", getRequestsByResident);
router.post("/special-requests", createRequest);
router.get("/admin/special-requests", getAllRequests);
router.patch("/admin/special-requests/:requestID", updateRequestStatus);
router.delete("/admin/special-requests/:requestID", deleteRequest);

module.exports = router;