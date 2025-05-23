import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../utils/api";
import { Users, Download } from "lucide-react";

function EmployeeList() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState({
    id: null,
    name: "",
    punchCardId: "",
    department: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await getEmployees();
        setEmployees(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        toast.error("Failed to load employees");
      }
      setLoading(false);
    };
    fetchEmployees();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.punchCardId) {
      toast.error("Name and punch card ID are required");
      return;
    }
    setLoading(true);
    try {
      if (form.id) {
        const response = await updateEmployee(form.id, {
          name: form.name,
          punchCardId: form.punchCardId,
          department: form.department,
        });
        setEmployees(
          employees.map((emp) => (emp.id === form.id ? response.data : emp))
        );
        toast.success("Employee updated");
      } else {
        const response = await createEmployee({
          name: form.name,
          punchCardId: form.punchCardId,
          department: form.department,
        });
        setEmployees([response.data, ...employees]);
        toast.success("Employee created");
      }
      setForm({ id: null, name: "", punchCardId: "", department: "" });
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to save employee");
    }
    setLoading(false);
  };

  const handleEdit = (employee) => {
    setForm({
      id: employee.id,
      name: employee.name,
      punchCardId: employee.punchCardId,
      department: employee.department || "",
    });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this employee?"))
      return;
    setLoading(true);
    try {
      await deleteEmployee(id);
      setEmployees(employees.filter((emp) => emp.id !== id));
      toast.success("Employee deleted");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to delete employee");
    }
    setLoading(false);
  };

  const downloadCSV = () => {
    if (employees.length === 0) {
      toast.error("No employee data to download");
      return;
    }

    const headers = ["Name", "Punch Card ID", "Department"];
    const rows = employees.map((emp) => [
      emp.name || "N/A",
      emp.punchCardId || "N/A",
      emp.department || "N/A",
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.map((cell) => `"${cell}"`).join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const fileName = `employees_${new Date().toISOString().slice(0, 10)}.csv`;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
          .emp-list-container {
            min-height: 100vh;
            width: 100%;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            padding: 3rem 1rem; /* Clear navbar */
            color: #f1f5f9;
            display: flex;
            flex-direction: column;
            align-items: center;
            position: relative;
            box-sizing: border-box;
            z-index: 10;
          }
          .emp-list-container::before {
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
          .emp-list-title {
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
            margin-bottom: 2rem;
            max-width: 800px;
            width: 100%;
            text-align: center;
          }
          .emp-list-users-icon {
            width: 2rem;
            height: 2rem;
            color: #60a5fa;
          }
          .emp-list-form-card {
            background: #0f172a;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), inset 0 0 1px rgba(255, 255, 255, 0.1);
            padding: 1.5rem;
            width: 100%;
            max-width: 800px;
            margin-bottom: 2rem;
          }
          .emp-list-form-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1rem;
          }
          .emp-list-form-group {
            display: flex;
            flex-direction: column;
          }
          .emp-list-label {
            font-size: 0.875rem;
            font-weight: 500;
            color: #cbd5e1;
            margin-bottom: 0.5rem;
            letter-spacing: 0.02em;
          }
          .emp-list-input {
            padding: 0.75rem;
            border: 1px solid #334155;
            border-radius: 8px;
            background: #1e293b;
            color: #f1f5f9;
            font-size: 0.875rem;
          }
          .emp-list-input:focus {
            outline: none;
            border-color: #60a5fa;
            box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.3);
          }
          .emp-list-input::placeholder {
            color: #64748b;
          }
          .emp-list-input:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .emp-list-button-group {
            display: flex;
            gap: 1rem;
            margin-top: 1rem;
          }
          .emp-list-submit-button, .emp-list-download-button {
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
            gap: 0.5rem;
          }
          .emp-list-submit-button:hover, .emp-list-download-button:hover {
            background: linear-gradient(90deg, #1d4ed8, #2563eb);
          }
          .emp-list-submit-button:disabled, .emp-list-download-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            background: linear-gradient(90deg, #4b5e8e, #6b7280);
          }
          .emp-list-download-icon {
            width: 1.125rem;
            height: 1.125rem;
          }
          .emp-list-loading {
            text-align: center;
            font-size: 0.875rem;
            color: #cbd5e1;
            padding: 1.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
          }
          .emp-list-spinner {
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
          .emp-list-table-container {
            width: 100%;
            max-width: 800px;
            margin: 2rem auto;
            overflow-x: auto;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4), 0 0 8px rgba(96, 165, 250, 0.3);
            background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%);
            box-sizing: border-box;
            padding-bottom: 0.5rem;
          }
          .emp-list-table {
            width: 100%;
            min-width: 600px;
            border-collapse: separate;
            border-spacing: 0;
          }
          .emp-list-table-head {
            background: linear-gradient(90deg, #1e40af 0%, #2563eb 100%);
            color: #f1f5f9;
            position: sticky;
            top: 0;
            z-index: 10;
          }
          .emp-list-table-head th {
            padding: 1rem;
            text-align: left;
            font-weight: 600;
            font-size: 0.875rem;
            letter-spacing: 0.02em;
            border-bottom: 1px solid #334155;
            white-space: normal;
          }
          .emp-list-table-head th:first-child {
            border-top-left-radius: 12px;
          }
          .emp-list-table-head th:last-child {
            border-top-right-radius: 12px;
          }
          .emp-list-table-row {
            border-bottom: 1px solid #334155;
          }
          .emp-list-table-row:nth-child(even) {
            background: #1e293b;
          }
          .emp-list-table-row:hover {
            background: #334155;
          }
          .emp-list-table-row:last-child {
            border-bottom: none;
          }
          .emp-list-table-cell {
            padding: 1rem;
            font-size: 0.875rem;
            color: #f1f5f9;
            white-space: nowrap;
            word-break: break-word;
          }
          .emp-list-action-buttons {
            display: flex;
            gap: 0.5rem;
          }
          .emp-list-edit-button, .emp-list-delete-button {
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 6px;
            font-size: 0.8125rem;
            font-weight: 600;
            color: #f1f5f9;
            cursor: pointer;
          }
          .emp-list-edit-button {
            background: linear-gradient(90deg, #d97706, #f59e0b);
          }
          .emp-list-edit-button:hover {
            background: linear-gradient(90deg, #b45309, #d97706);
          }
          .emp-list-delete-button {
            background: linear-gradient(90deg, #dc2626, #ef4444);
          }
          .emp-list-delete-button:hover {
            background: linear-gradient(90deg, #b91c1c, #dc2626);
          }
          .emp-list-edit-button:disabled, .emp-list-delete-button:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
          .emp-list-no-data {
            text-align: center;
            padding: 1.5rem;
            font-size: 0.875rem;
            color: #64748b;
          }
          @media (max-width: 768px) {
            .emp-list-container {
              padding: 3rem 0.5rem;
              overflow-x: visible;
            }
            .emp-list-title {
              font-size: 1.75rem;
              padding: 0.25rem;
            }
            .emp-list-form-card {
              padding: 1rem;
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              max-width: 100%;
            }
            .emp-list-form-grid {
              grid-template-columns: 1fr;
            }
            .emp-list-button-group {
              flex-direction: column;
              gap: 0.5rem;
            }
            .emp-list-submit-button, .emp-list-download-button {
              font-size: 0.8125rem;
            }
            .emp-list-table-container {
              border-radius: 8px;
              box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
              max-width: 100%;
              margin: 1rem auto;
            }
            .emp-list-table {
              min-width: 400px;
            }
            .emp-list-table-head th, .emp-list-table-cell {
              padding: 0.5rem;
              font-size: 0.75rem;
              white-space: normal;
            }
            .emp-list-table-head th:nth-child(3), .emp-list-table-cell:nth-child(3) {
              display: none; /* Hide Department */
            }
            .emp-list-edit-button, .emp-list-delete-button {
              padding: 0.5rem;
              font-size: 0.75rem;
            }
            .emp-list-loading, .emp-list-no-data {
              padding: 1rem;
              font-size: 0.8125rem;
            }
          }
        `}
      </style>
      <div className="emp-list-container">
        <h2 className="emp-list-title">
          <Users className="emp-list-users-icon" />
          Employees
        </h2>
        <form onSubmit={handleSubmit} className="emp-list-form-card">
          <div className="emp-list-form-grid">
            <div className="emp-list-form-group">
              <label className="emp-list-label" htmlFor="name">
                Name
              </label>
              <input
                type="text"
                id="name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="emp-list-input"
                placeholder="Enter name"
                disabled={loading}
              />
            </div>
            <div className="emp-list-form-group">
              <label className="emp-list-label" htmlFor="punchCardId">
                Punch Card ID
              </label>
              <input
                type="text"
                id="punchCardId"
                value={form.punchCardId}
                onChange={(e) =>
                  setForm({ ...form, punchCardId: e.target.value })
                }
                className="emp-list-input"
                placeholder="Enter punch card ID"
                disabled={loading}
              />
            </div>
            <div className="emp-list-form-group">
              <label className="emp-list-label" htmlFor="department">
                Department
              </label>
              <input
                type="text"
                id="department"
                value={form.department}
                onChange={(e) =>
                  setForm({ ...form, department: e.target.value })
                }
                className="emp-list-input"
                placeholder="Enter department (optional)"
                disabled={loading}
              />
            </div>
          </div>
          <div className="emp-list-button-group">
            <button
              type="submit"
              className="emp-list-submit-button"
              disabled={loading}
            >
              {form.id ? "Update Employee" : "Add Employee"}
            </button>
            <button
              onClick={downloadCSV}
              className="emp-list-download-button"
              disabled={loading || employees.length === 0}
            >
              <Download className="emp-list-download-icon" />
              Download Employees
            </button>
          </div>
        </form>
        {loading ? (
          <div className="emp-list-loading">
            <div className="emp-list-spinner"></div>
            Loading...
          </div>
        ) : employees.length === 0 ? (
          <p className="emp-list-no-data">No employees found</p>
        ) : (
          <div className="emp-list-table-container">
            <table className="emp-list-table">
              <thead className="emp-list-table-head">
                <tr>
                  <th>Name</th>
                  <th>Punch Card ID</th>
                  <th>Department</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp) => (
                  <tr key={emp.id} className="emp-list-table-row">
                    <td className="emp-list-table-cell">{emp.name}</td>
                    <td className="emp-list-table-cell">{emp.punchCardId}</td>
                    <td className="emp-list-table-cell">
                      {emp.department || "N/A"}
                    </td>
                    <td className="emp-list-table-cell">
                      <div className="emp-list-action-buttons">
                        <button
                          onClick={() => handleEdit(emp)}
                          className="emp-list-edit-button"
                          disabled={loading}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(emp.id)}
                          className="emp-list-delete-button"
                          disabled={loading}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
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

export default EmployeeList;
