const { PrismaClient } = require("@prisma/client");
const { Parser } = require("json2csv");
const prisma = new PrismaClient();

const recordAttendance = async (req, res) => {
  const { punchCardId, location } = req.body;
  if (!punchCardId || !location) {
    return res
      .status(400)
      .json({ error: "Punch card ID and location are required" });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { punchCardId },
    });
    if (!employee) {
      return res.status(400).json({ error: "Invalid punch card ID" });
    }

    const lastAttendance = await prisma.attendance.findFirst({
      where: { employeeId: employee.id },
      orderBy: { checkIn: "desc" },
    });

    if (!lastAttendance || lastAttendance.checkOut) {
      // New check-in
      const attendance = await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          checkIn: new Date(),
          checkInLocation: location,
          createdAt: new Date(),
        },
      });
      res.json({ message: "Check-in recorded", attendance });
    } else {
      // Check-out
      const checkOut = new Date();
      const duration = Math.round(
        (checkOut - lastAttendance.checkIn) / 1000 / 60
      ); // Duration in minutes
      const attendance = await prisma.attendance.update({
        where: { id: lastAttendance.id },
        data: { checkOut, duration, checkOutLocation: location },
      });
      res.json({ message: "Check-out recorded", attendance });
    }
  } catch (error) {
    console.error("Record Attendance Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getLastAttendance = async (req, res) => {
  const { punchCardId } = req.query;
  if (!punchCardId) {
    return res.status(400).json({ error: "Punch card ID is required" });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { punchCardId },
    });
    if (!employee) {
      return res.status(400).json({ error: "Invalid punch card ID" });
    }

    const lastAttendance = await prisma.attendance.findFirst({
      where: { employeeId: employee.id },
      orderBy: { checkIn: "desc" },
      include: { employee: { select: { name: true, department: true } } },
    });

    res.json(lastAttendance || null);
  } catch (error) {
    console.error("Get Last Attendance Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getAttendance = async (req, res) => {
  const { employeeId, startDate, endDate } = req.query;
  const where = {};
  if (employeeId) where.employeeId = parseInt(employeeId);
  if (startDate && endDate) {
    where.checkIn = { gte: new Date(startDate), lte: new Date(endDate) };
  }

  try {
    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: { select: { id: true, name: true, department: true } },
      },
      orderBy: { checkIn: "desc" },
    });
    res.json(attendances);
  } catch (error) {
    console.error("Get Attendance Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getEmployeeAttendance = async (req, res) => {
  const { punchCardId, startDate, endDate } = req.query;
  if (!punchCardId) {
    return res.status(400).json({ error: "Punch card ID is required" });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { punchCardId },
    });
    if (!employee) {
      return res.status(400).json({ error: "Invalid punch card ID" });
    }

    const where = { employeeId: employee.id };
    if (startDate && endDate) {
      // Ensure dates are in ISO format (YYYY-MM-DD)
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999); // Include entire end date
      where.checkIn = { gte: start, lte: end };
      console.log("Query Filter:", {
        punchCardId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: { employee: { select: { name: true, department: true } } },
      orderBy: { checkIn: "desc" },
    });

    console.log("Found Attendances:", attendances);
    res.json(attendances);
  } catch (error) {
    console.error("Get Employee Attendance Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const getMonthlySummary = async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) {
    return res.status(400).json({ error: "Month and year are required" });
  }

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        checkIn: { gte: startDate, lte: endDate },
      },
      include: {
        employee: { select: { id: true, name: true, department: true } },
      },
    });

    const summary = attendances.reduce((acc, curr) => {
      const empId = curr.employeeId;
      if (!acc[empId]) {
        acc[empId] = {
          employee: curr.employee,
          totalDuration: 0,
          entries: 0,
        };
      }
      acc[empId].totalDuration += curr.duration || 0;
      acc[empId].entries += 1;
      return acc;
    }, {});

    const result = Object.values(summary);
    res.json(result);
  } catch (error) {
    console.error("Get Monthly Summary Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const exportMonthlySummary = async (req, res) => {
  const { month, year } = req.query;
  if (!month || !year) {
    return res.status(400).json({ error: "Month and year are required" });
  }

  try {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    const attendances = await prisma.attendance.findMany({
      where: {
        checkIn: { gte: startDate, lte: endDate },
      },
      include: {
        employee: { select: { id: true, name: true, department: true } },
      },
    });

    const summary = attendances.reduce((acc, curr) => {
      const empId = curr.employeeId;
      if (!acc[empId]) {
        acc[empId] = {
          employeeName: curr.employee.name,
          department: curr.employee.department || "N/A",
          totalDuration: 0,
          entries: 0,
        };
      }
      acc[empId].totalDuration += curr.duration || 0;
      acc[empId].entries += 1;
      return acc;
    }, {});

    const data = Object.values(summary);
    const fields = [
      { label: "Employee Name", value: "employeeName" },
      { label: "Department", value: "department" },
      { label: "Total Duration (min)", value: "totalDuration" },
      { label: "Entries", value: "entries" },
    ];
    const parser = new Parser({ fields });
    const csv = parser.parse(data);

    res.header("Content-Type", "text/csv");
    res.attachment(`monthly_summary_${year}_${month}.csv`);
    res.send(csv);
  } catch (error) {
    console.error("Export Monthly Summary Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  recordAttendance,
  getLastAttendance,
  getAttendance,
  getEmployeeAttendance,
  getMonthlySummary,
  exportMonthlySummary,
};
