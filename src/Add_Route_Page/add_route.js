import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./add_route.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";
import "bootstrap-icons/font/bootstrap-icons.css";

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

        setFormData(prev => ({
          ...prev,
          truck_ID: value,
          driver_ID: ""
        }));
      }

      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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

    if (
      !formData.route_ID ||
      !formData.route_name ||
      !formData.start_location ||
      !formData.end_location ||
      !formData.area_name ||
      !formData.driver_ID ||
      !formData.truck_ID
    ) {
      setError("All fields are required.");
      return;
    }

    let estimated_duration = "";

    if (hours > 0 && minutes > 0)
      estimated_duration = `${hours}h ${minutes}m`;
    else if (hours > 0)
      estimated_duration = `${hours}h`;
    else
      estimated_duration = `${minutes}m`;

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

        setAssignedDriver(null);
        setDriverFieldMode("none");
      })
      .catch(err => {
        setError(err.response?.data || "Server error. Please try again.");
      });
  };

  return (
    <div className="ar-page">
      <AdminNavBar />

      <div className="ar-body">

        {/* Page Title */}
        <div className="ar-page-title">
          <h2>Add New Route</h2>
          <p>Assign a collection route with driver and truck</p>
        </div>

        {/* Stats Row */}
        <div className="status_row">
          <div className="status_card green">
            <div className="status_num">
              <i className="bi bi-geo-alt-fill"></i>
            </div>
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
            <div className="ar-card-icon">
              <i className="bi bi-sign-turn-right-fill"></i>
            </div>
            <div className="ar-card-label">
              Route Registration
            </div>
          </div>

          {error && (
            <div className="ar-alert ar-alert-error">
              <i className="bi bi-exclamation-triangle-fill"></i> {error}
            </div>
          )}

          {success && (
            <div className="ar-alert ar-alert-success">
              <i className="bi bi-check-circle-fill"></i> {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* Row 1: Route ID & Route Name */}
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

            {/* Row 2: Start & End Location */}
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

            {/* Row 3: Area Name & Estimated Duration */}
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
                <div style={{ display: "flex", gap: "10px" }}>
                  <input
                    type="number"
                    name="duration_hours"
                    placeholder="Hours"
                    value={formData.duration_hours}
                    onChange={handleChange}
                  />
                  <input
                    type="number"
                    name="duration_minutes"
                    placeholder="Minutes"
                    value={formData.duration_minutes}
                    onChange={handleChange}
                  />
                </div>
                {(formData.duration_hours || formData.duration_minutes) && (
                  <div style={{ marginTop: "8px", color: "#27ae60" }}>
                    <i className="bi bi-clock-history"></i> Duration Preview
                  </div>
                )}
              </div>
            </div>

            {/* Row 4: Truck & Driver — sibling row, NOT nested */}
            <div className="ar-form-row">
              <div className="ar-form-group">
                <label>Truck</label>
                <select
                  name="truck_ID"
                  value={formData.truck_ID}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select Truck --</option>
                  {trucks.map(t => (
                    <option key={t.truck_ID} value={t.truck_ID}>
                      {t.truck_ID}
                    </option>
                  ))}
                </select>
              </div>

              <div className="ar-form-group">
                <label>Driver</label>

                {driverFieldMode === "auto" && assignedDriver && (
                  <input
                    type="text"
                    value={`${assignedDriver.driver_name || assignedDriver.name} (Auto-assigned)`}
                    readOnly
                    style={{ backgroundColor: "#f0f0f0" }}
                  />
                )}

                {driverFieldMode === "select" && (
                  <select
                    name="driver_ID"
                    value={formData.driver_ID}
                    onChange={handleChange}
                    required
                  >
                    <option value="">-- Select Driver --</option>
                    {availableDrivers.map(d => (
                      <option key={d.driver_ID || d.driver_id} value={d.driver_ID || d.driver_id}>
                        {d.driver_name || d.name}
                      </option>
                    ))}
                  </select>
                )}

                {driverFieldMode === "none" && (
                  <input
                    type="text"
                    placeholder="Select a truck first"
                    disabled
                  />
                )}
              </div>
            </div>

            {/* Buttons */}
            <div className="ar-btn-row">
              <button
                type="button"
                className="ar-btn-cancel"
                onClick={() => navigate(-1)}
              >
                 Cancel
              </button>

              <button
                type="submit"
                className="ar-btn-submit"
              >
                 Add Route
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddRoute;