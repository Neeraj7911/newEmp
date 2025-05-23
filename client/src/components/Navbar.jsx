import { NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useState } from "react";

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
      <style>
        {`
          body {
            overflow-x: hidden;
            overflow-y: auto; /* Allow vertical scroll for content */
          }
          .navbar {
            background: #0f172a;
            color: #f1f5f9;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 3rem;
            z-index: 1000;
          }
          .navbar-container {
            max-width: 1440px;
            margin: 0 auto;
            padding: 0.75rem 1.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            height: 100%;
            box-sizing: border-box;
          }
          .navbar-title {
            font-size: 1.75rem;
            font-weight: 700;
            letter-spacing: 0.02em;
            color: #f1f5f9;
          }
          .navbar-title:hover {
            color: #93c5fd;
          }
          .navbar-links {
            display: flex;
            align-items: center;
            gap: 2rem;
          }
          .navbar-link {
            padding: 0.5rem 1rem;
            font-weight: 500;
            font-size: 1rem;
            color: #cbd5e1;
            text-decoration: none;
            letter-spacing: 0.03em;
          }
          .navbar-link:hover {
            color: #f1f5f9;
          }
          .navbar-link.active {
            color: #f1f5f9;
            font-weight: 600;
          }
          .navbar-logout-btn {
            display: flex;
            align-items: center;
            padding: 0.5rem 1rem;
            font-weight: 500;
            font-size: 1rem;
            color: #cbd5e1;
            background: none;
            border: none;
            cursor: pointer;
            letter-spacing: 0.03em;
          }
          .navbar-logout-btn:hover {
            color: #f1f5f9;
          }
          .navbar-logout-icon {
            width: 1.125rem;
            height: 1.125rem;
            margin-right: 0.5rem;
          }
          .navbar-hamburger {
            display: none;
            font-size: 1.5rem;
            background: none;
            border: none;
            color: #f1f5f9;
            cursor: pointer;
          }
          @media (max-width: 768px) {
            .navbar-container {
              padding: 0.75rem;
              position: relative;
            }
            .navbar-title {
              font-size: 1.5rem;
            }
            .navbar-hamburger {
              display: block;
              position: absolute;
              top: 0.75rem;
              right: 0.75rem;
            }
            .navbar-links {
              display: none;
              flex-direction: column;
              align-items: center;
              width: 100%;
              position: fixed;
              top: 3rem;
              left: 0;
              background: #1e293b;
              padding: 0.75rem 0;
              gap: 0.75rem;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
              z-index: 999;
            }
            .navbar-links.open {
              display: flex;
            }
            .navbar-link, .navbar-logout-btn {
              font-size: 0.8125rem;
              padding: 0.5rem;
              width: 100%;
              text-align: center;
            }
          }
        `}
      </style>
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
