import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useState } from "react";
import "../styles/Navbar.css";
function Navbar() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar-container">
          <div className="navbar-title">Admin Dashboard</div>
          <button className="navbar-hamburger" onClick={toggleMenu}>
            ☰
          </button>
          <div className={`navbar-links ${isMenuOpen ? "open" : ""}`}>
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/admin/employees"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              Employees
            </NavLink>
            <NavLink
              to="/admin/attendance"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              Attendance
            </NavLink>
            <NavLink
              to="/admin/employee-attendance"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              Employee Attendance
            </NavLink>
            <NavLink
              to="/admin/summary"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              Summary
            </NavLink>
            <NavLink
              to="/admin/server-room-action-log"
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              Server Logs
            </NavLink>
            <button onClick={handleLogout} className="navbar-logout-btn">
              <LogOut className="navbar-logout-icon" />
              Logout
            </button>
          </div>
        </div>
      </nav>
    </>
  );
}

export default Navbar;
