import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import PunchCardEntry from "./components/PunchCardEntry";
import Login from "./components/Login";
import Dashboard from "./components/Dashboard";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./index.css";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PunchCardEntry />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin/*" element={<Dashboard />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;
