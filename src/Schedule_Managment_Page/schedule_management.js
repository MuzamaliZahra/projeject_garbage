import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./schedule_management.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

function ManageSchedules() {
  const navigate = useNavigate();

  const [schedules, setSchedules] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [showModal, setShowModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [editData, setEditData] = useState({});

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [routes, setRoutes] = useState([]);

  // Truck conflict check state for edit modal
  const [truckConflict, setTruckConflict] = useState(null);
  const [conflictDetails, setConflictDetails] = useState(null);

  const fetchSchedules = () => {
    setLoading(true);
    axios.get("http://localhost:5000/get-schedules")
      .then((res) => { setSchedules(res.data); setLoading(false); })
      .catch(() => { setError("Failed to load schedules"); setLoading(false); });
  };

  const fetchRoutes = () => {
    axios.get("http://localhost:5000/get-routes")
      .then((res) => setRoutes(res.data))
      .catch(() => {});
  };

  useEffect(() => { fetchSchedules(); fetchRoutes(); }, []);

  // ── Check truck conflict whenever route, time, or day changes in edit modal ──
  useEffect(() => {
    if (!showModal) return;
    if (!editData.route_ID || !editData.time || !editData.day_of_week) {
      setTruckConflict(null);
      setConflictDetails(null);
      return;
    }

    const route = routes.find((r) => r.route_ID == editData.route_ID);
    if (!route || !route.truck_ID) {
      setTruckConflict(null);
      return;
    }

    setTruckConflict("checking");
    setConflictDetails(null);

    axios.get("http://localhost:5000/check-truck-availability", {
      params: {
        truck_ID: route.truck_ID,
        time: editData.time,
        day_of_week: editData.day_of_week,
      },
    })
      .then((res) => {
        if (res.data.conflict && res.data.conflictDetails?.schedule_id !== selectedSchedule?.schedule_id) {
          setTruckConflict("conflict");
          setConflictDetails(res.data.conflictDetails);
        } else {
          setTruckConflict("ok");
          setConflictDetails(null);
        }
      })
      .catch(() => setTruckConflict(null));
  }, [editData.route_ID, editData.time, editData.day_of_week, showModal]);

  const filteredSchedules = schedules.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.schedule_id || "").toString().toLowerCase().includes(q) ||
      (s.area || "").toLowerCase().includes(q) ||
      (s.status || "").toLowerCase().includes(q) ||
      (s.day_of_week || "").toLowerCase().includes(q) ||
      (s.route_name || s.route_ID || "").toString().toLowerCase().includes(q)
    );
  });

  const getStatusClass = (status) => {
    if (!status) return "";
    return status.toLowerCase() === "active" ? "ms_badge_active" : "ms_badge_inactive";
  };

  const openEdit = (schedule) => {
    setSelectedSchedule(schedule);
    setEditData({
      time:        schedule.time || "",
      status:      schedule.status || "Active",
      route_ID:    schedule.route_ID || "",
      day_of_week: schedule.day_of_week || "",
      area:        schedule.area || "",
    });
    setTruckConflict(null);
    setConflictDetails(null);
    setShowModal(true);
    setError("");
    setSuccess("");
  };

  const handleEditChange = (e) => {
    setError("");
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = () => {
    if (!editData.time || !editData.status || !editData.route_ID || !editData.day_of_week) {
      setError("All fields are required.");
      return;
    }

    if (truckConflict === "conflict") {
      setError("Truck is already assigned at this time on this day. Please choose a different time or day.");
      return;
    }

    if (truckConflict === "checking") {
      setError("Please wait - checking truck availability...");
      return;
    }

    const selectedRoute = routes.find((r) => r.route_ID == editData.route_ID);
    const payload = {
      time:        editData.time,
      status:      editData.status,
      route_ID:    editData.route_ID,
      day_of_week: editData.day_of_week,
      area:        selectedRoute?.area_name || editData.area || selectedSchedule?.area || "",
    };

    axios.put(`http://localhost:5000/update-schedule/${selectedSchedule.schedule_id}`, payload)
      .then(() => {
        setSuccess(`Schedule "${selectedSchedule.schedule_id}" updated successfully!`);
        setShowModal(false);
        setTruckConflict(null);
        setConflictDetails(null);
        fetchSchedules();
      })
      .catch((err) => setError(err.response?.data || "Error updating schedule."));
  };

  const openDelete = (schedule) => {
    setDeleteTarget(schedule);
    setShowDeleteModal(true);
  };

  const handleDelete = () => {
    axios.delete(`http://localhost:5000/delete-schedule/${deleteTarget.schedule_id}`)
      .then(() => {
        setSuccess(`Schedule "${deleteTarget.schedule_id}" deleted successfully!`);
        setShowDeleteModal(false);
        fetchSchedules();
      })
      .catch(() => { setError("Error deleting schedule."); setShowDeleteModal(false); });
  };

  const formatTime = (t) => {
    if (!t) return "—";
    const [h, m] = t.split(":");
    const hour = parseInt(h);
    return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
  };

  return (
    <div>
      <AdminNavBar/>
    <div className="ms_page">
      

      <div className="body">

        {/* Page Header */}
        <div className="page_header">
          <div>
            <h2>Manage Schedules</h2>
            <p>View, edit and delete garbage collection schedules</p>
          </div>
          <button className="add_btn" onClick={() => navigate("/add_schedule")}>
            + Add New Schedule
          </button>
        </div>

        {error && <div className="alert alert_error">⚠ {error}</div>}
        {success && <div className="alert alert_success">✓ {success}</div>}

        {/* Stats */}
        <div className="status_row">
          <div className="status_card green">
            <div className="status_num">{schedules.length}</div>
            <div className="status_label">Total Schedules</div>
          </div>
          <div className="status_card blue">
            <div className="status_num">{schedules.filter((s) => s.status === "Active").length}</div>
            <div className="status_label">Active</div>
          </div>
          <div className="status_card orange">
            <div className="status_num">{schedules.filter((s) => s.status === "Inactive").length}</div>
            <div className="status_label">Inactive</div>
          </div>
        </div>

        {/* Search */}
        <div className="search_bar">
          <span className="search_icon">🔍</span>
          <input
            type="text"
            placeholder="Search by ID, area, route, status or day..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear_btn" onClick={() => setSearch("")}>✕</button>
          )}
        </div>

        {/* Table */}
        <div className="ms_card">
          {loading ? (
            <div className="ms_loading">Loading Schedules...</div>
          ) : filteredSchedules.length === 0 ? (
            <div className="ms_empty">
              <div className="ms_empty_icon">📅</div>
              <p>No schedules found</p>
              <span>Try a different search or add a new schedule</span>
            </div>
          ) : (
            <table className="ms_table">
              <thead>
                <tr>
                  <th>Schedule ID</th>
                  <th>Day</th>
                  <th>Time</th>
                  <th>Area</th>
                  <th>Route</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.schedule_id}>
                    <td><span className="ms_id_badge">{schedule.schedule_id}</span></td>
                    <td><span className="ms_day_badge">{schedule.day_of_week || "—"}</span></td>
                    <td>{formatTime(schedule.time)}</td>
                    <td>{schedule.area || "—"}</td>
                    <td>
                      <div className="ms_route_cell">
                        <span>{schedule.route_name || `Route ${schedule.route_ID}` || "—"}</span>
                        <button
                          className="ms_btn_route"
                          onClick={(e) => { e.stopPropagation(); navigate(`/route_managment?highlight=${schedule.route_ID}`); }}
                        >
                          ↗ Route
                        </button>
                      </div>
                    </td>
                    <td>
                      <span className={`ms_status_badge ${getStatusClass(schedule.status)}`}>
                        {schedule.status || "—"}
                      </span>
                    </td>
                    <td>
                      <div className="ms_action_btns">
                        <button className="ms_btn_edit"
                          onClick={(e) => { e.stopPropagation(); openEdit(schedule); }}>
                          ✏ Edit
                        </button>
                        <button className="ms_btn_delete"
                          onClick={(e) => { e.stopPropagation(); openDelete(schedule); }}>
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

        {!loading && filteredSchedules.length > 0 && (
          <div className="ms_count">
            Showing {filteredSchedules.length} of {schedules.length} schedules
          </div>
        )}

      </div>

      {/* ── Edit Modal ── */}
      {showModal && (
        <div className="ms_modal_overlay" onClick={() => setShowModal(false)}>
          <div className="ms_modal" onClick={(e) => e.stopPropagation()}>

            <div className="ms_modal_header">
              <h3>Edit Schedule</h3>
              <button className="ms_modal_close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="ms_modal_banner">
              <span className="ms_modal_banner_icon">📅</span>
              <div>
                <div className="ms_modal_banner_id">{selectedSchedule?.schedule_id}</div>
                <div className="ms_modal_banner_sub">Schedule ID</div>
              </div>
            </div>

            {error && <div className="ms_alert ms_alert_error ms_modal_alert">⚠ {error}</div>}

            <div className="ms_modal_body">

              {/* Day selector — pill style matching AddSchedule */}
              <div className="ms_form_group">
                <label>Day of Week</label>
                <div className="ms_day_pills">
                  {DAYS.map((day) => (
                    <button
                      key={day}
                      type="button"
                      className={`ms_day_pill ${editData.day_of_week === day ? "selected" : ""}`}
                      onClick={() => {
                        setError("");
                        setEditData((prev) => ({ ...prev, day_of_week: day }));
                      }}
                    >
                      <span className="ms_day_short">{day.slice(0, 3)}</span>
                      <span className="ms_day_full">{day}</span>
                    </button>
                  ))}
                </div>
                {editData.day_of_week && (
                  <div className="ms_selected_day_hint">
                    📅 Selected: <strong>{editData.day_of_week}</strong>
                  </div>
                )}
              </div>

              {/* Time */}
              <div className="ms_form_group">
                <label>Time</label>
                <input
                  type="time"
                  name="time"
                  value={editData.time}
                  onChange={handleEditChange}
                />
                {truckConflict === "checking" && (
                  <div className="ms_availability checking">⏳ Checking truck availability...</div>
                )}
                {truckConflict === "ok" && (
                  <div className="ms_availability ok">✓ Truck is available on {editData.day_of_week}</div>
                )}
                {truckConflict === "conflict" && (
                  <div className="ms_availability conflict">
                    🚫 Truck conflict on <strong>{editData.day_of_week}</strong>
                    {conflictDetails && (
                      <span> — assigned to <strong>{conflictDetails.route_name}</strong> at {conflictDetails.time}</span>
                    )}
                  </div>
                )}
              </div>

              {/* Status */}
              <div className="ms_form_group">
                <label>Status</label>
                <select name="status" value={editData.status} onChange={handleEditChange}>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>

              {/* Route */}
              <div className="ms_form_group">
                <label>Route</label>
                <select name="route_ID" value={editData.route_ID} onChange={handleEditChange}>
                  <option value="">— Select Route —</option>
                  {routes.map((route) => (
                    <option key={route.route_ID} value={route.route_ID}>
                      {route.route_name} — {route.area_name}
                      {route.truck_ID ? ` | 🚛 ${route.truck_ID}` : " | ⚠ No Truck"}
                    </option>
                  ))}
                </select>
              </div>

              {/* Area auto-filled */}
              {editData.route_ID && (
                <div className="ms_form_group">
                  <label>Area (auto-filled)</label>
                  <input
                    type="text"
                    readOnly
                    className="ms_input_readonly"
                    value={
                      routes.find((r) => r.route_ID == editData.route_ID)?.area_name ||
                      selectedSchedule?.area || "—"
                    }
                  />
                </div>
              )}

              {/* Conflict banner */}
              {truckConflict === "conflict" && (
                <div className="ms_conflict_banner">
                  <div className="ms_conflict_icon">🚫</div>
                  <div className="ms_conflict_text">
                    <strong>Truck Unavailable on {editData.day_of_week}</strong>
                    <p>
                      The truck is already scheduled on <strong>{editData.day_of_week}</strong> at{" "}
                      <strong>{editData.time}</strong>.
                      {conflictDetails && (
                        <> It is assigned to route <strong>"{conflictDetails.route_name}"</strong>.</>
                      )}
                      Please select a different time or day.
                    </p>
                  </div>
                </div>
              )}

              {editData.route_ID && (
                <div
                  className="ms_route_link"
                  onClick={() => navigate(`/route_managment?highlight=${editData.route_ID}`)}
                >
                  ↗ Need to update this route? Go to Route Management
                </div>
              )}

            </div>

            <div className="ms_modal_footer">
              <button className="ms_btn_cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button
                className="ms_btn_save"
                onClick={handleUpdate}
                disabled={truckConflict === "conflict" || truckConflict === "checking"}
              >
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <div className="ms_modal_overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="ms_modal ms_modal_sm" onClick={(e) => e.stopPropagation()}>

            <div className="ms_modal_header">
              <h3>Delete Schedule</h3>
              <button className="ms_modal_close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>

            <div className="ms_delete_body">
              <div className="ms_delete_icon">🗑️</div>
              <p>Are you sure you want to delete</p>
              <strong>"{deleteTarget?.schedule_id}"</strong>
              <span>{deleteTarget?.day_of_week} — {formatTime(deleteTarget?.time)}</span>
              <span className="ms_delete_warning">This action cannot be undone.</span>
            </div>

            <div className="ms_modal_footer">
              <button className="ms_btn_cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="ms_btn_confirm_delete" onClick={handleDelete}>Yes, Delete</button>
            </div>

          </div>
        </div>
      )}

    </div>
    </div>
  );
}

export default ManageSchedules;