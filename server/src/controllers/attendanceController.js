const { PrismaClient } = require("@prisma/client");
const { Parser } = require("json2csv");
const prisma = new PrismaClient();

const recordAttendance = async (req, res) => {
  const {
    punchCardId,
    action,
    location = "Unknown",
    isForced = false,
  } = req.body;

  if (!punchCardId || !action) {
    return res
      .status(400)
      .json({ error: "punchCardId and action are required" });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { punchCardId },
    });
    if (!employee) {
      return res.status(400).json({ error: "Invalid punchCardId" });
    }

    const lastAttendance = await prisma.attendance.findFirst({
      where: { employeeId: employee.id, checkOut: null },
      orderBy: { checkIn: "desc" },
    });

    const violationCount = await prisma.attendance.count({
      where: { employeeId: employee.id, violationCount: { gt: 0 } },
    });

    if (action === "check-in" || action === "emergency-check-in") {
      if (lastAttendance) {
        return res.status(400).json({ error: "Employee already checked in" });
      }

      if (action === "check-in" && violationCount >= 3) {
        return res
          .status(403)
          .json({ error: "Check-in restricted due to violations" });
      }

      const attendance = await prisma.attendance.create({
        data: {
          employeeId: employee.id,
          checkIn: new Date(),
          checkInLocation: location,
          isEmergency: action === "emergency-check-in",
          violationCount: isForced ? violationCount + 1 : violationCount,
          createdAt: new Date(),
        },
      });

      if (action === "emergency-check-in") {
        setTimeout(async () => {
          const record = await prisma.attendance.findFirst({
            where: { id: attendance.id, checkOut: null },
          });
          if (record) {
            const checkOut = new Date();
            const duration = Math.round(
              (checkOut - new Date(record.checkIn)) / (1000 * 60)
            );
            await prisma.attendance.update({
              where: { id: attendance.id },
              data: {
                checkOut,
                checkOutLocation: location,
                duration,
              },
            });
            console.log(`Auto-checked out ${punchCardId} after 5 minutes`);
          }
        }, 5 * 60 * 1000);
      }

      return res.json({
        message:
          action === "check-in"
            ? "Check-in recorded"
            : "Temporary entry recorded",
        attendance,
      });
    }

    if (action === "check-out") {
      if (!lastAttendance) {
        return res.status(400).json({ error: "No active check-in found" });
      }

      const checkOut = new Date();
      const duration = Math.round(
        (checkOut - new Date(lastAttendance.checkIn)) / (1000 * 60)
      );
      const updatedViolationCount = isForced
        ? lastAttendance.violationCount + 1
        : lastAttendance.violationCount;

      const attendance = await prisma.attendance.update({
        where: { id: lastAttendance.id },
        data: {
          checkOut,
          checkOutLocation: location,
          duration,
          violationCount: updatedViolationCount,
        },
      });

      return res.json({ message: "Check-out recorded", attendance });
    }

    return res.status(400).json({ error: "Invalid action" });
  } catch (error) {
    console.error("Record Attendance Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const getLastAttendance = async (req, res) => {
  const { punchCardId } = req.query;
  if (!punchCardId) {
    return res.status(400).json({ error: "punchCardId is required" });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { punchCardId },
    });
    if (!employee) {
      return res.status(400).json({ error: "Invalid punchCardId" });
    }

    const lastAttendance = await prisma.attendance.findFirst({
      where: { employeeId: employee.id },
      orderBy: { checkIn: "desc" },
      include: {
        employee: {
          select: { id: true, name: true, department: true, punchCardId: true },
        },
      },
    });

    res.json(lastAttendance || null);
  } catch (error) {
    console.error("Get Last Attendance Error:", error);
    return res.status(500).json({ error: "Server error" });
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
        employee: {
          select: { id: true, name: true, department: true, punchCardId: true },
        },
      },
      orderBy: { checkIn: "desc" },
    });
    res.json(attendances);
  } catch (error) {
    console.error("Get Attendance Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

const getEmployeeAttendance = async (req, res) => {
  const { punchCardId, startDate, endDate } = req.query;
  if (!punchCardId) {
    return res.status(400).json({ error: "punchCardId is required" });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { punchCardId },
    });
    if (!employee) {
      return res.status(400).json({ error: "Invalid punchCardId" });
    }

    const where = { employeeId: employee.id };
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      where.checkIn = { gte: start, lte: end };
      console.log("Query Filter:", {
        punchCardId,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
    }

    const attendances = await prisma.attendance.findMany({
      where,
      include: {
        employee: {
          select: { id: true, name: true, department: true, punchCardId: true },
        },
      },
      orderBy: { checkIn: "desc" },
    });

    console.log("Found Attendances:", attendances);
    res.json(attendances);
  } catch (error) {
    console.error("Get Employee Attendance Error:", error);
    return res.status(500).json({ error: "Server error" });
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
        employee: {
          select: { id: true, name: true, department: true, punchCardId: true },
        },
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
    return res.status(500).json({ error: "Server error" });
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
        employee: {
          select: { id: true, name: true, department: true, punchCardId: true },
        },
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
    return res.status(500).json({ error: "Server error" });
  }
};

const resetViolations = async (req, res) => {
  const { punchCardId } = req.body;
  if (!punchCardId) {
    return res.status(400).json({ error: "punchCardId is required" });
  }

  try {
    const employee = await prisma.employee.findUnique({
      where: { punchCardId },
    });
    if (!employee) {
      return res.status(400).json({ error: "Invalid punchCardId" });
    }

    await prisma.attendance.updateMany({
      where: { employeeId: employee.id, violationCount: { gt: 0 } },
      data: { violationCount: 0 },
    });

    res.json({ message: "Violations reset successfully" });
  } catch (error) {
    console.error("Reset Violations Error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  recordAttendance,
  getLastAttendance,
  getAttendance,
  getEmployeeAttendance,
  getMonthlySummary,
  exportMonthlySummary,
  resetViolations,
};
