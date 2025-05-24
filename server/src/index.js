const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const employeeRoutes = require("./routes/employeeRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const authRoutes = require("./routes/authRoutes");

dotenv.config();
const app = express();

app.use(
  cors({
    origin: "https://empatt.vercel.app",
    credentials: true,
  })
);
app.use(express.json());

// Add root route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to the Employee Attendance System API" });
});

app.use("/api/employees", employeeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
