import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getAttendance,
  forceCheckOut,
  emergencyCheckIn,
  resetViolations,
} from "../utils/api";
import "../styles/AttendanceTable.css";

function AttendanceTable() {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [employeeCount, setEmployeeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  console.log("AttendanceTable: Component Rendered");

  const fetchAttendance = async () => {
    setLoading(true);
    try {
      console.log("AttendanceTable: Fetching attendance...");
      const response = await getAttendance();
      const data = Array.isArray(response.data) ? response.data : [];
      console.log("AttendanceTable: Raw Data:", data);
      const validData = data.filter(
        (record) =>
          record &&
          record.employee &&
          record.employee.id &&
          record.employee.name &&
          record.employee.punchCardId
      );
      console.log("AttendanceTable: Valid Data:", validData);
      setAttendance(validData);
      const uniqueLocations = [
        ...new Set(
          validData
            .map((record) => record.checkInLocation || "Unknown")
            .filter(Boolean)
        ),
      ];
      console.log("AttendanceTable: Unique Locations:", uniqueLocations);
      setLocations(uniqueLocations);
      const filtered =
        selectedLocation === "all"
          ? validData
          : validData.filter(
              (record) =>
                (record.checkInLocation || "Unknown") === selectedLocation
            );
      setFilteredAttendance(filtered);
      const uniqueEmployees = [
        ...new Set(filtered.map((record) => record.employee.id)),
      ].length;
      console.log("AttendanceTable: Employee Count:", uniqueEmployees);
      setEmployeeCount(uniqueEmployees);
    } catch (error) {
      console.error("AttendanceTable: Fetch Error:", error);
      toast.error("Failed to load attendance records");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAttendance();
    const interval = setInterval(fetchAttendance, 10000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    console.log("AttendanceTable: Filtering for location:", selectedLocation);
    const filtered =
      selectedLocation === "all"
        ? attendance
        : attendance.filter(
            (record) =>
              (record.checkInLocation || "Unknown") === selectedLocation
          );
    console.log("AttendanceTable: Filtered Data:", filtered);
    setFilteredAttendance(filtered);
    const uniqueEmployees = [
      ...new Set(filtered.map((record) => record.employee.id)),
    ].length;
    console.log("AttendanceTable: Filtered Employee Count:", uniqueEmployees);
    setEmployeeCount(uniqueEmployees);
  }, [selectedLocation, attendance]);

  const handleLocationChange = (e) => {
    console.log("AttendanceTable: Location changed to:", e.target.value);
    setSelectedLocation(e.target.value);
  };

  const handleForceCheckOut = async (record) => {
    if (!record.employee?.punchCardId) {
      toast.error("Invalid employee data");
      console.error("handleForceCheckOut: Missing punchCardId", record);
      return;
    }
    if (!window.confirm(`Force check-out ${record.employee.name}?`)) return;
    setLoading(true);
    try {
      console.log("handleForceCheckOut: Sending request for", {
        punchCardId: record.employee.punchCardId,
        location: record.checkInLocation || "Admin Forced",
      });
      const response = await forceCheckOut(
        record.employee.punchCardId,
        record.checkInLocation || "Admin Forced"
      );
      console.log("handleForceCheckOut: Response", response.data);
      await fetchAttendance();
      toast.success("Employee checked out");
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Failed to force check-out";
      console.error("handleForceCheckOut: Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: {
          punchCardId: record.employee.punchCardId,
          location: record.checkInLocation || "Admin Forced",
        },
      });
      toast.error(errorMsg);
    }
    setLoading(false);
  };

  const handleEmergencyCheckIn = async (record) => {
    if (!record.employee?.punchCardId) {
      toast.error("Invalid employee data");
      console.error("handleEmergencyCheckIn: Missing punchCardId", record);
      return;
    }
    if (!window.confirm(`Allow temporary entry for ${record.employee.name}?`))
      return;
    setLoading(true);
    try {
      console.log("handleEmergencyCheckIn: Sending request for", {
        punchCardId: record.employee.punchCardId,
        location: record.checkOutLocation || "Emergency Entry",
      });
      const response = await emergencyCheckIn(
        record.employee.punchCardId,
        record.checkOutLocation || "Emergency Entry"
      );
      console.log("handleEmergencyCheckIn: Response", response.data);
      await fetchAttendance();
      toast.success("Temporary entry granted (5 minutes)");
    } catch (error) {
      const errorMsg =
        error.response?.data?.error || "Failed to process temporary entry";
      console.error("handleEmergencyCheckIn: Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: {
          punchCardId: record.employee.punchCardId,
          location: record.checkOutLocation || "Emergency Entry",
        },
      });
      toast.error(errorMsg);
    }
    setLoading(false);
  };

  const handleResetViolations = async (record) => {
    if (!record.employee?.punchCardId) {
      toast.error("Invalid employee data");
      console.error("handleResetViolations: Missing punchCardId", record);
      return;
    }
    if (!window.confirm(`Reset violations for ${record.employee.name}?`))
      return;
    setLoading(true);
    try {
      console.log("handleResetViolations: Sending request for", {
        punchCardId: record.employee.punchCardId,
      });
      const response = await resetViolations(record.employee.punchCardId);
      console.log("handleResetViolations: Response", response.data);
      await fetchAttendance();
      toast.success("Violations reset successfully");
    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "Failed to reset violations";
      console.error("handleResetViolations: Error:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        request: { punchCardId: record.employee.punchCardId },
      });
      toast.error(errorMsg);
    }
    setLoading(false);
  };

  const getRowStyle = (record) => {
    if (!record.checkIn || record.checkOut) return {};
    const checkInTime = new Date(record.checkIn);
    if (isNaN(checkInTime)) {
      console.error(
        `Invalid checkIn time for ${record.employee.name}:`,
        record.checkIn
      );
      return {};
    }
    const now = new Date();
    const minutesDiff = (now - checkInTime) / (1000 * 60);
    console.log(
      `Employee ${record.employee.name}: minutesDiff = ${minutesDiff}`
    );
    return minutesDiff > 1 ? { backgroundColor: "#ff4d4d", color: "#fff" } : {};
  };

  return (
    <div className="page-container">
      <h2 className="title">Attendance Records</h2>
      <div className="filter-container">
        <div className="filter-group">
          <label htmlFor="location-filter" className="filter-label">
            Filter by Location:
          </label>
          <select
            id="location-filter"
            value={selectedLocation}
            onChange={handleLocationChange}
            className="filter-select"
            disabled={loading}
          >
            <option value="all">All Locations</option>
            {locations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
        <div className="employee-count">
          Employees at{" "}
          {selectedLocation === "all" ? "All Locations" : selectedLocation}:{" "}
          <span>{employeeCount}</span>
        </div>
      </div>
      {loading ? (
        <div className="loading">
          <div className="spinner"></div>
          Loading attendance records...
        </div>
      ) : filteredAttendance.length === 0 ? (
        <p className="no-data">
          No attendance records found for{" "}
          {selectedLocation === "all" ? "any location" : selectedLocation}.
        </p>
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
                <th>Violations</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAttendance.map((record) => (
                <tr
                  key={record.id}
                  className="table-row"
                  style={getRowStyle(record)}
                >
                  <td className="table-cell">
                    {record.employee?.name || "Unknown"}
                  </td>
                  <td className="table-cell">
                    {record.employee?.department || "N/A"}
                  </td>
                  <td className="table-cell">
                    {record.checkIn
                      ? new Date(record.checkIn).toLocaleString()
                      : "-"}
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
                  <td className="table-cell">{record.violationCount || 0}</td>
                  <td className="table-cell">
                    <div className="action-buttons">
                      {record.checkIn && !record.checkOut && (
                        <button
                          onClick={() => handleForceCheckOut(record)}
                          className="force-checkout-button"
                          disabled={loading}
                        >
                          Force Check-out
                        </button>
                      )}
                      {record.violationCount >= 3 && !record.checkIn && (
                        <button
                          onClick={() => handleEmergencyCheckIn(record)}
                          className="emergency-checkin-button"
                          disabled={loading}
                        >
                          Temporary Entry
                        </button>
                      )}
                      {record.violationCount > 0 && (
                        <button
                          onClick={() => handleResetViolations(record)}
                          className="reset-violations-button"
                          disabled={loading}
                        >
                          Reset Violations
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default AttendanceTable;
