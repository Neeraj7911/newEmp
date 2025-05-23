import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getEmployees, getEmployeeAttendance } from "../utils/api";
import { Calendar, Download } from "lucide-react";

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
      <style>
        {`
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow-x: hidden;
            overflow-y: auto;
          }
          .emp-attendance-container {
            min-height: 100vh;
            width: 100%;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            position: absolute;
            top: 0;
            left: 0;
            margin: 0;
            padding: 3rem 0 0 0; /* Matches navbar height */
            overflow-y: auto;
            color: #f1f5f9;
            box-sizing: border-box;
            z-index: 10;
          }
          .emp-attendance-container::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 10% 20%, rgba(96, 165, 250, 0.1) 0%, transparent 50%);
            pointer-events: none;
            z-index: -1;
          }
          .emp-attendance-title {
            font-size: 2.25rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            display: flex;
            align-items: center;
            gap: 0.75rem;
            background: linear-gradient(to right, #f1f5f9, #93c5fd);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            padding: 0.5rem;
            z-index: 20;
            width: 100%;
            max-width: 1000px;
            text-align: center;
          }
          .emp-attendance-calendar-icon {
            width: 2rem;
            height: 2rem;
            color: #60a5fa;
          }
          .emp-attendance-form-card {
            margin-top: 2rem;
            background: #0f172a;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 0 1px rgba(255, 255, 255, 0.1);
            padding: 1.5rem;
            width: 100%;
            max-width: 1000px;
            position: relative;
            overflow: hidden;
          }
          .emp-attendance-form-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 90% 10%, rgba(96, 165, 250, 0.1) 0%, transparent 50%);
            pointer-events: none;
          }
          .emp-attendance-form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }
          .emp-attendance-form-group {
            display: flex;
            flex-direction: column;
          }
          .emp-attendance-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: #cbd5e1;
            margin-bottom: 0.5rem;
            letter-spacing: 0.02em;
          }
          .emp-attendance-input, .emp-attendance-select {
            padding: 0.75rem;
            border: 1px solid #334155;
            border-radius: 8px;
            background: #1e293b;
            color: #f1f5f9;
            font-size: 0.875rem;
          }
          .emp-attendance-input:focus, .emp-attendance-select:focus {
            outline: none;
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
          }
          .emp-attendance-select option {
            background: #1e293b;
            color: #f1f5f9;
          }
          .emp-attendance-input::placeholder {
            color: #64748b;
          }
          .emp-attendance-input:disabled, .emp-attendance-select:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .emp-attendance-button-group {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
          }
          .emp-attendance-fetch-button, .emp-attendance-download-button {
            padding: 0.75rem;
            border: none;
            border-radius: 8px;
            background: linear-gradient(90deg, #2563eb, #3b82f6);
            color: #f1f5f9;
            font-size: 0.875rem;
            font-weight: 600;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }
          .emp-attendance-fetch-button:hover, .emp-attendance-download-button:hover {
            background: linear-gradient(90deg, #1d4ed8, #2563eb);
          }
          .emp-attendance-fetch-button:disabled, .emp-attendance-download-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: linear-gradient(90deg, #4b5e8e, #6b7280);
          }
          .emp-attendance-download-icon {
            width: 1.125rem;
            height: 1.125rem;
          }
          .emp-attendance-loading {
            text-align: center;
            font-size: 0.875rem;
            color: #cbd5e1;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          .emp-attendance-spinner {
            width: 1.5rem;
            height: 1.5rem;
            border: 2px solid #60a5fa;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .emp-attendance-table-container {
            width: 100%;
            max-width: 1000px; /* Constrained like form card */
            margin: 2rem auto;
            overflow-x: auto;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 8px rgba(96, 165, 250, 0.3);
            background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
            box-sizing: border-box;
            padding-bottom: 0.5rem;
          }
          .emp-attendance-table {
            width: 100%;
            min-width: 600px;
            border-collapse: separate;
            border-spacing: 0;
          }
          .emp-attendance-table-head {
            background: linear-gradient(90deg, #1e40af 0%, #2563eb 100%);
            color: #f1f5f9;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .emp-attendance-table-head th {
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            font-size: 0.875rem;
            letter-spacing: 0.02em;
            border-bottom: 1px solid #334155;
            white-space: normal;
          }
          .emp-attendance-table-head th:first-child {
            border-top-left-radius: 12px;
          }
          .emp-attendance-table-head th:last-child {
            border-top-right-radius: 12px;
          }
          .emp-attendance-table-row {
            border-bottom: 1px solid #334155;
          }
          .emp-attendance-table-row:nth-child(even) {
            background: #1e293b;
          }
          .emp-attendance-table-row:hover {
            background: #334155;
          }
          .emp-attendance-table-row:last-child {
            border-bottom: none;
          }
          .emp-attendance-table-cell {
            padding: 1rem;
            font-size: 0.875rem;
            color: #f1f5f9;
            white-space: nowrap;
            word-break: break-word;
          }
          .emp-attendance-no-data {
            text-align: center;
            font-size: 0.875rem;
            color: #64748b;
            padding: 1.5rem;
          }
          @media (max-width: 768px) {
            .emp-attendance-container {
              padding: 3rem 0 0 0;
              overflow-x: visible;
            }
            .emp-attendance-title {
              font-size: 1.75rem;
              padding: 0.25rem;
              max-width: 100%;
            }
            .emp-attendance-form-card {
              padding: 0.75rem;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              max-width: 100%;
              margin-top: 1rem;
            }
            .emp-attendance-form-grid {
              grid-template-columns: 1fr;
              gap: 0.5rem;
            }
            .emp-attendance-button-group {
              flex-direction: column;
              gap: 0.5rem;
            }
            .emp-attendance-fetch-button, .emp-attendance-download-button {
              font-size: 0.8125rem;
            }
            .emp-attendance-table-container {
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              max-width: 100%;
              margin: 1rem auto;
            }
            .emp-attendance-table {
              min-width: 400px;
            }
            .emp-attendance-table-head th, .emp-attendance-table-cell {
              padding: 0.5rem;
              font-size: 0.75rem;
              white-space: normal;
            }
            .emp-attendance-table-head th:not(:nth-child(1)):not(:nth-child(3)):not(:nth-child(7)),
            .emp-attendance-table-cell:not(:nth-child(1)):not(:nth-child(3)):not(:nth-child(7)) {
              display: none;
            }
            .emp-attendance-loading, .emp-attendance-no-data {
              padding: 1rem;
              font-size: 0.8125rem;
            }
          }
        `}
      </style>
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
