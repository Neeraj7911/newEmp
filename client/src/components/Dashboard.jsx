import { Routes, Route } from "react-router-dom";
import Navbar from "./Navbar";
import EmployeeList from "./EmployeeList";
import AttendanceTable from "./AttendanceTable";
import MonthlySummary from "./MonthlySummary";
import EmployeeAttendance from "./EmployeeAttendance";
import DashboardHome from "./DashboardHome";
import ServerRoomActions from "./ServerRoomActions";

function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="p-4">
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/employees" element={<EmployeeList />} />
          <Route path="/attendance" element={<AttendanceTable />} />
          <Route path="/summary" element={<MonthlySummary />} />
          <Route path="/employee-attendance" element={<EmployeeAttendance />} />
          <Route path="/server-room-actions" element={<ServerRoomActions />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;
