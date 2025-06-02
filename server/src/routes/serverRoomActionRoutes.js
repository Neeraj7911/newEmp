const express = require("express");
const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const ExcelJS = require("exceljs");

const prisma = new PrismaClient();
const router = express.Router();

console.log("Server room routes loaded");

// Debug route
router.get("/debug", (req, res) => {
  res.json({ message: "Server room routes active" });
});

// Middleware to verify JWT and admin role
const verifyAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await prisma.admin.findUnique({ where: { id: decoded.id } });
    if (!admin) return res.status(403).json({ error: "Not an admin" });
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid token" });
  }
};

router.post("/", async (req, res) => {
  const { punchCardId, component, action } = req.body;
  console.log("POST /api/server-room-actions received:", req.body);
  try {
    if (!punchCardId) {
      return res.status(400).json({ error: "punchCardId is required" });
    }
    const employee = await prisma.employee.findUnique({
      where: { punchCardId },
    });
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    const serverRoomAction = await prisma.serverRoomAction.create({
      data: {
        employeeId: employee.id,
        component,
        action,
      },
    });
    res.json({ message: "Action recorded", data: serverRoomAction });
  } catch (error) {
    console.error("Error in server-room-actions POST:", error);
    res.status(500).json({ error: "Failed to record action" });
  }
});

router.get("/", verifyAdmin, async (req, res) => {
  try {
    const actions = await prisma.serverRoomAction.findMany({
      include: {
        employee: {
          select: { name: true, punchCardId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const actionsWithAttendance = await Promise.all(
      actions.map(async (action) => {
        const attendance = await prisma.attendance.findFirst({
          where: {
            employeeId: action.employeeId,
            checkIn: { lte: action.createdAt },
            checkInLocation: "Server Room",
          },
          orderBy: { checkIn: "desc" },
        });
        return {
          ...action,
          checkIn: attendance ? attendance.checkIn : null,
          checkOut: attendance ? attendance.checkOut : null,
        };
      })
    );

    res.json(actionsWithAttendance);
  } catch (error) {
    console.error("Error fetching server room actions:", error);
    res.status(500).json({ error: "Failed to fetch actions" });
  }
});

router.get("/export", verifyAdmin, async (req, res) => {
  try {
    const actions = await prisma.serverRoomAction.findMany({
      include: {
        employee: {
          select: { name: true, punchCardId: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Server Room Actions");

    worksheet.columns = [
      { header: "Employee Name", key: "employeeName", width: 20 },
      { header: "Punch Card ID", key: "punchCardId", width: 15 },
      { header: "Component", key: "component", width: 15 },
      { header: "Action", key: "action", width: 15 },
      { header: "Date", key: "date", width: 20 },
      { header: "Check-In Time", key: "checkIn", width: 20 },
      { header: "Check-Out Time", key: "checkOut", width: 20 },
    ];

    for (const action of actions) {
      const attendance = await prisma.attendance.findFirst({
        where: {
          employeeId: action.employeeId,
          checkIn: { lte: action.createdAt },
          checkInLocation: "Server Room",
        },
        orderBy: { checkIn: "desc" },
      });

      worksheet.addRow({
        employeeName: action.employee.name,
        punchCardId: action.employee.punchCardId,
        component: action.component,
        action: action.action,
        date: new Date(action.createdAt).toLocaleString(),
        checkIn: attendance
          ? new Date(attendance.checkIn).toLocaleString()
          : "-",
        checkOut: attendance?.checkOut
          ? new Date(attendance.checkOut).toLocaleString()
          : "-",
      });
    }

    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFADD8E6" },
    };

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=server-room-actions.xlsx"
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error exporting server room actions:", error);
    res.status(500).json({ error: "Failed to export actions" });
  }
});

module.exports = router;
