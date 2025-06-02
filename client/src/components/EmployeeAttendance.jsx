import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getEmployees, getEmployeeAttendance } from "../utils/api";
import { Calendar, Download } from "lucide-react";
import "../styles/EmployeeAttendance.css";

function EmployeeAttendance() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getEmployees();
        console.log("Employees:", response.data);
        setEmployees(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Fetch Employees Error:", error);
        toast.error("Failed to load employees");
      }
    };
    fetchEmployees();
  }, []);

  const handleFetch = async () => {
    if (!selectedEmployee) {
      toast.error("Please select an employee");
      return;
    }
    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      toast.error("Start date must be before end date");
      return;
    }
    setLoading(true);
    try {
      const response = await getEmployeeAttendance(
        selectedEmployee,
        startDate,
        endDate
      );
      console.log("Attendance Response:", response.data);
      setAttendance(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch Attendance Error:", error);
      toast.error(error.response?.data?.error || "Failed to load attendance");
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (attendance.length === 0) {
      toast.error("No attendance data to download");
      return;
    }

    const headers = [
      "Employee",
      "Department",
      "Check-In",
      "Check-Out",
      "Check-In Location",
      "Check-Out Location",
      "Duration (min)",
    ];

    const rows = attendance.map((record) => [
      record.employee.name || "N/A",
      record.employee.department || "N/A",
      new Date(record.checkIn).toLocaleString(),
      record.checkOut ? new Date(record.checkOut).toLocaleString() : "-",
      record.checkInLocation || "N/A",
      record.checkOutLocation || "N/A",
      record.duration || "-",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const employeeName =
      employees.find((emp) => emp.punchCardId === selectedEmployee)?.name ||
      "employee";
    const fileName = `${employeeName}_attendance_${startDate || "all"}_${
      endDate || "all"
    }.csv`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="emp-attendance-container">
        <div className="heading">
          <h2 className="emp-attendance-title">
            <Calendar className="emp-attendance-calendar-icon" />
            Employee Attendance
          </h2>
        </div>
        <div className="emp-attendance-form-card">
          <div className="emp-attendance-form-grid">
            <div className="emp-attendance-form-group">
              <label className="emp-attendance-label" htmlFor="employee">
                Employee
              </label>
              <select
                id="employee"
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="emp-attendance-select"
                disabled={loading}
              >
                <option value="">Select Employee</option>
                {employees.map((emp) => (
                  <option key={emp.punchCardId} value={emp.punchCardId}>
                    {emp.name} ({emp.punchCardId})
                  </option>
                ))}
              </select>
            </div>
            <div className="emp-attendance-form-group">
              <label className="emp-attendance-label" htmlFor="startDate">
                Start Date
              </label>
              <input
                type="date"
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="emp-attendance-input"
                disabled={loading}
              />
            </div>
            <div className="emp-attendance-form-group">
              <label className="emp-attendance-label" htmlFor="endDate">
                End Date
              </label>
              <input
                type="date"
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="emp-attendance-input"
                disabled={loading}
              />
            </div>
          </div>
          <div className="emp-attendance-button-group">
            <button
              onClick={handleFetch}
              className="emp-attendance-fetch-button"
              disabled={loading}
            >
              Fetch Attendance
            </button>
            <button
              onClick={downloadCSV}
              className="emp-attendance-download-button"
              disabled={loading || attendance.length === 0}
            >
              <Download className="emp-attendance-download-icon" />
              Download Summary
            </button>
          </div>
        </div>
        {loading ? (
          <div className="emp-attendance-loading">
            <div className="emp-attendance-spinner"></div>
            Loading...
          </div>
        ) : attendance.length === 0 ? (
          <p className="emp-attendance-no-data">
            No attendance records found for the selected criteria.
          </p>
        ) : (
          <div className="emp-attendance-table-container">
            <table className="emp-attendance-table">
              <thead className="emp-attendance-table-head">
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Check-In Location</th>
                  <th>Check-Out Location</th>
                  <th>Duration (min)</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((record) => (
                  <tr key={record.id} className="emp-attendance-table-row">
                    <td className="emp-attendance-table-cell">
                      {record.employee.name}
                    </td>
                    <td className="emp-attendance-table-cell">
                      {record.employee.department || "N/A"}
                    </td>
                    <td className="emp-attendance-table-cell">
                      {new Date(record.checkIn).toLocaleString()}
                    </td>
                    <td className="emp-attendance-table-cell">
                      {record.checkOut
                        ? new Date(record.checkOut).toLocaleString()
                        : "-"}
                    </td>
                    <td className="emp-attendance-table-cell">
                      {record.checkInLocation || "N/A"}
                    </td>
                    <td className="emp-attendance-table-cell">
                      {record.checkOutLocation || "N/A"}
                    </td>
                    <td className="emp-attendance-table-cell">
                      {record.duration || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}

export default EmployeeAttendance;
