import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (
    token &&
    !config.url.includes("/api/attendance/record") &&
    !config.url.includes("/api/attendance/last")
  ) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = (data) => api.post("/api/auth/login", data);
export const register = (data) => api.post("/api/auth/register", data);
export const createEmployee = (data) => api.post("/api/employees", data);
export const getEmployees = () => api.get("/api/employees");
export const updateEmployee = (id, data) =>
  api.put(`/api/employees/${id}`, data);
export const deleteEmployee = (id) => api.delete(`/api/employees/${id}`);
export const recordAttendance = (data) =>
  api.post("/api/attendance/record", data);
export const getLastAttendance = (punchCardId) =>
  api.get(`/api/attendance/last?punchCardId=${punchCardId}`);
export const getAttendance = () => api.get("/api/attendance");
export const getEmployeeAttendance = (punchCardId, startDate, endDate) => {
  let url = `/api/attendance/employee?punchCardId=${punchCardId}`;
  if (startDate && endDate) {
    const formattedStart = new Date(startDate).toISOString().split("T")[0];
    const formattedEnd = new Date(endDate).toISOString().split("T")[0];
    url += `&startDate=${formattedStart}&endDate=${formattedEnd}`;
  }
  return api.get(url);
};
export const getSummary = (month, year) =>
  api.get(`/api/attendance/summary?month=${month}&year=${year}`);
export const exportSummary = (month, year) =>
  api.get(`/api/attendance/export?month=${month}&year=${year}`, {
    responseType: "blob",
  });
export const recordServerRoomAction = (data) =>
  api.post("/api/server-room-actions", data);
export const getServerRoomActions = () => api.get("/api/server-room-actions");
export const exportServerRoomActions = () =>
  api.get("/api/server-room-actions/export", { responseType: "blob" });

export default api;
