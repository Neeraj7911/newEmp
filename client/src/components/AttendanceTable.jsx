import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { getAttendance } from "../utils/api";
import "../styles/AttendanceTable.css"; // Assuming you have a CSS file for styling

function AttendanceTable() {
  const [attendance, setAttendance] = useState([]);
  const [filteredAttendance, setFilteredAttendance] = useState([]);
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [employeeCount, setEmployeeCount] = useState(0);
  const [loading, setLoading] = useState(true);

  console.log("AttendanceTable: Component Rendered");

  useEffect(() => {
    const fetchAttendance = async () => {
      setLoading(true);
      try {
        console.log("AttendanceTable: Fetching attendance...");
        const response = await getAttendance();
        const data = Array.isArray(response.data) ? response.data : [];
        console.log("AttendanceTable: Raw Data:", data);
        // Filter out invalid records
        const validData = data.filter(
          (record) =>
            record &&
            record.employee &&
            record.employee.id &&
            record.employee.name
        );
        console.log("AttendanceTable: Valid Data:", validData);
        setAttendance(validData);
        // Extract unique locations, handle null/undefined
        const uniqueLocations = [
          ...new Set(
            validData
              .map((record) => record.checkInLocation || "Unknown")
              .filter(Boolean)
          ),
        ];
        console.log("AttendanceTable: Unique Locations:", uniqueLocations);
        setLocations(uniqueLocations);
        // Initial filter (all locations)
        setFilteredAttendance(validData);
        // Initial employee count
        const uniqueEmployees = [
          ...new Set(validData.map((record) => record.employee.id)),
        ].length;
        console.log(
          "AttendanceTable: Initial Employee Count:",
          uniqueEmployees
        );
        setEmployeeCount(uniqueEmployees);
      } catch (error) {
        console.error("AttendanceTable: Fetch Error:", error);
        toast.error("Failed to load attendance records");
      }
      setLoading(false);
    };
    fetchAttendance();
  }, []);

  useEffect(() => {
    console.log("AttendanceTable: Filtering for location:", selectedLocation);
    // Filter attendance by selected location
    const filtered =
      selectedLocation === "all"
        ? attendance
        : attendance.filter(
            (record) =>
              (record.checkInLocation || "Unknown") === selectedLocation
          );
    console.log("AttendanceTable: Filtered Data:", filtered);
    setFilteredAttendance(filtered);
    // Calculate unique employees
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

  return (
    <>
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
                </tr>
              </thead>
              <tbody>
                {filteredAttendance.map((record) => (
                  <tr key={record.id} className="table-row">
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
