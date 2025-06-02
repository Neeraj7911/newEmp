import { useState } from "react";
import { toast } from "react-toastify";
import { getSummary } from "../utils/api";
import { Download } from "lucide-react";
import "../styles/MonthlySummary.css"; // Assuming you have a CSS file for styling

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
