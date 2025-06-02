import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { getServerRoomActions, exportServerRoomActions } from "../utils/api";
import Navbar from "./Navbar"; // Adjust path based on your structure
import "../styles/ServerRoomActionLog.css";

function ServerRoomActionLog() {
  const [actions, setActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("Please log in as admin");
      navigate("/login");
      return;
    }

    const fetchActions = async () => {
      try {
        const response = await getServerRoomActions();
        setActions(response.data);
        setLoading(false);
      } catch (error) {
        toast.error(
          error.response?.data?.error || "Failed to fetch server room actions"
        );
        navigate("/login");
      }
    };
    fetchActions();
  }, [navigate]);

  const handleExport = async () => {
    try {
      const response = await exportServerRoomActions();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "server-room-actions.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Exported successfully");
    } catch (error) {
      toast.error("Failed to export server room actions");
    }
  };

  return (
    <>
      <Navbar />
      <div className="action-log-container">
        <div className="action-log-card">
          <h2 className="action-log-title">Server Room Action Log</h2>
          <Link to="/admin" className="action-log-back-link">
            Back to Admin
          </Link>
          <button onClick={handleExport} className="action-log-export-button">
            Export to Excel
          </button>
          {loading ? (
            <p>Loading...</p>
          ) : (
            <table className="action-log-table">
              <thead>
                <tr>
                  <th>Employee Name</th>
                  <th>Punch Card ID</th>
                  <th>Component</th>
                  <th>Action</th>
                  <th>Date</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((action) => (
                  <tr key={action.id}>
                    <td>{action.employee.name}</td>
                    <td>{action.employee.punchCardId}</td>
                    <td>{action.component}</td>
                    <td>{action.action}</td>
                    <td>{new Date(action.createdAt).toLocaleString()}</td>
                    <td>
                      {action.checkIn
                        ? new Date(action.checkIn).toLocaleString()
                        : "-"}
                    </td>
                    <td>
                      {action.checkOut
                        ? new Date(action.checkOut).toLocaleString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

export default ServerRoomActionLog;
