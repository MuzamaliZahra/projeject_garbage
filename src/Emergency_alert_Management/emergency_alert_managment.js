import { useState, useEffect } from "react";
import axios from "axios";
import "./manage_emergency_alerts.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";

const ALERT_TYPES = [
  "Waste related alerts",
  "Environmental hazard",
  "Road closure",
  "Service delay",
  "General emergency",
];

function ManageEmergencyAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Edit modal state
  const [editOpen, setEditOpen] = useState(false);
  const [editAlert, setEditAlert] = useState(null);
  const [editForm, setEditForm] = useState({
    tittle: "", alert_type: "", message: "", expired_time: "", is_active: true,
  });
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [affectedResidents, setAffectedResidents] = useState([]);
  const [loadingResidents, setLoadingResidents] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editError, setEditError] = useState("");

  // Delete modal state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchAlerts = () => {
    setLoading(true);
    axios.get("http://localhost:5000/get-alerts")
      .then((res) => { setAlerts(res.data); setLoading(false); })
      .catch(() => { setAlerts([]); setLoading(false); });
  };

  useEffect(() => { fetchAlerts(); }, []);

  useEffect(() => {
    axios.get("http://localhost:5000/get-locations")
      .then((res) => setLocations(res.data))
      .catch(() => setLocations([]));
  }, []);

  // Fetch residents when the edit-modal location changes
  useEffect(() => {
    if (!editOpen || !selectedLocation) { setAffectedResidents([]); return; }
    setLoadingResidents(true);
    axios.get(`http://localhost:5000/get-residents-by-location/${encodeURIComponent(selectedLocation)}`)
      .then((res) => { setAffectedResidents(res.data); setLoadingResidents(false); })
      .catch(() => { setAffectedResidents([]); setLoadingResidents(false); });
  }, [selectedLocation, editOpen]);

  const isExpired = (alert) => new Date(alert.expired_time).getTime() <= Date.now();

  const formatDateTime = (value) =>
    new Date(value).toLocaleString(undefined, {
      month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit",
    });

  const toDatetimeLocalValue = (value) => {
    const d = new Date(value);
    const pad = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  // ---- Edit flow ----
  const openEdit = (alert) => {
    setEditAlert(alert);
    setEditForm({
      tittle: alert.tittle,
      alert_type: alert.alert_type,
      message: alert.message,
      expired_time: toDatetimeLocalValue(alert.expired_time),
      is_active: !!alert.is_active,
    });

    // Pre-fill location guess + residents from existing resident_ID list
    const existingIds = (alert.resident_ID || "").split(",").map((s) => s.trim()).filter(Boolean);
    setAffectedResidents(existingIds.map((id) => ({ resident_ID: id, name: "(loading…)", address: "" })));
    setSelectedLocation(""); // admin can re-pick a location to refresh the list
    setEditError("");
    setEditOpen(true);
  };

  const closeEdit = () => {
    setEditOpen(false);
    setEditAlert(null);
    setSelectedLocation("");
    setAffectedResidents([]);
  };

  const handleEditChange = (e) => {
    setEditError("");
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const { tittle, alert_type, message, expired_time } = editForm;
    if (!tittle || !alert_type || !message || !expired_time) {
      setEditError("All fields are required.");
      return;
    }

    setSaving(true);
    const payload = {
      tittle,
      alert_type,
      message,
      expired_time,
      is_active: editForm.is_active ? 1 : 0,
      resident_ids: affectedResidents.map((r) => r.resident_ID),
    };

    axios.put(`http://localhost:5000/update-alert/${editAlert.alert_ID}`, payload)
      .then(() => {
        setSaving(false);
        closeEdit();
        fetchAlerts();
      })
      .catch((err) => {
        setSaving(false);
        setEditError(err.response?.data || "Server error. Please try again.");
      });
  };

  // ---- Delete flow ----
  const openDelete = (alert) => { setDeleteTarget(alert); setDeleteOpen(true); };
  const closeDelete = () => { setDeleteOpen(false); setDeleteTarget(null); };

  const confirmDelete = () => {
    setDeleting(true);
    axios.delete(`http://localhost:5000/delete-alert/${deleteTarget.alert_ID}`)
      .then(() => {
        setDeleting(false);
        closeDelete();
        fetchAlerts();
      })
      .catch(() => setDeleting(false));
  };

  // ---- Search filter ----
  const filtered = alerts.filter((a) => {
    const q = search.toLowerCase();
    return (
      a.alert_ID?.toLowerCase().includes(q) ||
      a.tittle?.toLowerCase().includes(q) ||
      a.alert_type?.toLowerCase().includes(q) ||
      a.message?.toLowerCase().includes(q) ||
      (a.resident_ID || "").toLowerCase().includes(q)
    );
  });

  const totalCount = alerts.length;
  const activeCount = alerts.filter((a) => a.is_active && !isExpired(a)).length;
  const expiredCount = alerts.filter((a) => isExpired(a)).length;

  return (
    <div>
           <AdminNavBar />
    <div className="ms_page">
  
    <div className="ms_body">
     

      <div className="ms_page_header">
        <div>
          <h2>Manage Emergency Alerts</h2>
          <p>View, update and remove emergency alerts</p>
        </div>
      </div>

      <div className="status_row">
        <div className="status_card green">
          <div className="status_num">{totalCount}</div>
          <div className="status_label">Total Alerts</div>
        </div>
        <div className="status_card blue">
          <div className="status_num">{activeCount}</div>
          <div className="status_label">Active</div>
        </div>
        <div className="status_card orange">
          <div className="status_num">{expiredCount}</div>
          <div className="status_label">Expired</div>
        </div>
      </div>

      <div className="ms_search_wrap">
        <input
          type="text"
          className="ms_search_input"
          placeholder="Search by ID, title, type, message or resident…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="ms_card">
        {loading ? (
          <div className="ms_loading">Loading alerts…</div>
        ) : filtered.length === 0 ? (
          <div className="ms_empty">
            <div className="ms_empty_icon">🚨</div>
            <p>No emergency alerts found</p>
            <span>Try a different search, or publish a new alert.</span>
          </div>
        ) : (
          <table className="ms_table">
            <thead>
              <tr>
                <th>Alert ID</th>
                <th>Title</th>
                <th>Type</th>
                <th>Expires</th>
                <th>Affected Residents</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((alert) => {
                const expired = isExpired(alert);
                const residentIds = (alert.resident_ID || "").split(",").map((s) => s.trim()).filter(Boolean);
                return (
                  <tr key={alert.alert_ID}>
                    <td><span className="ms_id_badge">{alert.alert_ID}</span></td>
                    <td>{alert.tittle}</td>
                    <td><span className="ms_day_badge">{alert.alert_type || "—"}</span></td>
                    <td>
                      <span className="ms_time_badge">⏱ {formatDateTime(alert.expired_time)}</span>
                    </td>
                    <td>
                      {residentIds.length === 0 ? (
                        <span className="ms_resident_none">None</span>
                      ) : (
                        <span className="ms_resident_count_badge">{residentIds.length} resident{residentIds.length !== 1 ? "s" : ""}</span>
                      )}
                    </td>
                    <td>
                      <div className="ms_status_stack">
                        <span className={`ms_status_badge ${alert.is_active ? "ms_badge_active" : "ms_badge_inactive"}`}>
                          {alert.is_active ? "Active" : "Inactive"}
                        </span>
                        {expired && <span className="ms_status_badge ms_badge_expired">Expired</span>}
                      </div>
                    </td>
                    <td>
                      <div className="ms_action_btns">
                        <button className="ms_btn_edit" onClick={() => openEdit(alert)}>✎ Edit</button>
                        <button className="ms_btn_delete" onClick={() => openDelete(alert)}>🗑 Delete</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {!loading && filtered.length > 0 && (
        <div className="ms_count">Showing {filtered.length} of {totalCount} alerts</div>
      )}

      {/* ---- EDIT MODAL ---- */}
      {editOpen && editAlert && (
        <div className="ms_modal_overlay" onClick={closeEdit}>
          <div className="ms_modal" onClick={(e) => e.stopPropagation()}>
            <div className="ms_modal_header">
              <h3>Edit Emergency Alert</h3>
              <button className="ms_modal_close" onClick={closeEdit}>✕</button>
            </div>

            <div className="ms_modal_banner">
              <div className="ms_modal_banner_icon">🚨</div>
              <div className="ms_modal_banner_id">{editAlert.alert_ID}</div>
              <div className="ms_modal_banner_sub">Update alert details below</div>
            </div>

            <form onSubmit={handleSaveEdit}>
              <div className="ms_modal_body">

                {editError && <div className="ms_edit_error">⚠ {editError}</div>}

                <div className="ms_form_group">
                  <label>Title</label>
                  <input
                    type="text"
                    name="tittle"
                    value={editForm.tittle}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="ms_form_group">
                  <label>Alert Type</label>
                  <select name="alert_type" value={editForm.alert_type} onChange={handleEditChange} required>
                    <option value="">— Select Type —</option>
                    {ALERT_TYPES.map((t) => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                </div>

                <div className="ms_form_group">
                  <label>Message</label>
                  <textarea
                    name="message"
                    rows={4}
                    value={editForm.message}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="ms_form_group">
                  <label>Expiry Date &amp; Time</label>
                  <input
                    type="datetime-local"
                    name="expired_time"
                    value={editForm.expired_time}
                    onChange={handleEditChange}
                    required
                  />
                </div>

                <div className="ms_form_group">
                  <label>Affected Area / Location</label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">— Select to refresh affected residents —</option>
                    {locations.map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                  </select>
                  <span className="ms_day_hint">
                    Currently {affectedResidents.length} resident{affectedResidents.length !== 1 ? "s" : ""} assigned
                  </span>
                </div>

                <div className="ms_form_group">
                  <label>Affected Residents</label>
                  {loadingResidents ? (
                    <div className="ms_residents_box ms_residents_loading">Loading residents…</div>
                  ) : affectedResidents.length === 0 ? (
                    <div className="ms_residents_box ms_residents_empty">No residents assigned yet</div>
                  ) : (
                    <div className="ms_residents_box">
                      {affectedResidents.map((r) => (
                        <div key={r.resident_ID} className="ms_resident_chip">
                          <span className="ms_resident_icon">👤</span>
                          <div>
                            <div className="ms_resident_name">{r.name}</div>
                            <div className="ms_resident_id">
                              ID: {r.resident_ID}{r.address ? ` — ${r.address}` : ""}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="ms_form_group">
                  <label>Status</label>
                  <div
                    className="ms_toggle_wrap"
                    onClick={() => setEditForm((p) => ({ ...p, is_active: !p.is_active }))}
                  >
                    <div className={`ms_toggle_sw ${editForm.is_active ? "on" : ""}`}>
                      <div className="ms_toggle_knob" />
                    </div>
                    <span className="ms_toggle_lbl">{editForm.is_active ? "Active" : "Inactive"}</span>
                    <span className="ms_toggle_hint">
                      {editForm.is_active ? "Visible to residents" : "Alert hidden"}
                    </span>
                  </div>
                </div>

              </div>

              <div className="ms_modal_footer">
                <button type="button" className="ms_btn_cancel" onClick={closeEdit}>Cancel</button>
                <button type="submit" className="ms_btn_save" disabled={saving}>
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---- DELETE MODAL ---- */}
      {deleteOpen && deleteTarget && (
        <div className="ms_modal_overlay" onClick={closeDelete}>
          <div className="ms_modal ms_modal_sm" onClick={(e) => e.stopPropagation()}>
            <div className="ms_modal_header">
              <h3>Delete Alert</h3>
              <button className="ms_modal_close" onClick={closeDelete}>✕</button>
            </div>
            <div className="ms_delete_body">
              <div className="ms_delete_icon">⚠️</div>
              <p>Are you sure you want to delete</p>
              <strong>{deleteTarget.tittle} ({deleteTarget.alert_ID})</strong>
              <span className="ms_delete_warning">This action cannot be undone.</span>
            </div>
            <div className="ms_modal_footer">
              <button className="ms_btn_cancel" onClick={closeDelete}>Cancel</button>
              <button className="ms_btn_confirm_delete" onClick={confirmDelete} disabled={deleting}>
                {deleting ? "Deleting…" : "Delete Alert"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
    </div>
    </div>
  );
}

export default ManageEmergencyAlerts;