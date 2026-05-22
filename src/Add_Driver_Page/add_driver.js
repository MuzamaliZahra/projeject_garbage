import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./add_driver.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";


function AddDriver() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    driver_ID: "",
    name: "",
    email: "",
    phone_no: "",
    license_no: "",
    password: ""
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
    setSuccess("");
  };

  const getInitials = () => {
    const parts = formData.name.trim().split(" ");
    if (parts.length >= 2 && parts[1].length > 0)
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    if (formData.name.trim().length > 0)
      return formData.name.trim()[0].toUpperCase();
    return "DR";
  };

  const handleSubmit = (e) => {
  e.preventDefault();

  if (!formData.driver_ID || !formData.name || !formData.email || !formData.phone_no ||
      !formData.license_no || !formData.password) {
    setError("All fields are required.");
    return;
  }

  //
  if (formData.driver_ID.toString().trim() === "") {
    setError("Driver ID cannot be empty.");
    return;
  }

  if (formData.phone_no.length < 10) {
    setError("Phone number must be at least 10 digits.");
    return;
  }

  if (formData.password.length < 6) {
    setError("Password must be at least 6 characters.");
    return;
  }

  axios.post("http://localhost:5000/add-driver", formData)
    .then(() => {
      setSuccess(`Driver "${formData.name}" added successfully!`);
      setFormData({ driver_ID: "", name: "", email: "", phone_no: "", license_no: "", password: "" });
    })
    .catch(err => {
      setError(err.response?.data || "Server error. Please try again.");
    });
};
  return (
    <div className="ad-page">

      <AdminNavBar/>

      <div className="ad-body">

        {/* Page Title */}
        <div className="ad-page-title">
          <h2>Add New Driver</h2>
          <p>Register a new garbage collector to the system</p>
        </div>

        {/* Stats Row */}
        <div className="status_row">
          <div className="status_card green">
            <div className="status_num">🚛</div>
            <div className="status_label">New Driver</div>
          </div>
          <div className="status_card orange">
            <div className="status_num">📋</div>
            <div className="status_label">Fill All Details</div>
          </div>
          <div className="status_card blue">
            <div className="status_num">✅</div>
            <div className="status_label">Save to System</div>
          </div>
        </div>

        {/* Form Card */}
        <div className="ad-card">

          {/* Avatar */}
          <div className="ad-avatar-wrap">
            <div className="ad-avatar">{getInitials()}</div>
            <div className="ad-avatar-label">Driver Profile</div>
          </div>

          {error && <div className="ad-alert ad-alert-error">⚠ {error}</div>}
          {success && <div className="ad-alert ad-alert-success">✓ {success}</div>}

          <form onSubmit={handleSubmit}>

            <div className="ad-form-row">

             <div className="ad-form-group">
                <label>Driver Id</label>
                <input
                  type="text"
                  name="driver_ID"
                  placeholder="D000"
                  value={formData.driver_ID}
                  onChange={handleChange}
                  required
                />
              </div>



              <div className="ad-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g. Kamal Perera"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="ad-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="driver@cleanland.lk"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="ad-form-row">
              <div className="ad-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone_no"
                  placeholder="07XXXXXXXX"
                  value={formData.phone_no}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="ad-form-group">
                <label>License Number</label>
                <input
                  type="text"
                  name="license_no"
                  placeholder="e.g. B1234567"
                  value={formData.license_no}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="ad-form-group">
              <label>Password</label>
              <input
                type="password"
                name="password"
                placeholder="Min. 6 characters"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ad-btn-row">
              <button type="button" className="ad-btn-cancel"
                onClick={() => navigate(-1)}>
                Cancel
              </button>
              <button type="submit" className="ad-btn-submit">
                🚛 Add Driver
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}

export default AddDriver;