import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../utils/api";
import { Users, Download } from "lucide-react";
import "../styles/EmployeeList.css"; // Assuming you have a CSS file for styling
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
