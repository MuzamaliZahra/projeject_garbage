import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./add_route.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";

function AddRoute() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    route_ID: "",
    route_name: "",
    start_location: "",
    end_location: "",
    duration_hours: "",
    duration_minutes: "",
    area_name: "",
    driver_ID: "",
    truck_ID: ""
  });

  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [driverFieldMode, setDriverFieldMode] = useState("none");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get("http://localhost:5000/get-drivers")
      .then(res => setDrivers(res.data))
      .catch(() => setError("Failed to load drivers."));

    axios.get("http://localhost:5000/get-trucks")
      .then(res => {
        setTrucks(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load trucks.");
        setLoading(false);
      });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setError("");
    setSuccess("");

    if (name === "truck_ID") {
      setFormData(prev => ({ ...prev, truck_ID: value, driver_ID: "" }));
      setAssignedDriver(null);
      setDriverFieldMode("none");

      if (!value) return;

      const selectedTruck = trucks.find(t => t.truck_ID == value);

      if (selectedTruck && selectedTruck.driver_id) {
        const driver = drivers.find(d =>
          (d.driver_ID || d.driver_id) == selectedTruck.driver_id
        );
        setAssignedDriver(driver || null);
        setDriverFieldMode("auto");
        setFormData(prev => ({
          ...prev,
          truck_ID: value,
          driver_ID: selectedTruck.driver_id
        }));
      } else {
        axios.get(`http://localhost:5000/get-available-drivers/${value}`)
          .then(res => {
            setAvailableDrivers(res.data);
            setDriverFieldMode("select");
          })
          .catch(() => setError("Failed to load available drivers."));

        setFormData(prev => ({ ...prev, truck_ID: value, driver_ID: "" }));
      }
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const hours = parseInt(formData.duration_hours) || 0;
    const minutes = parseInt(formData.duration_minutes) || 0;

    if (hours === 0 && minutes === 0) {
      setError("Please enter a valid estimated duration.");
      return;
    }

    if (minutes > 59) {
      setError("Minutes cannot exceed 59.");
      return;
    }

    if (!formData.route_ID || !formData.route_name || !formData.start_location ||
        !formData.end_location || !formData.area_name || !formData.driver_ID || !formData.truck_ID) {
      setError("All fields are required.");
      return;
    }

    // Combine hours and minutes into a single string
    let estimated_duration = "";
    if (hours > 0 && minutes > 0) estimated_duration = `${hours}h ${minutes}m`;
    else if (hours > 0) estimated_duration = `${hours}h`;
    else estimated_duration = `${minutes}m`;

    const payload = {
      route_ID: formData.route_ID,
      route_name: formData.route_name,
      start_location: formData.start_location,
      end_location: formData.end_location,
      estimated_duration,
      area_name: formData.area_name,
      driver_ID: formData.driver_ID,
      truck_ID: formData.truck_ID
    };

    axios.post("http://localhost:5000/add-route", payload)
      .then(() => {
        setSuccess(`Route "${formData.route_name}" added successfully!`);
        setFormData({
          route_ID: "", route_name: "", start_location: "",
          end_location: "", duration_hours: "", duration_minutes: "",
          area_name: "", driver_ID: "", truck_ID: ""
        });
        setAssignedDriver(null);
        setDriverFieldMode("none");
      })
      .catch(err => {
        setError(err.response?.data || "Server error. Please try again.");
      });
  };

  return (
    <div className="ar-page">

       <AdminNavBar/>
      <div className="ar-body">

        {/* Page Title */}
        <div className="ar-page-title">
          <h2>Add New Route</h2>
          <p>Assign a collection route with driver and truck</p>
        </div>

        {/* Stats Row */}
        <div className="status_row">
          <div className="status_card green">
            <div className="status_num">📍</div>
            <div className="status_label">New Route</div>
          </div>
          <div className="status_card orange">
            <div className="status_num">{drivers.length}</div>
            <div className="status_label">Total Drivers</div>
          </div>
          <div className="status_card blue">
            <div className="status_num">{trucks.length}</div>
            <div className="status_label">Total Trucks</div>
          </div>
        </div>

        {/* Form Card */}
        <div className="ar-card">

          <div className="ar-card-icon-wrap">
            <div className="ar-card-icon">📍</div>
            <div className="ar-card-label">Route Registration</div>
          </div>

          {error && <div className="ar-alert ar-alert-error">⚠ {error}</div>}
          {success && <div className="ar-alert ar-alert-success">✓ {success}</div>}

          <form onSubmit={handleSubmit}>

            {/* Row 1 — Route ID & Name */}
            <div className="ar-form-row">
              <div className="ar-form-group">
                <label>Route ID</label>
                <input
                  type="text"
                  name="route_ID"
                  placeholder="e.g. R001"
                  value={formData.route_ID}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="ar-form-group">
                <label>Route Name</label>
                <input
                  type="text"
                  name="route_name"
                  placeholder="e.g. Colombo North Route"
                  value={formData.route_name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 2 — Start & End Location */}
            <div className="ar-form-row">
              <div className="ar-form-group">
                <label>Start Location</label>
                <input
                  type="text"
                  name="start_location"
                  placeholder="e.g. Colombo 01"
                  value={formData.start_location}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="ar-form-group">
                <label>End Location</label>
                <input
                  type="text"
                  name="end_location"
                  placeholder="e.g. Colombo 05"
                  value={formData.end_location}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Row 3 — Area & Duration */}
            <div className="ar-form-row">
              <div className="ar-form-group">
                <label>Area Name</label>
                <input
                  type="text"
                  name="area_name"
                  placeholder="e.g. Colombo Central"
                  value={formData.area_name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="ar-form-group">
                <label>Estimated Duration</label>
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
                    <input
                      type="number"
                      name="duration_hours"
                      placeholder="0"
                      min="0"
                      max="23"
                      value={formData.duration_hours}
                      onChange={handleChange}
                      style={{ width: "100%" }}
                    />
                    <span style={{ whiteSpace: "nowrap", color: "#555", fontWeight: "500" }}>hrs</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", flex: 1 }}>
                    <input
                      type="number"
                      name="duration_minutes"
                      placeholder="0"
                      min="0"
                      max="59"
                      value={formData.duration_minutes}
                      onChange={handleChange}
                      style={{ width: "100%" }}
                    />
                    <span style={{ whiteSpace: "nowrap", color: "#555", fontWeight: "500" }}>min</span>
                  </div>
                </div>

                {/* Live preview */}
                {(formData.duration_hours || formData.duration_minutes) && (
                  <div style={{ marginTop: "6px", fontSize: "13px", color: "#27ae60", fontWeight: "500" }}>
                    ⏱ Duration: {(() => {
                      const h = parseInt(formData.duration_hours) || 0;
                      const m = parseInt(formData.duration_minutes) || 0;
                      if (h > 0 && m > 0) return `${h} hour${h > 1 ? "s" : ""} ${m} minute${m > 1 ? "s" : ""}`;
                      if (h > 0) return `${h} hour${h > 1 ? "s" : ""}`;
                      return `${m} minute${m > 1 ? "s" : ""}`;
                    })()}
                  </div>
                )}
              </div>
            </div>

            {/* Truck Selection */}
            <div className="ar-form-group">
              <label>Select Truck</label>
              {loading ? (
                <div className="ar-loading-select">Loading trucks...</div>
              ) : trucks.length === 0 ? (
                <div className="ar-no-data">⚠ No trucks available.</div>
              ) : (
                <select
                  name="truck_ID"
                  value={formData.truck_ID}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select a Truck --</option>
                  {trucks.map(truck => {
                    const count = truck.route_count || 0;
                    const isFull = count >= 3;
                    return (
                      <option
                        key={truck.truck_ID}
                        value={truck.truck_ID}
                        disabled={isFull}
                        style={{ color: isFull ? "#aaa" : "inherit" }}
                      >
                        🚛 {truck.vehicle_number} — ID: {truck.truck_ID}
                        {truck.driver_id ? " ✓ Driver assigned" : " ⚠ No driver"}
                        {" "}| Routes: {count}/3
                        {isFull ? " 🚫 FULL" : ""}
                      </option>
                    );
                  })}
                </select>
              )}
            </div>

            {/* Driver Field */}
            {driverFieldMode === "none" && (
              <div className="ar-form-group">
                <label>Assigned Driver</label>
                <div className="ar-driver-placeholder">
                  👆 Please select a truck first
                </div>
              </div>
            )}

            {/* AUTO mode — truck already has a driver */}
            {driverFieldMode === "auto" && assignedDriver && (
              <div className="ar-form-group">
                <label>Assigned Driver</label>
                <div className="ar-auto-driver">
                  <div className="ar-auto-driver-avatar">
                    {assignedDriver.name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="ar-auto-driver-info">
                    <div className="ar-auto-driver-name">{assignedDriver.name}</div>
                    <div className="ar-auto-driver-sub">
                      ID: {assignedDriver.driver_ID || assignedDriver.driver_id}
                      &nbsp;·&nbsp;{assignedDriver.phone_no}
                    </div>
                    <div className="ar-auto-driver-tag">✓ Auto-filled from truck assignment</div>
                  </div>
                </div>
              </div>
            )}

            {/* SELECT mode — truck has no driver */}
            {driverFieldMode === "select" && (
              <div className="ar-form-group">
                <label>Assign Driver
                  <span className="ar-label-note"> — This truck has no assigned driver</span>
                </label>
                {availableDrivers.length === 0 ? (
                  <div className="ar-no-data">
                    ⚠ No available drivers. All drivers are already assigned.
                  </div>
                ) : (
                  <select
                    name="driver_ID"
                    value={formData.driver_ID}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select an Available Driver --</option>
                    {availableDrivers.map(driver => (
                      <option
                        key={driver.driver_ID || driver.driver_id}
                        value={driver.driver_ID || driver.driver_id}
                      >
                        👤 {driver.name} — ID: {driver.driver_ID || driver.driver_id}
                        — {driver.phone_no}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Preview Card */}
            {formData.truck_ID && (() => {
              const selectedTruck = trucks.find(t => t.truck_ID == formData.truck_ID);
              const routeCount = selectedTruck?.route_count || 0;
              const remaining = 3 - routeCount;

              return (
                <div>
                  <div className="ar-preview-row">
                    <div className="ar-preview-card truck">
                      <span className="ar-preview-icon">🚛</span>
                      <div>
                        <div className="ar-preview-title">
                          {selectedTruck?.vehicle_number}
                        </div>
                        <div className="ar-preview-sub">Truck ID: {formData.truck_ID}</div>
                        <div className="ar-preview-sub">
                          Routes: {routeCount}/3
                          {remaining === 1 && (
                            <span style={{ color: "#e67e22", fontWeight: "bold" }}> ⚠ Last slot!</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {formData.driver_ID && (
                      <div className="ar-preview-card driver">
                        <span className="ar-preview-icon">👤</span>
                        <div>
                          <div className="ar-preview-title">
                            {drivers.find(d =>
                              (d.driver_ID || d.driver_id) == formData.driver_ID
                            )?.name}
                          </div>
                          <div className="ar-preview-sub">Driver ID: {formData.driver_ID}</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {routeCount >= 3 && (
                    <div className="ar-alert ar-alert-error" style={{ marginTop: "8px" }}>
                      🚫 This truck has reached the maximum of 3 routes and cannot be assigned again.
                    </div>
                  )}
                </div>
              );
            })()}

            <div className="ar-btn-row">
              <button type="button" className="ar-btn-cancel" onClick={() => navigate(-1)}>
                
                Cancel
              </button>
              <button type="submit" className="ar-btn-submit">
                📍 Add Route
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddRoute;