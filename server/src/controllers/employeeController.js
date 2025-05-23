const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const createEmployee = async (req, res) => {
  const { name, punchCardId, department } = req.body;
  if (!name || !punchCardId) {
    return res
      .status(400)
      .json({ error: "Name and punch card ID are required" });
  }

  try {
    const employee = await prisma.employee.create({
      data: { name, punchCardId, department },
    });
    res.json(employee);
  } catch (error) {
    console.error("Create Employee Error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Punch card ID already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

const getEmployees = async (req, res) => {
  try {
    const employees = await prisma.employee.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(employees);
  } catch (error) {
    console.error("Get Employees Error:", error);
    res.status(500).json({ error: "Server error" });
  }
};

const updateEmployee = async (req, res) => {
  const { id } = req.params;
  const { name, punchCardId, department } = req.body;
  if (!name || !punchCardId) {
    return res
      .status(400)
      .json({ error: "Name and punch card ID are required" });
  }

  try {
    const employee = await prisma.employee.update({
      where: { id: parseInt(id) },
      data: { name, punchCardId, department },
    });
    res.json(employee);
  } catch (error) {
    console.error("Update Employee Error:", error);
    if (error.code === "P2002") {
      return res.status(400).json({ error: "Punch card ID already exists" });
    }
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

const deleteEmployee = async (req, res) => {
  const { id } = req.params;
  try {
    const employee = await prisma.employee.delete({
      where: { id: parseInt(id) },
    });
    res.json({ message: "Employee deleted", employee });
  } catch (error) {
    console.error("Delete Employee Error:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Employee not found" });
    }
    if (error.code === "P2003") {
      return res
        .status(400)
        .json({ error: "Cannot delete employee with attendance records" });
    }
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createEmployee,
  getEmployees,
  updateEmployee,
  deleteEmployee,
};
