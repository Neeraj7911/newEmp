import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PunchCardEntry from "./components/PunchCardEntry";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";
import ServerRoomActions from "./components/ServerRoomActions";
import ServerRoomActionLog from "./components/ServerRoomActionLog";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PunchCardEntry />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<Dashboard />} />
        <Route path="/server-room-actions" element={<ServerRoomActions />} />
        <Route
          path="/admin/server-room-action-log"
          element={<ServerRoomActionLog />}
        />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
