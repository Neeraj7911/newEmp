import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAttendance } from "../utils/api";

function AttendanceTable() {
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const response = await getAttendance();
        setAttendance(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.error("Fetch Attendance Error:", error);
        toast.error("Failed to load attendance");
      }
      setLoading(false);
    };
    fetchAttendance();
  }, []);

  return (
    <>
      <style>
        {`
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          @keyframes fade-in {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          .page-container {
            min-height: 100vh;
            height: 100vh;
            width: 100vw;
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
            overflow-x: hidden;
            color: #f1f5f9;
            box-sizing: border-box;
            z-index: 1;
          }
          .page-container::before {
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
          .title {
            font-size: 2.25rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            background: linear-gradient(to right, #f1f5f9, #93c5fd);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            animation: fade-in 0.5s ease-out;
            padding: 0.5rem;
            z-index: 20;
            width: 100%;
            max-width: 1200px;
            text-align: center;
          }
          .loading {
            text-align: center;
            font-size: 0.875rem;
            color: #cbd5e1;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          .spinner {
            width: 1.25rem;
            height: 1.25rem;
            border: 2px solid #60a5fa;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          .table-container {
            width: 100%;
            max-width: 1200px;
            overflow-x: auto;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 0 1px rgba(255, 255, 255, 0.1);
            background: #0f172a;
            animation: fade-in 0.5s ease-out;
          }
          .table {
            width: 100%;
            border-collapse: separate;
            border-spacing: 0;
          }
          .table-head {
            background: #1e40af;
            color: #f1f5f9;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .table-head th {
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            font-size: 0.875rem;
            letter-spacing: 0.03em;
            border-bottom: 1px solid #334155;
            white-space: nowrap;
          }
          .table-head th:first-child {
            border-top-left-radius: 12px;
          }
          .table-head th:last-child {
            border-top-right-radius: 12px;
          }
          .table-row {
            border-bottom: 1px solid #334155;
            transition: all 0.3s ease;
            animation: fade-in 0.5s ease-out;
          }
          .table-row:nth-child(even) {
            background: #1e293b;
          }
          .table-row:hover {
            background: #334155;
            transform: translateY(-2px);
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
          .table-row:last-child {
            border-bottom: none;
          }
          .table-cell {
            padding: 1rem;
            font-size: 0.875rem;
            color: #f1f5f9;
            white-space: nowrap;
          }
          .no-data {
            text-align: center;
            font-size: 0.875rem;
            color: #64748b;
            padding: 1.5rem;
          }
          @media (max-width: 768px) {
            .page-container {
              padding: 3rem 0 0 0;
            }
            .title {
              font-size: 1.5rem;
              padding: 0.25rem;
              max-width: 100%;
            }
            .table-container {
              border-radius: 0;
              box-shadow: none;
              max-width: 100%;
            }
            .table-head th, .table-cell {
              padding: 0.5rem;
              font-size: 0.75rem;
            }
            .table-head th:not(:nth-child(1)):not(:nth-child(3)):not(:nth-child(7)),
            .table-cell:not(:nth-child(1)):not(:nth-child(3)):not(:nth-child(7)) {
              display: none;
            }
            .loading, .no-data {
              padding: 1rem;
              font-size: 0.8125rem;
            }
          }
        `}
      </style>
      <div className="page-container">
        <h2 className="title">Attendance Records</h2>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Loading...
          </div>
        ) : attendance.length === 0 ? (
          <p className="no-data">No attendance records found.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead className="table-head">
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
                  <tr key={record.id} className="table-row">
                    <td className="table-cell">{record.employee.name}</td>
                    <td className="table-cell">
                      {record.employee.department || "N/A"}
                    </td>
                    <td className="table-cell">
                      {new Date(record.checkIn).toLocaleString()}
                    </td>
                    <td className="table-cell">
                      {record.checkOut
                        ? new Date(record.checkOut).toLocaleString()
                        : "-"}
                    </td>
                    <td className="table-cell">
                      {record.checkInLocation || "N/A"}
                    </td>
                    <td className="table-cell">
                      {record.checkOutLocation || "N/A"}
                    </td>
                    <td className="table-cell">{record.duration || "-"}</td>
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

export default AttendanceTable;
