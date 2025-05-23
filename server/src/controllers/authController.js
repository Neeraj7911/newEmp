const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const prisma = require("../db");

const login = async (req, res) => {
  const { username, password } = req.body;
  const admin = await prisma.admin.findUnique({ where: { username } });
  if (!admin) return res.status(400).json({ error: "Invalid credentials" });

  const validPassword = await bcrypt.compare(password, admin.password);
  if (!validPassword)
    return res.status(400).json({ error: "Invalid credentials" });

  const token = jwt.sign(
    { id: admin.id, username: admin.username },
    process.env.JWT_SECRET,
    { expiresIn: "1h" }
  );
  res.json({ token });
};

const register = async (req, res) => {
  const { username, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const admin = await prisma.admin.create({
      data: { username, password: hashedPassword },
    });
    res.status(201).json({ message: "Admin created", admin });
  } catch (error) {
    res.status(400).json({ error: "Username already exists" });
  }
};

module.exports = { login, register };
