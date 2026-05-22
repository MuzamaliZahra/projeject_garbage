import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./add_truck.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";

function AddTruck() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    truck_ID: "",
    vehicle_number: "",
    driver_id: ""
  });

  const [availableDrivers, setAvailableDrivers] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loadingDrivers, setLoadingDrivers] = useState(true);

  const fetchAvailableDrivers = () => {
    axios.get("http://localhost:5000/get-unassigned-drivers")
      .then(res => {
        setAvailableDrivers(res.data);
        setLoadingDrivers(false);
      })
      .catch(() => {
        setError("Failed to load drivers.");
        setLoadingDrivers(false);
      });
  };

  useEffect(() => {
    fetchAvailableDrivers();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.truck_ID || !formData.vehicle_number || !formData.driver_id) {
      setError("All fields are required.");
      return;
    }

    axios.post("http://localhost:5000/add-truck", formData)
      .then(() => {
        setSuccess(`Truck "${formData.vehicle_number}" added successfully!`);
        setFormData({ truck_ID: "", vehicle_number: "", driver_id: "" });
        // Refresh available drivers so the assigned one disappears
        fetchAvailableDrivers();
      })
      .catch(err => {
        setError(err.response?.data || "Server error. Please try again.");
      });
  };

  return (
    <div className="at-page">

       <AdminNavBar/>
      <div className="at-body">

        {/* Page Title */}
        <div className="at-page-title">
          <h2>Add New Truck</h2>
          <p>Register a new garbage collection truck to the system</p>
        </div>

        {/* Stats Row */}
        <div className="status_row">
          <div className="status_card green">
            <div className="status_num">🚛</div>
            <div className="status_label">New Truck</div>
          </div>
          <div className="status_card orange">
            <div className="status_num">{availableDrivers.length}</div>
            <div className="status_label">Available Drivers</div>
          </div>
          <div className="status_card blue">
            <div className="status_num">✅</div>
            <div className="status_label">Save to System</div>
          </div>
        </div>

        {/* Form Card */}
        <div className="at-card">

          <div className="at-truck-icon-wrap">
            <div className="at-truck-icon">🚛</div>
            <div className="at-truck-label">Truck Registration</div>
          </div>

          {error && <div className="at-alert at-alert-error">⚠ {error}</div>}
          {success && <div className="at-alert at-alert-success">✓ {success}</div>}

          <form onSubmit={handleSubmit}>

            <div className="at-form-row">
              <div className="at-form-group">
                <label>Truck ID</label>
                <input
                  type="text"
                  name="truck_ID"
                  placeholder="e.g. T001"
                  value={formData.truck_ID}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="at-form-group">
                <label>Vehicle Number</label>
                <input
                  type="text"
                  name="vehicle_number"
                  placeholder="e.g. WP CAB 1234"
                  value={formData.vehicle_number}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="at-form-group">
              <label>Assign Driver</label>
              {loadingDrivers ? (
                <div className="at-loading-drivers">Loading available drivers...</div>
              ) : availableDrivers.length === 0 ? (
                <div className="at-no-drivers">
                  ⚠ No available drivers. All drivers are already assigned to trucks.
                </div>
              ) : (
                <select
                  name="driver_id"
                  value={formData.driver_id}
                  onChange={handleChange}
                  required
                >
                  <option value="">-- Select a Driver --</option>
                  {availableDrivers.map(driver => (
                    <option
                      key={driver.driver_ID || driver.driver_id}
                      value={driver.driver_ID || driver.driver_id}
                    >
                      {driver.name} — {driver.driver_ID || driver.driver_id} — {driver.phone_no}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Selected Driver Preview */}
            {formData.driver_id && (
              <div className="at-driver-preview">
                <div className="at-driver-preview-icon">👤</div>
                <div>
                  <div className="at-driver-preview-name">
                    {availableDrivers.find(d =>
                      (d.driver_ID || d.driver_id) == formData.driver_id
                    )?.name}
                  </div>
                  <div className="at-driver-preview-id">
                    Driver ID: {formData.driver_id}
                  </div>
                </div>
              </div>
            )}

            <div className="at-btn-row">
              <button
                type="button"
                className="at-btn-cancel"
                onClick={() => navigate(-1)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="at-btn-submit"
                disabled={availableDrivers.length === 0}
              >
                🚛 Add Truck
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddTruck;