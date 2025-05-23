const express = require("express");
const router = express.Router();
const {
  recordAttendance,
  getLastAttendance,
  getAttendance,
  getEmployeeAttendance,
  getMonthlySummary,
  exportMonthlySummary,
} = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/record", recordAttendance); // Public endpoint
router.get("/last", getLastAttendance); // Public endpoint
router.get("/", authMiddleware, getAttendance);
router.get("/employee", authMiddleware, getEmployeeAttendance); // Admin-only
router.get("/summary", authMiddleware, getMonthlySummary);
router.get("/export", authMiddleware, exportMonthlySummary);

module.exports = router;
