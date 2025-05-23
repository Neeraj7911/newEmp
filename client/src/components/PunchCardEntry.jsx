import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { recordAttendance, getLastAttendance } from "../utils/api";
import { Clock } from "lucide-react";

function PunchCardEntry() {
  const [punchCardId, setPunchCardId] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const locations = ["Main Office", "Warehouse", "Branch Office"];

  useEffect(() => {
    if (punchCardId) {
      const fetchStatus = async () => {
        try {
          const response = await getLastAttendance(punchCardId.trim());
          setStatus(response.data);
        } catch (error) {
          setStatus(null);
        }
      };
      fetchStatus();
    } else {
      setStatus(null);
    }
  }, [punchCardId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmedPunchCardId = punchCardId.trim();
    if (!trimmedPunchCardId || !location) {
      toast.error("Please enter punch card ID and select a location");
      return;
    }
    if (trimmedPunchCardId.length > 50) {
      toast.error("Punch card ID must be 50 characters or less");
      return;
    }
    setLoading(true);
    try {
      const response = await recordAttendance({
        punchCardId: trimmedPunchCardId,
        location,
      });
      toast.success(response.data.message);
      setPunchCardId("");
      setLocation("");
      setStatus(response.data.attendance);
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to record attendance");
    }
    setLoading(false);
  };

  const isCheckIn = !status || status.checkOut;

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
          .punch-navbar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 3rem;
            background: linear-gradient(90deg, #0f172a 0%, #1e293b 100%);
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 1rem;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4);
            z-index: 100;
            box-sizing: border-box;
          }
          .punch-navbar-title {
            font-size: 1.25rem;
            font-weight: 600;
            background: linear-gradient(to right, #f1f5f9, #93c5fd);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            letter-spacing: 0.02em;
          }
          .punch-admin-link {
            font-size: 0.875rem;
            font-weight: 500;
            color: #f1f5f9;
            background: linear-gradient(90deg, #2563eb, #3b82f6);
            padding: 0.5rem 1rem;
            border-radius: 6px;
            text-decoration: none;
            transition: background 0.3s ease;
          }
          .punch-admin-link:hover {
            background: linear-gradient(90deg, #1d4ed8, #2563eb);
          }
          .punch-container {
            min-height: 100vh;
            width: 100%;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 3rem 1rem;
            box-sizing: border-box;
            position: relative;
            z-index: 10;
          }
          .punch-container::before {
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
          .punch-card {
            background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 8px rgba(96, 165, 250, 0.3);
            padding: 2rem;
            width: 100%;
            max-width: 400px;
            margin: 2rem auto;
            color: #f1f5f9;
          }
          .punch-header {
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 1.5rem;
          }
          .punch-header-icon {
            width: 2rem;
            height: 2rem;
            color: #60a5fa;
          }
          .punch-header-title {
            font-size: 1.75rem;
            font-weight: 700;
            margin-left: 0.5rem;
            letter-spacing: 0.02em;
            text-transform: uppercase;
            background: linear-gradient(to right, #f1f5f9, #93c5fd);
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
          }
          .punch-status {
            text-align: center;
            margin-bottom: 1.5rem;
          }
          .punch-status-text {
            display: inline-flex;
            align-items: center;
            padding: 0.5rem 1rem;
            border-radius: 9999px;
            font-size: 0.875rem;
            font-weight: 600;
            letter-spacing: 0.02em;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
          }
          .punch-status-checkin {
            background: linear-gradient(90deg, #2563eb, #3b82f6);
            color: #f1f5f9;
          }
          .punch-status-checkout {
            background: linear-gradient(90deg, #dc2626, #ef4444);
            color: #f1f5f9;
          }
          .punch-form-group {
            margin-bottom: 1.5rem;
          }
          .punch-label {
            display: block;
            font-size: 0.875rem;
            font-weight: 500;
            color: #cbd5e1;
            margin-bottom: 0.5rem;
            letter-spacing: 0.02em;
          }
          .punch-input, .punch-select {
            width: 100%;
            padding: 0.75rem;
            border: 1px solid #334155;
            border-radius: 8px;
            background: #1e293b;
            color: #f1f5f9;
            font-size: 0.875rem;
            appearance: none;
          }
          .punch-select {
            padding-right: 2.5rem;
            background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23cbd5e1' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E");
            background-repeat: no-repeat;
            background-position: right 0.75rem center;
            background-size: 1rem;
          }
          .punch-input:focus, .punch-select:focus {
            outline: none;
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
          }
          .punch-input::placeholder {
            color: #64748b;
          }
          .punch-select option {
            background: #1e293b;
            color: #f1f5f9;
          }
          .punch-input:disabled, .punch-select:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .punch-button {
            width: 100%;
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
            justify-content: center;
            gap: 0.5rem;
          }
          .punch-button:hover {
            background: linear-gradient(90deg, #1d4ed8, #2563eb);
          }
          .punch-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: linear-gradient(90deg, #4b5e8e, #6b7280);
          }
          .punch-spinner {
            width: 1rem;
            height: 1rem;
            border: 2px solid #f1f5f9;
            border-top: 2px solid transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @media (max-width: 768px) {
            .punch-container {
              padding: 3rem 0.5rem;
            }
            .punch-card {
              padding: 1.5rem;
              max-width: 350px;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 0 4px rgba(96, 165, 250, 0.3);
            }
            .punch-header-title {
              font-size: 1.25rem;
            }
            .punch-header-icon {
              width: 1.5rem;
              height: 1.5rem;
            }
            .punch-status-text {
              font-size: 0.8125rem;
              padding: 0.5rem 0.75rem;
            }
            .punch-input, .punch-select, .punch-button {
              padding: 0.75rem;
              font-size: 0.8125rem;
            }
            .punch-navbar {
              padding: 0 0.5rem;
            }
            .punch-navbar-title {
              font-size: 1rem;
            }
            .punch-admin-link {
              font-size: 0.75rem;
              padding: 0.5rem 0.75rem;
            }
          }
        `}
      </style>
      <div className="punch-navbar">
        <h1 className="punch-navbar-title">Employee Management</h1>
        <Link to="/login" className="punch-admin-link">
          Admin Login
        </Link>
      </div>
      <div className="punch-container">
        <div className="punch-card">
          <div className="punch-header">
            <Clock className="punch-header-icon" />
            <h2 className="punch-header-title">Attendance</h2>
          </div>
          <div className="punch-status">
            <span
              className={`punch-status-text ${
                isCheckIn ? "punch-status-checkin" : "punch-status-checkout"
              }`}
            >
              Next Action: {isCheckIn ? "Check-In" : "Check-Out"}
            </span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="punch-form-group">
              <label className="punch-label" htmlFor="punchCardId">
                Punch Card ID
              </label>
              <input
                type="text"
                id="punchCardId"
                value={punchCardId}
                onChange={(e) => setPunchCardId(e.target.value)}
                className="punch-input"
                placeholder="Enter your punch card ID"
                disabled={loading}
                maxLength={50}
              />
            </div>
            <div className="punch-form-group">
              <label className="punch-label" htmlFor="location">
                Location
              </label>
              <select
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="punch-select"
                disabled={loading}
              >
                <option value="">Select location</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>
                    {loc}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="punch-button" disabled={loading}>
              {loading && <span className="punch-spinner"></span>}
              {loading ? "Processing..." : isCheckIn ? "Check In" : "Check Out"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default PunchCardEntry;
