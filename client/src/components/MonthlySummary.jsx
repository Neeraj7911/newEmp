import { useState } from "react";
import { toast } from "react-toastify";
import { getSummary } from "../utils/api";
import { Download } from "lucide-react";

function MonthlySummary() {
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFetch = async () => {
    setLoading(true);
    try {
      const response = await getSummary(month, year);
      setSummary(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      toast.error("Failed to load summary");
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (summary.length === 0) {
      toast.error("No summary data to download");
      return;
    }

    const headers = ["Employee", "Department", "Total Hours", "Entries"];
    const rows = summary.map((item) => [
      item.employee.name || "N/A",
      item.employee.department || "N/A",
      (item.totalDuration / 60).toFixed(2),
      item.entries || 0,
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = `monthly_summary_${year}_${month}.csv`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Summary exported");
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
          .sum-container {
            min-height: 100vh;
            width: 100%;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 3rem 1rem;
            color: #f1f5f9;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            box-sizing: border-box;
            z-index: 10;
          }
          .sum-container::before {
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
          .sum-title {
            font-size: 2.25rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            background: linear-gradient(to right, #f1f5f9, #93c5fd);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-bottom: 2rem;
            max-width: 800px;
            width: 100%;
            text-align: center;
          }
          .sum-controls {
            display: flex;
            flex-wrap: wrap;
            gap: 1rem;
            background: #0f172a;
            padding: 1.5rem;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 0 1px rgba(255, 255, 255, 0.1);
            margin-bottom: 2rem;
            justify-content: center;
            width: 100%;
            max-width: 800px;
          }
          .sum-select, .sum-input {
            padding: 0.75rem;
            border: 1px solid #334155;
            border-radius: 8px;
            background: #1e293b;
            color: #f1f5f9;
            font-size: 0.875rem;
            width: 100%;
            max-width: 150px;
          }
          .sum-select {
            appearance: none;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23cbd5e1' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 1rem;
          }
          .sum-select:focus, .sum-input:focus {
            outline: none;
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
          }
          .sum-select option {
            background: #1e293b;
            color: #f1f5f9;
          }
          .sum-input::placeholder {
            color: #64748b;
          }
          .sum-select:disabled, .sum-input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .sum-button-group {
            display: flex;
            gap: 1rem;
            flex-wrap: wrap;
          }
          .sum-fetch-button, .sum-download-button {
            padding: 0.75rem 1.5rem;
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
          .sum-fetch-button:hover, .sum-download-button:hover {
            background: linear-gradient(90deg, #1d4ed8, #2563eb);
          }
          .sum-fetch-button:disabled, .sum-download-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: linear-gradient(90deg, #4b5e8e, #6b7280);
          }
          .sum-download-icon {
            width: 1.125rem;
            height: 1.125rem;
          }
          .sum-loading {
            text-align: center;
            font-size: 0.875rem;
            color: #cbd5e1;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          .sum-spinner {
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
          .sum-table-container {
            width: 100%;
            max-width: 800px;
            margin: 2rem auto;
            overflow-x: auto;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 8px rgba(96, 165, 250, 0.3);
            background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
            box-sizing: border-box;
            padding-bottom: 0.5rem;
          }
          .sum-table {
            width: 100%;
            min-width: 600px;
            border-collapse: separate;
            border-spacing: 0;
          }
          .sum-table-head {
            background: linear-gradient(90deg, #1e40af 0%, #2563eb 100%);
            color: #f1f5f9;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .sum-table-head th {
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            font-size: 0.875rem;
            letter-spacing: 0.02em;
            border-bottom: 1px solid #334155;
            white-space: normal;
          }
          .sum-table-head th:first-child {
            border-top-left-radius: 12px;
          }
          .sum-table-head th:last-child {
            border-top-right-radius: 12px;
          }
          .sum-table-row {
            border-bottom: 1px solid #334155;
          }
          .sum-table-row:nth-child(even) {
            background: #1e293b;
          }
          .sum-table-row:hover {
            background: #334155;
          }
          .sum-table-row:last-child {
            border-bottom: none;
          }
          .sum-table-cell {
            padding: 1rem;
            font-size: 0.875rem;
            color: #f1f5f9;
            white-space: nowrap;
            word-break: break-word;
          }
          .sum-no-data {
            text-align: center;
            padding: 1.5rem;
            font-size: 0.875rem;
            color: #64748b;
          }
          @media (max-width: 768px) {
            .sum-container {
              padding: 3rem 0.5rem;
              overflow-x: visible;
            }
            .sum-title {
              font-size: 1.75rem;
              padding: 0.25rem;
            }
            .sum-controls {
              padding: 1rem;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              max-width: 100%;
            }
            .sum-select, .sum-input {
              max-width: 100%;
            }
            .sum-button-group {
              flex-direction: column;
              gap: 0.5rem;
            }
            .sum-fetch-button, .sum-download-button {
              font-size: 0.8125rem;
              padding: 0.75rem;
            }
            .sum-table-container {
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              max-width: 100%;
              margin: 1rem auto;
            }
            .sum-table {
              min-width: 400px;
            }
            .sum-table-head th, .sum-table-cell {
              padding: 0.5rem;
              font-size: 0.75rem;
              white-space: normal;
            }
            .sum-table-head th:nth-child(2), .sum-table-cell:nth-child(2) {
              display: none; /* Hide Department */
            }
            .sum-loading, .sum-no-data {
              padding: 1rem;
              font-size: 0.8125rem;
            }
          }
        `}
      </style>
      <div className="sum-container">
        <h2 className="sum-title">Monthly Summary</h2>
        <div className="sum-controls">
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="sum-select"
            disabled={loading}
          >
            {[...Array(12)].map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {new Date(0, i).toLocaleString("default", { month: "long" })}
              </option>
            ))}
          </select>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="sum-input"
            placeholder="Year"
            disabled={loading}
          />
          <div className="sum-button-group">
            <button
              onClick={handleFetch}
              className="sum-fetch-button"
              disabled={loading}
            >
              Fetch Summary
            </button>
            <button
              onClick={downloadCSV}
              className="sum-download-button"
              disabled={loading || summary.length === 0}
            >
              <Download className="sum-download-icon" />
              Export CSV
            </button>
          </div>
        </div>
        {loading ? (
          <div className="sum-loading">
            <div className="sum-spinner"></div>
            Loading...
          </div>
        ) : summary.length === 0 ? (
          <p className="sum-no-data">
            No data available for the selected period
          </p>
        ) : (
          <div className="sum-table-container">
            <table className="sum-table">
              <thead className="sum-table-head">
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Total Hours</th>
                  <th>Entries</th>
                </tr>
              </thead>
              <tbody>
                {summary.map((item) => (
                  <tr key={item.employee.id} className="sum-table-row">
                    <td className="sum-table-cell">{item.employee.name}</td>
                    <td className="sum-table-cell">
                      {item.employee.department || "N/A"}
                    </td>
                    <td className="sum-table-cell">
                      {(item.totalDuration / 60).toFixed(2)}
                    </td>
                    <td className="sum-table-cell">{item.entries}</td>
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

export default MonthlySummary;
