import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./route_managment.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";

function ManageRoutes() {

  const navigate = useNavigate();

  const [routes, setRoutes] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trucks, setTrucks] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedRoute, setSelectedRoute] = useState(null);
  const [editData, setEditData] = useState({});
  const [driverFieldMode, setDriverFieldMode] = useState("none");
  const [assignedDriver, setAssignedDriver] = useState(null);
  const [availableDrivers, setAvailableDrivers] = useState([]);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  // ── Fetch all data ──
  const fetchRoutes = () => {
    setLoading(true);
    axios.get("http://localhost:5000/get-routes")
      .then(res => { setRoutes(res.data); setLoading(false); })
      .catch(() => { setError("Failed to load routes."); setLoading(false); });
  };

  useEffect(() => {
    fetchRoutes();
    axios.get("http://localhost:5000/get-drivers")
      .then(res => setDrivers(res.data))
      .catch(() => console.log("Failed to load drivers."));
    axios.get("http://localhost:5000/get-trucks")
      .then(res => setTrucks(res.data))
      .catch(() => console.log("Failed to load trucks."));
  }, []);

  // ── Filter ──
  const filteredRoutes = routes.filter(r =>
    (r.route_ID || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.route_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.area_name || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.start_location || "").toLowerCase().includes(search.toLowerCase()) ||
    (r.end_location || "").toLowerCase().includes(search.toLowerCase())
  );

  // ── Helpers ──
  const getDriverName = (driver_ID) => {
    const d = drivers.find(d => (d.driver_ID || d.driver_id) == driver_ID);
    return d ? d.name : driver_ID || "—";
  };

  const getTruckNumber = (truck_ID) => {
    const t = trucks.find(t => t.truck_ID == truck_ID);
    return t ? t.vehicle_number : truck_ID || "—";
  };

  // Parse "2h 30m" or "1h" or "45m" back into hours and minutes
  const parseDuration = (duration) => {
    if (!duration) return { hours: "", minutes: "" };
    let hours = "";
    let minutes = "";
    const hourMatch = duration.match(/(\d+)h/);
    const minMatch = duration.match(/(\d+)m/);
    if (hourMatch) hours = hourMatch[1];
    if (minMatch) minutes = minMatch[1];
    return { hours, minutes };
  };

  // Format hours + minutes into display string
  const formatDuration = (duration) => {
    if (!duration) return "—";
    return `⏱ ${duration}`;
  };

  // ── Open Edit Modal ──
  const openEdit = (route) => {
    setSelectedRoute(route);
    const { hours, minutes } = parseDuration(route.estimated_duration);
    setEditData({
      route_name: route.route_name,
      start_location: route.start_location,
      end_location: route.end_location,
      duration_hours: hours,
      duration_minutes: minutes,
      area_name: route.area_name,
      driver_ID: route.driver_ID,
      truck_ID: route.truck_ID
    });

    // Set driver field mode based on truck
    const truck = trucks.find(t => t.truck_ID == route.truck_ID);
    if (truck && truck.driver_id) {
      const driver = drivers.find(d =>
        (d.driver_ID || d.driver_id) == truck.driver_id
      );
      setAssignedDriver(driver || null);
      setDriverFieldMode("auto");
    } else {
      setDriverFieldMode("select");
      axios.get("http://localhost:5000/get-available-drivers")
        .then(res => setAvailableDrivers(res.data))
        .catch(() => console.log("Failed to load available drivers."));
    }

    setShowModal(true);
    setError("");
    setSuccess("");
  };

  // ── Handle Edit Change ──
  const handleEditChange = (e) => {
    const { name, value } = e.target;

    // When truck changes in edit modal
    if (name === "truck_ID") {
      setEditData(prev => ({ ...prev, truck_ID: value, driver_ID: "" }));
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
        setEditData(prev => ({ ...prev, truck_ID: value, driver_ID: selectedTruck.driver_id }));
      } else {
        setDriverFieldMode("select");
        axios.get("http://localhost:5000/get-available-drivers")
          .then(res => setAvailableDrivers(res.data))
          .catch(() => setError("Failed to load available drivers."));
      }
      return;
    }

    setEditData(prev => ({ ...prev, [name]: value }));
  };

  // ── Submit Update ──
  const handleUpdate = () => {
    const routeID = selectedRoute?.route_ID;

    const hours = parseInt(editData.duration_hours) || 0;
    const minutes = parseInt(editData.duration_minutes) || 0;

    if (hours === 0 && minutes === 0) {
      setError("Please enter a valid estimated duration.");
      return;
    }
    if (minutes > 59) {
      setError("Minutes cannot exceed 59.");
      return;
    }
    if (!editData.route_name || !editData.start_location || !editData.end_location ||
        !editData.area_name || !editData.driver_ID || !editData.truck_ID) {
      setError("All fields are required.");
      return;
    }

    // Format duration same way as AddRoute
    let estimated_duration = "";
    if (hours > 0 && minutes > 0) estimated_duration = `${hours}h ${minutes}m`;
    else if (hours > 0) estimated_duration = `${hours}h`;
    else estimated_duration = `${minutes}m`;

    const payload = {
      route_name: editData.route_name,
      start_location: editData.start_location,
      end_location: editData.end_location,
      estimated_duration,
      area_name: editData.area_name,
      driver_ID: editData.driver_ID,
      truck_ID: editData.truck_ID
    };

    axios.put(`http://localhost:5000/update-route/${routeID}`, payload)
      .then(() => {
        setSuccess(`Route "${editData.route_name}" updated successfully!`);
        setShowModal(false);
        fetchRoutes();
      })
      .catch(err => setError(err.response?.data || "Error updating route."));
  };

  // ── Delete ──
  const openDelete = (route) => {
    setDeleteTarget(route);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    const routeID = deleteTarget?.route_ID;
    if (!routeID) { setError("Route ID missing."); setShowDeleteModal(false); return; }

    axios.delete(`http://localhost:5000/delete-route/${routeID}`)
      .then(() => {
        setSuccess(`Route "${deleteTarget.route_name}" deleted successfully!`);
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchRoutes();
      })
      .catch(err => {
        setError(err.response?.data || "Error deleting route.");
        setShowDeleteModal(false);
      });
  };

  return (
    <div className="mgr-page">

      <AdminNavBar/>

      <div className="body">

        {/* Page Header */}
        <div className="page_header">
          <div>
            <h2>Manage Routes</h2>
            <p>View, edit and delete garbage collection routes</p>
          </div>
          <button className="add_btn" onClick={() => navigate("/add_route")}>
            + Add New Route
          </button>
        </div>

        {/* Stats */}
        <div className="status_row">
          <div className="status_card green">
            <div className="status_num">{routes.length}</div>
            <div className="status_label">Total Routes</div>
          </div>
          <div className="status_card orange">
            <div className="status_num">{filteredRoutes.length}</div>
            <div className="status_label">Search Results</div>
          </div>
          <div className="status_card blue">
            <div className="status_num">📍</div>
            <div className="status_label">Active Routes</div>
          </div>
        </div>

        {error && <div className="alert alert_error">⚠ {error}</div>}
        {success && <div className="alert alert_success">✓ {success}</div>}

        {/* Search */}
        <div className="search_bar">
          <span>🔍</span>
          <input
            type="text"
            placeholder="Search by route ID, name, area or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && <button className="clear_btn" onClick={() => setSearch("")}>✕</button>}
        </div>

        {/* Table */}
        <div className="mgr-card">
          {loading ? (
            <div className="mgr-loading">Loading routes...</div>
          ) : filteredRoutes.length === 0 ? (
            <div className="mgr-empty">
              <div className="mgr-empty-icon">📍</div>
              <p>No routes found</p>
              <span>Try a different search or add a new route</span>
            </div>
          ) : (
            <table className="mgr-table">
              <thead>
                <tr>
                  <th>Route ID</th>
                  <th>Route Name</th>
                  <th>Area</th>
                  <th>Start → End</th>
                  <th>Duration</th>
                  <th>Driver</th>
                  <th>Truck</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRoutes.map((route) => (
                  <tr key={route.route_ID}>
                    <td><span className="mgr-id-badge">{route.route_ID}</span></td>
                    <td><strong>{route.route_name}</strong></td>
                    <td>{route.area_name}</td>
                    <td>
                      <div className="mgr-location-cell">
                        <span className="mgr-location-start">{route.start_location}</span>
                        <span className="mgr-arrow">→</span>
                        <span className="mgr-location-end">{route.end_location}</span>
                      </div>
                    </td>
                    <td>
                      <span className="mgr-duration-badge">
                        {formatDuration(route.estimated_duration)}
                      </span>
                    </td>
                    <td>
                      <div className="mgr-driver-cell">
                        <div className="mgr-driver-avatar">
                          {getDriverName(route.driver_ID)?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <div className="mgr-driver-name">{getDriverName(route.driver_ID)}</div>
                          <div className="mgr-driver-id">ID: {route.driver_ID}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="mgr-truck-cell">
                        <span style={{fontSize:"20px"}}>🚛</span>
                        <div>
                          <div className="mgr-truck-num">{getTruckNumber(route.truck_ID)}</div>
                          <div className="mgr-truck-id">ID: {route.truck_ID}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="mgr-action-btns">
                        <button className="mgr-btn-edit" onClick={() => openEdit(route)}>
                          ✏ Edit
                        </button>
                        <button className="mgr-btn-delete" onClick={() => openDelete(route)}>
                          🗑 Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredRoutes.length > 0 && (
          <div className="mgr-count">
            Showing {filteredRoutes.length} of {routes.length} routes
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {showModal && (
        <div className="mgr-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="mgr-modal" onClick={(e) => e.stopPropagation()}>

            <div className="mgr-modal-header">
              <h3>Edit Route</h3>
              <button className="mgr-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="mgr-modal-icon-wrap">
              <div className="mgr-modal-icon">📍</div>
              <span>Route ID: {selectedRoute?.route_ID}</span>
            </div>

            {error && (
              <div className="mgr-alert mgr-alert-error" style={{margin:"0 1.5rem 1rem"}}>
                ⚠ {error}
              </div>
            )}

            <div className="mgr-modal-body">

              {/* Route Name */}
              <div className="mgr-form-group">
                <label>Route Name</label>
                <input type="text" name="route_name"
                  value={editData.route_name} onChange={handleEditChange} />
              </div>

              {/* Area Name */}
              <div className="mgr-form-group">
                <label>Area Name</label>
                <input type="text" name="area_name"
                  value={editData.area_name} onChange={handleEditChange} />
              </div>

              {/* Start Location */}
              <div className="mgr-form-group">
                <label>Start Location</label>
                <input type="text" name="start_location"
                  value={editData.start_location} onChange={handleEditChange} />
              </div>

              {/* End Location */}
              <div className="mgr-form-group">
                <label>End Location</label>
                <input type="text" name="end_location"
                  value={editData.end_location} onChange={handleEditChange} />
              </div>

              {/* Duration — same hours/minutes split as AddRoute */}
              <div className="mgr-form-group mgr-full-width">
                <label>Estimated Duration</label>
                <div style={{display:"flex", gap:"10px", alignItems:"center"}}>
                  <div style={{display:"flex", alignItems:"center", gap:"6px", flex:1}}>
                    <input
                      type="number" name="duration_hours"
                      placeholder="0" min="0" max="23"
                      value={editData.duration_hours}
                      onChange={handleEditChange}
                      style={{width:"100%"}}
                    />
                    <span style={{whiteSpace:"nowrap", color:"#555", fontWeight:"500"}}>hrs</span>
                  </div>
                  <div style={{display:"flex", alignItems:"center", gap:"6px", flex:1}}>
                    <input
                      type="number" name="duration_minutes"
                      placeholder="0" min="0" max="59"
                      value={editData.duration_minutes}
                      onChange={handleEditChange}
                      style={{width:"100%"}}
                    />
                    <span style={{whiteSpace:"nowrap", color:"#555", fontWeight:"500"}}>min</span>
                  </div>
                </div>
                {(editData.duration_hours || editData.duration_minutes) && (
                  <div style={{marginTop:"6px", fontSize:"13px", color:"#27ae60", fontWeight:"500"}}>
                    ⏱ Duration: {(() => {
                      const h = parseInt(editData.duration_hours) || 0;
                      const m = parseInt(editData.duration_minutes) || 0;
                      if (h > 0 && m > 0) return `${h}h ${m}m`;
                      if (h > 0) return `${h}h`;
                      return `${m}m`;
                    })()}
                  </div>
                )}
              </div>

              {/* Truck Selection */}
              <div className="mgr-form-group mgr-full-width">
                <label>Assign Truck</label>
                <select name="truck_ID" value={editData.truck_ID} onChange={handleEditChange}>
                  <option value="">-- Select Truck --</option>
                  {trucks.map(t => (
                    <option key={t.truck_ID} value={t.truck_ID}>
                      🚛 {t.vehicle_number} — ID: {t.truck_ID}
                      {t.driver_id ? " ✓ Driver assigned" : " ⚠ No driver"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Driver Field — same logic as AddRoute */}
              <div className="mgr-form-group mgr-full-width">
                {driverFieldMode === "none" && (
                  <>
                    <label>Assigned Driver</label>
                    <div className="mgr-driver-placeholder">
                      👆 Please select a truck first
                    </div>
                  </>
                )}

                {driverFieldMode === "auto" && assignedDriver && (
                  <>
                    <label>Assigned Driver</label>
                    <div className="mgr-auto-driver">
                      <div className="mgr-auto-driver-avatar">
                        {assignedDriver.name?.[0]?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="mgr-auto-driver-name">{assignedDriver.name}</div>
                        <div className="mgr-auto-driver-sub">
                          ID: {assignedDriver.driver_ID || assignedDriver.driver_id}
                          &nbsp;·&nbsp;{assignedDriver.phone_no}
                        </div>
                        <div className="mgr-auto-driver-tag">✓ Auto-filled from truck</div>
                      </div>
                    </div>
                  </>
                )}

                {driverFieldMode === "select" && (
                  <>
                    <label>Assign Driver
                      <span className="mgr-label-note"> — Truck has no assigned driver</span>
                    </label>
                    {availableDrivers.length === 0 ? (
                      <div className="mgr-no-data">⚠ No available drivers.</div>
                    ) : (
                      <select name="driver_ID" value={editData.driver_ID} onChange={handleEditChange}>
                        <option value="">-- Select Driver --</option>
                        {availableDrivers.map(d => (
                          <option key={d.driver_ID || d.driver_id} value={d.driver_ID || d.driver_id}>
                            👤 {d.name} — {d.driver_ID || d.driver_id}
                          </option>
                        ))}
                      </select>
                    )}
                  </>
                )}
              </div>

            </div>

            <div className="mgr-modal-footer">
              <button className="mgr-btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="mgr-btn-save" onClick={handleUpdate}>Save Changes</button>
            </div>

          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <div className="mgr-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="mgr-modal mgr-modal-sm" onClick={(e) => e.stopPropagation()}>

            <div className="mgr-modal-header">
              <h3>Delete Route</h3>
              <button className="mgr-modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>

            <div className="mgr-delete-body">
              <div className="mgr-delete-icon">📍</div>
              <p>Are you sure you want to delete</p>
              <strong>"{deleteTarget?.route_name}"</strong>
              <span>This action cannot be undone.</span>
            </div>

            <div className="mgr-modal-footer">
              <button className="mgr-btn-cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="mgr-btn-confirm-delete" onClick={handleDelete}>Yes, Delete</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ManageRoutes;