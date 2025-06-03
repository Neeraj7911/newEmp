import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { recordAttendance, getLastAttendance } from "../utils/api";
import { Clock } from "lucide-react";
import "../styles/PunchCardEntry.css";

function PunchCardEntry() {
  const [punchCardId, setPunchCardId] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const navigate = useNavigate();
  const locations = [
    "Main Office",
    "Warehouse",
    "Branch Office",
    "Server Room",
  ];

  useEffect(() => {
    if (punchCardId) {
      const fetchStatus = async () => {
        try {
          const response = await getLastAttendance(punchCardId.trim());
          setStatus(response.data);
        } catch (error) {
          console.error("Fetch Status Error:", error);
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
      const action = !status || status.checkOut ? "check-in" : "check-out";
      console.log("Sending request:", {
        punchCardId: trimmedPunchCardId,
        action,
        location,
      });
      const response = await recordAttendance({
        punchCardId: trimmedPunchCardId,
        action,
        location,
      });
      toast.success(response.data.message);
      setStatus(response.data.attendance);
      if (location === "Server Room" && action === "check-in") {
        localStorage.setItem("punchCardId", trimmedPunchCardId);
        console.log("Stored punchCardId in localStorage:", trimmedPunchCardId);
        navigate("/server-room-actions", {
          state: { punchCardId: trimmedPunchCardId },
        });
      }
      setPunchCardId("");
      setLocation("");
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Failed to record attendance";
      console.error("Record Attendance Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(errorMsg);
    }
    setLoading(false);
  };

  const isCheckIn = !status || status.checkOut;

  return (
    <>
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
