import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { recordServerRoomAction } from "../utils/api";
import "../styles/ServerRoomActions.css";

const serverRoomElements = [
  {
    name: "Server Rack",
    components: ["CPU", "RAM", "Storage", "Power Supply", "Cooling Fan"],
  },
  {
    name: "ISP",
    components: ["Router", "Modem", "Switch", "Firewall", "Cables"],
  },
  {
    name: "Rack1",
    components: [
      "Server Blade",
      "Network Card",
      "UPS",
      "Patch Panel",
      "Monitor",
    ],
  },
  {
    name: "Rack2",
    components: ["GPU", "Motherboard", "SSD", "PSU", "Ventilation Unit"],
  },
];

function ServerRoomActions() {
  const navigate = useNavigate();
  const location = useLocation();
  const [punchCardId, setPunchCardId] = useState(
    location.state?.punchCardId || localStorage.getItem("punchCardId") || ""
  );
  const [selectedElement, setSelectedElement] = useState("");
  const [selectedComponent, setSelectedComponent] = useState("");
  const [action, setAction] = useState("");

  useEffect(() => {
    if (!punchCardId) {
      toast.error("No punch card ID found. Please enter your punch card ID.");
      navigate("/");
    }
  }, [punchCardId, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedElement || !selectedComponent || !action) {
      toast.error("Please fill all fields");
      return;
    }
    if (!punchCardId) {
      toast.error("Invalid punch card ID");
      navigate("/");
      return;
    }

    const payload = {
      punchCardId,
      component: `${selectedElement} - ${selectedComponent}`,
      action,
    };
    console.log("Sending payload to POST /api/server-room-actions:", payload);

    try {
      await recordServerRoomAction(payload);
      toast.success("Action recorded");
      setSelectedElement("");
      setSelectedComponent("");
      setAction("");
    } catch (error) {
      console.error("Error recording action:", error);
      toast.error(error.response?.data?.error || "Failed to record action");
    }
  };

  const handleDone = () => {
    localStorage.removeItem("punchCardId");
    setPunchCardId("");
    navigate("/");
  };

  return (
    <div className="server-room-container">
      <div className="server-room-card">
        <h2 className="server-room-title">Server Room Actions</h2>
        <form onSubmit={handleSubmit} className="server-room-form">
          <div className="form-group">
            <label htmlFor="element">Server Room Element</label>
            <select
              id="element"
              value={selectedElement}
              onChange={(e) => {
                setSelectedElement(e.target.value);
                setSelectedComponent("");
              }}
              className="server-room-select"
            >
              <option value="">Select Element</option>
              {serverRoomElements.map((element) => (
                <option key={element.name} value={element.name}>
                  {element.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="component">Component</label>
            <select
              id="component"
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="server-room-select"
              disabled={!selectedElement}
            >
              <option value="">Select Component</option>
              {selectedElement &&
                serverRoomElements
                  .find((el) => el.name === selectedElement)
                  ?.components.map((comp) => (
                    <option key={comp} value={comp}>
                      {comp}
                    </option>
                  ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="action">Action</label>
            <input
              id="action"
              type="text"
              value={action}
              onChange={(e) => setAction(e.target.value)}
              placeholder="Enter action (e.g., Replaced, Inspected)"
              className="server-room-input"
            />
          </div>
          <div className="form-buttons">
            <button type="submit" className="server-room-submit">
              Record Action
            </button>
            <button
              type="button"
              onClick={handleDone}
              className="server-room-done"
            >
              Done
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ServerRoomActions;
