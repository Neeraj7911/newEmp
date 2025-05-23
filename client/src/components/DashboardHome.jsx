import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { getAttendance, getSummary } from "../utils/api";
import { RefreshCw } from "lucide-react";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

function DashboardHome() {
  const [loading, setLoading] = useState(false);
  const [barData, setBarData] = useState(null);
  const [lineData, setLineData] = useState(null);
  const [pieData, setPieData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const currentDate = new Date();
      const month = currentDate.getMonth() + 1;
      const year = currentDate.getFullYear();
      const summaryResponse = await getSummary(month, year);
      const summary = Array.isArray(summaryResponse.data)
        ? summaryResponse.data
        : [];

      const barLabels = summary.length
        ? summary.map((item) => item.employee.name)
        : [];
      const barValues = summary.length
        ? summary.map((item) => item.totalDuration / 60)
        : [];
      setBarData({
        labels: barLabels,
        datasets: [
          {
            label: "Hours Worked (This Month)",
            data: barValues,
            backgroundColor: "rgba(96, 165, 250, 0.7)",
            borderColor: "rgba(96, 165, 250, 1)",
            borderWidth: 1,
            hoverBackgroundColor: "rgba(96, 165, 250, 0.9)",
          },
        ],
      });

      const departments = summary.length
        ? [
            ...new Set(
              summary.map((item) => item.employee.department || "No Department")
            ),
          ]
        : [];
      const departmentCounts = departments.map((dept) =>
        summary
          .filter(
            (item) => (item.employee.department || "No Department") === dept
          )
          .reduce((sum, item) => sum + item.entries, 0)
      );
      setPieData({
        labels: departments,
        datasets: [
          {
            label: "Attendance by Department",
            data: departmentCounts,
            backgroundColor: [
              "rgba(96, 165, 250, 0.7)",
              "rgba(236, 72, 153, 0.7)",
              "rgba(16, 185, 129, 0.7)",
              "rgba(245, 158, 11, 0.7)",
              "rgba(139, 92, 246, 0.7)",
            ],
            borderColor: [
              "rgba(96, 165, 250, 1)",
              "rgba(236, 72, 153, 1)",
              "rgba(16, 185, 129, 1)",
              "rgba(245, 158, 11, 1)",
              "rgba(139, 92, 246, 1)",
            ],
            borderWidth: 1,
            hoverBackgroundColor: [
              "rgba(96, 165, 250, 0.9)",
              "rgba(236, 72, 153, 0.9)",
              "rgba(16, 185, 129, 0.9)",
              "rgba(245, 158, 11, 0.9)",
              "rgba(139, 92, 246, 0.9)",
            ],
          },
        ],
      });

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);
      const attendanceResponse = await getAttendance();
      const attendance = Array.isArray(attendanceResponse.data)
        ? attendanceResponse.data
        : [];
      const dates = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(startDate);
        date.setDate(startDate.getDate() + i);
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        });
      });
      const attendanceCounts = dates.map(
        (date) =>
          attendance.filter(
            (record) =>
              new Date(record.checkIn).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              }) === date
          ).length
      );
      setLineData({
        labels: dates,
        datasets: [
          {
            label: "Daily Attendance Count",
            data: attendanceCounts,
            fill: true,
            backgroundColor: "rgba(96, 165, 250, 0.2)",
            borderColor: "rgba(96, 165, 250, 1)",
            tension: 0.3,
            pointBackgroundColor: "rgba(96, 165, 250, 1)",
            pointHoverBackgroundColor: "rgba(96, 165, 250, 0.9)",
            pointHoverRadius: 8,
          },
        ],
      });
    } catch (error) {
      console.error("Fetch Dashboard Data Error:", error);
      toast.error("Failed to load dashboard data");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchData();
    toast.info("Dashboard data refreshed");
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          color: "#f1f5f9",
          font: { size: 14, weight: "500" },
        },
      },
      tooltip: {
        backgroundColor: "#1e293b",
        titleColor: "#f1f5f9",
        bodyColor: "#f1f5f9",
        borderColor: "#334155",
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        ticks: { color: "#cbd5e1" },
        grid: { color: "#334155" },
      },
      y: {
        ticks: { color: "#cbd5e1" },
        grid: { color: "#334155" },
        beginAtZero: true,
      },
    },
    animation: {
      duration: 1000,
      easing: "easeOutQuart",
    },
  };

  return (
    <>
      <style>
        {`
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
            height: 100%;
            width: 100%;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            display: flex;
            flex-direction: column;
            align-items: center;
            position: fixed;
            top: 0;
            left: 0;
            margin: 0;
            padding: 0;
            overflow: auto;
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
          }
          .header {
          margin-top: 5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            max-width: 1200px;
            margin-bottom: 1.5rem;
            padding: 1rem;
          }
          .title {
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
            animation: fade-in 0.5s ease-out;
          }
          .dashboard-icon {
            width: 2rem;
            height: 2rem;
            color: #60a5fa;
            transition: transform 0.3s ease;
          }
          .header:hover .dashboard-icon {
            transform: rotate(360deg);
          }
          .refresh-button {
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
            transition: all 0.3s ease;
            position: relative;
            overflow: hidden;
          }
          .refresh-button:hover {
            background: linear-gradient(90deg, #1d4ed8, #2563eb);
            transform: scale(1.05);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.4);
          }
          .refresh-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
            box-shadow: none;
          }
          .refresh-button::before {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 100%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
            transition: left 0.5s ease;
          }
          .refresh-button:not(:disabled):hover::before {
            left: 100%;
          }
          .refresh-icon {
            width: 1.25rem;
            height: 1.25rem;
            transition: transform 0.3s ease;
          }
          .refresh-button:hover .refresh-icon {
            transform: rotate(360deg);
          }
          .loading {
            text-align: center;
            font-size: 1rem;
            color: #cbd5e1;
            padding: 2rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          .spinner {
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
          .chart-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
            gap: 1.5rem;
            width: 100%;
            max-width: 1200px;
            padding: 0 1rem;
          }
          .chart-card {
            background: #0f172a;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 0 1px rgba(255, 255, 255, 0.1);
            padding: 1.5rem;
            transition: all 0.3s ease;
            animation: fade-in 0.5s ease-out;
            position: relative;
            overflow: hidden;
          }
          .chart-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle at 90% 10%, rgba(96, 165, 250, 0.1) 0%, transparent 50%);
            pointer-events: none;
          }
          .chart-card:hover {
            transform: scale(1.02);
            box-shadow: 0 12px 32px rgba(0, 0, 0, 0.5);
          }
          .chart-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #f1f5f9;
            margin-bottom: 1rem;
            letter-spacing: 0.02em;
            text-align: center;
            transition: color 0.3s ease;
          }
          .chart-card:hover .chart-title {
            color: #93c5fd;
          }
          .chart-container {
            height: 280px;
            position: relative;
          }
          .no-data {
            text-align: center;
            font-size: 1rem;
            color: #64748b;
            padding: 2rem;
          }
          @media (max-width: 768px) {
            .page-container {
              padding: 0.5rem;
            }
            .header {
              width: 100%;
              max-width: none;
              flex-direction: column;
              gap: 1rem;
              padding: 0;
            }
            .title {
              font-size: 1.75rem;
            }
            .refresh-button {
              padding: 0.75rem;
              font-size: 0.8125rem;
            }
            .chart-grid {
              width: 100%;
              max-width: none;
              grid-template-columns: 1fr;
              gap: 0.5rem;
              padding: 0;
            }
            .chart-card {
              padding: 0.75rem;
              border-radius: 0;
              box-shadow: none;
            }
            .chart-title {
              font-size: 1.125rem;
            }
            .chart-container {
              height: 240px;
            }
            .loading {
              padding: 1rem;
            }
          }
        `}
      </style>
      <div className="page-container">
        <div className="header">
          <h2 className="title">
            <svg
              className="dashboard-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Dashboard
          </h2>
          <button
            onClick={handleRefresh}
            className="refresh-button"
            disabled={loading}
          >
            <RefreshCw className="refresh-icon" />
            Refresh
          </button>
        </div>
        {loading ? (
          <div className="loading">
            <div className="spinner"></div>
            Loading dashboard...
          </div>
        ) : (
          <div className="chart-grid">
            <div className="chart-card">
              <h3 className="chart-title">Hours Worked (This Month)</h3>
              <div className="chart-container">
                {barData && barData.labels.length ? (
                  <Bar
                    data={barData}
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          ...chartOptions.scales.y,
                          title: {
                            display: true,
                            text: "Hours",
                            color: "#cbd5e1",
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="no-data">No data available</p>
                )}
              </div>
            </div>
            <div className="chart-card">
              <h3 className="chart-title">Daily Attendance (Last 30 Days)</h3>
              <div className="chart-container">
                {lineData && lineData.labels.length ? (
                  <Line
                    data={lineData}
                    options={{
                      ...chartOptions,
                      scales: {
                        ...chartOptions.scales,
                        y: {
                          ...chartOptions.scales.y,
                          title: {
                            display: true,
                            text: "Attendance Count",
                            color: "#cbd5e1",
                          },
                        },
                      },
                    }}
                  />
                ) : (
                  <p className="no-data">No data available</p>
                )}
              </div>
            </div>
            <div className="chart-card">
              <h3 className="chart-title">Attendance by Department</h3>
              <div className="chart-container">
                {pieData && pieData.labels.length ? (
                  <Pie data={pieData} options={chartOptions} />
                ) : (
                  <p className="no-data">No data available</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default DashboardHome;
