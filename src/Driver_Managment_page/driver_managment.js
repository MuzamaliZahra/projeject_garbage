import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./driver_managment.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";

function ManageDrivers() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [editData, setEditData] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const getDriverId = (driver) => {
    if (!driver) return null;
    return driver.driver_ID || driver.driver_id || driver.id || null;
  };
  // Fetch  drivers
  const fetchDrivers = () => {
    setLoading(true);
    axios.get("http://localhost:5000/get-drivers")
      .then(res => {
        console.log("Drivers from DB:", res.data); 
        setDrivers(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load drivers.");
        setLoading(false);
      });  };
  useEffect(() => {
    fetchDrivers();
  }, []);
  // Filter drivers 
  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(search.toLowerCase()) ||
    d.email.toLowerCase().includes(search.toLowerCase()) ||
    (getDriverId(d) || "").toString().toLowerCase().includes(search.toLowerCase()) ||
    d.license_no.toLowerCase().includes(search.toLowerCase())
  );
  // Open edit modal
  const openEdit = (driver) => {
    console.log("Opening edit for driver:", driver);
    console.log("Driver ID:", getDriverId(driver));  
    setSelectedDriver(driver);
    setEditData({
      name: driver.name,
      email: driver.email,
      phone_no: driver.phone_no,
      license_no: driver.license_no
    });
    setShowModal(true);
    setError("");
    setSuccess("");
  };
  // Handle edit input change
  const handleEditChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };
  // Submit edit
  const handleUpdate = () => {
    const driverID = getDriverId(selectedDriver);
    console.log("Updating driver ID:", driverID); 

    if (!editData.name || !editData.email || !editData.phone_no || !editData.license_no) {
      setError("All fields are required.");
      return;
    }
    if (!driverID) {
      setError("Driver ID is missing. Please close and try again.");
      return;
    }
    if (editData.phone_no.length < 10) {
      setError("Phone number must be at least 10 digits.");
      return;
    }

    axios.put(`http://localhost:5000/update-driver/${driverID}`, editData)
      .then(() => {
        setSuccess(`Driver "${editData.name}" updated successfully!`);
        setShowModal(false);
        fetchDrivers();
      })
      .catch(err => {
        setError(err.response?.data || "Error updating driver.");
      });
  };
  // Open delete confirm 
  const openDelete = (driver) => {
    setDeleteTarget(driver);
    setShowDeleteModal(true);
  };
  // Confirm delete
  const handleDelete = () => {
    const driverID = getDriverId(deleteTarget);
    axios.delete(`http://localhost:5000/delete-driver/${driverID}`)
      .then(() => {
        setSuccess(`Driver "${deleteTarget.name}" deleted successfully!`);
        setShowDeleteModal(false);
        fetchDrivers();
      })
      .catch(() => {
        setError("Error deleting driver.");
        setShowDeleteModal(false);
      });
  };
  const getInitials = (name) => {
    if (!name) return "DR";
    const parts = name.trim().split(" ");
    if (parts.length >= 2 && parts[1].length > 0)
      return parts[0][0].toUpperCase() + parts[1][0].toUpperCase();
    return name.trim()[0].toUpperCase();
  };

  return (
    <div className="md-page">

       <AdminNavBar/>

      <div className="body">

        {/* Page Title */}
        <div className="page_header">
          <div>
            <h2>Manage Drivers</h2>
            <p>View, edit and delete registered garbage collectors</p>
          </div>
          <button className="add_btn" onClick={() => navigate("/add_driver")}>
            + Add New Driver
          </button>
        </div>

        {/* Stats Row */}
        <div className="status_row">
          <div className="status_card green">
            <div className="status_num">{drivers.length}</div>
            <div className="status_label">Total Drivers</div>
          </div>
          <div className="status_card orange">
            <div className="status_num">{filteredDrivers.length}</div>
            <div className="status_label">Search Results</div>
          </div>
          <div className="status_card blue">
            <i className="bi bi-truck"></i>
            <div className="status_label">Active Fleet</div>
          </div>
        </div>

        
        
        {/* Search Bar */}
        <div className="search_bar">
          <span className="search_icon">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            placeholder="Search by name, email, ID or license..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear_btn" onClick={() => setSearch("")}>
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>

        {/* Drivers Table */}
        <div className="md-card">
          {loading ? (
            <div className="md-loading">Loading drivers...</div>
          ) : filteredDrivers.length === 0 ? (
            <div className="md-empty">
              <div className="md-empty-icon">
                <i className="bi bi-truck"></i>
              </div>
              <p>No drivers found</p>
              <span>Try a different search or add a new driver</span>
            </div>
          ) : (
            <table className="md-table">
              <thead>
                <tr>
                  <th>Driver</th>
                  <th>Driver ID</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>License No</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDrivers.map((driver) => (
                  <tr key={getDriverId(driver)}>
                    <td>
                      <div className="md-driver-cell">
                        <div className="md-avatar">{getInitials(driver.name)}</div>
                        <span>{driver.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="md-id-badge">{getDriverId(driver)}</span>
                    </td>
                    <td>{driver.email}</td>
                    <td>{driver.phone_no}</td>
                    <td>{driver.license_no}</td>
                    <td>
                      <div className="md-action-btns">
                        <button
                          className="md-btn-edit"
                          onClick={() => openEdit(driver)}
                        >
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                        <button
                          className="md-btn-delete"
                          onClick={() => openDelete(driver)}
                        >
                          <i className="bi bi-trash"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Total count */}
        {!loading && filteredDrivers.length > 0 && (
          <div className="md-count">
            Showing {filteredDrivers.length} of {drivers.length} drivers
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {showModal && (
        <div className="md-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="md-modal" onClick={(e) => e.stopPropagation()}>

            <div className="md-modal-header">
              <h3>Edit Driver</h3>
              <button className="md-modal-close" onClick={() => setShowModal(false)}> <i className="bi bi-x-lg"></i></button>
            </div>

            <div className="md-modal-avatar">
              <div className="md-avatar large">{getInitials(editData.name)}</div>
              <span>ID: {getDriverId(selectedDriver)}</span>
            </div>

            {error && (
              <div className="md-alert md-alert-error">
                <i className="bi bi-exclamation-triangle-fill"></i> {error}
              </div>
            )}

            <div className="md-modal-body">
              <div className="md-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                />
              </div>
              <div className="md-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                />
              </div>
              <div className="md-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone_no"
                  value={editData.phone_no}
                  onChange={handleEditChange}
                />
              </div>
              <div className="md-form-group">
                <label>License Number</label>
                <input
                  type="text"
                  name="license_no"
                  value={editData.license_no}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div className="md-modal-footer">
              <button className="md-btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="md-btn-save" onClick={handleUpdate}>
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteModal && (
        <div className="md-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="md-modal md-modal-sm" onClick={(e) => e.stopPropagation()}>

            <div className="md-modal-header">
              <h3>Delete Driver</h3>
              <button className="md-modal-close" onClick={() => setShowDeleteModal(false)}>
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="md-delete-body">
              <div className="md-delete-icon">
                <i className="bi bi-trash3-fill"></i>
              </div>
              <p>Are you sure you want to delete</p>
              <strong>"{deleteTarget?.name}"</strong>
              <span>This action cannot be undone.</span>
            </div>

            <div className="md-modal-footer">
              <button className="md-btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="md-btn-confirm-delete" onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ManageDrivers;

