import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./add_emergency_alert.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";

function AddEmergencyAlert() {
  const [formData, setFormData] = useState({
    alert_ID: "", tittle: "", alert_type: "", message: "", expired_time: "",
  });
  const [isActive, setIsActive] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // New state
  const [locations, setLocations] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState("");
  const [affectedResidents, setAffectedResidents] = useState([]); // [{resident_ID, name, address}]
  const [loadingResidents, setLoadingResidents] = useState(false);

  const navigate = useNavigate();

  // Load locations on mount
  useEffect(() => {
    axios.get("http://localhost:5000/get-locations")
      .then((res) => setLocations(res.data))
      .catch(() => setLocations([]));
  }, []);

  // Fetch residents when location changes
  useEffect(() => {
    if (!selectedLocation) { setAffectedResidents([]); return; }
    setLoadingResidents(true);
    axios.get(`http://localhost:5000/get-residents-by-location/${encodeURIComponent(selectedLocation)}`)
      .then((res) => { setAffectedResidents(res.data); setLoadingResidents(false); })
      .catch(() => { setAffectedResidents([]); setLoadingResidents(false); });
  }, [selectedLocation]);

  const handleChange = (e) => {
    setError(""); setSuccess("");
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { alert_ID, tittle, alert_type, message, expired_time } = formData;
    if (!alert_ID || !tittle || !alert_type || !message || !expired_time) {
      setError("All fields are required."); return;
    }
    setSubmitting(true);

    const payload = {
      alert_ID, tittle, alert_type, message, expired_time,
      is_active: isActive ? 1 : 0,
      resident_ids: affectedResidents.map((r) => r.resident_ID),
    };

    axios.post("http://localhost:5000/add-emergency-alert", payload)
      .then(() => {
        setSuccess(`Alert "${tittle}" published successfully!`);
        setFormData({ alert_ID: "", tittle: "", alert_type: "", message: "", expired_time: "" });
        setIsActive(true); setSelectedLocation(""); setAffectedResidents([]);
        setSubmitting(false);
      })
      .catch((err) => {
        setError(err.response?.data || "Server error. Please try again.");
        setSubmitting(false);
      });
  };

  return (
    <div className="ea_page">
      <AdminNavBar />
      <div className="ea_body">

        <div className="ea_page_header">
          <h2>🚨 Create Emergency Alert</h2>
          <p>Publish urgent alerts for road closures, service delays, or hazards</p>
        </div>

        <div className="status_row">
          <div className="status_card green"><span className="status_num">🚨</span><div className="status_label">New Alert</div></div>
          <div className="status_card orange"><span className="status_num">📢</span><div className="status_label">Notify Residents</div></div>
          <div className="status_card blue"><span className="status_num">📋</span><div className="status_label">Fill All Fields</div></div>
        </div>

        <div className="ea_card">
          <div className="ea_card_header">
            <span className="ea_card_icon">⚠️</span>
            <span className="ea_card_label">Emergency Alert Registration</span>
          </div>

          {error   && <div className="ea_alert ea_alert_error"   style={{ margin: "1rem 1.5rem 0" }}>⚠ {error}</div>}
          {success && <div className="ea_alert ea_alert_success" style={{ margin: "1rem 1.5rem 0" }}>✓ {success}</div>}

          <form onSubmit={handleSubmit} className="ea_form">

            <div className="ea_form_row">
              <div className="ea_form_group">
                <label>Alert ID</label>
                <input type="text" name="alert_ID" placeholder="e.g. ALT001"
                  value={formData.alert_ID} onChange={handleChange} required />
              </div>
              <div className="ea_form_group">
                <label>Alert Type</label>
                <select name="alert_type" value={formData.alert_type} onChange={handleChange} required>
                  <option value="">— Select Type —</option>
                  <option value="Waste related alerts">Waste related alerts</option>
                  <option value="Environmental hazard">Environmental hazard</option>
                  <option value="Road closure">Road closure</option>
                  <option value="Service delay">Service delay</option>
                  <option value="General emergency">General emergency</option>
                </select>
              </div>
            </div>

            <div className="ea_form_group">
              <label>Title</label>
              <input type="text" name="tittle" placeholder="Enter alert title..."
                value={formData.tittle} onChange={handleChange} required />
            </div>

            <div className="ea_form_group">
              <label>Message</label>
              <textarea name="message" placeholder="Describe the emergency in detail..."
                value={formData.message} onChange={handleChange} rows={5} required />
            </div>

            {/* ── Affected Area ── */}
            <div className="ea_form_group">
              <label>Affected Area / Location</label>
              <select value={selectedLocation} onChange={(e) => { setError(""); setSelectedLocation(e.target.value); }}>
                <option value="">— Select Location —</option>
                {locations.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* ── Affected Residents Preview ── */}
            {selectedLocation && (
              <div className="ea_form_group">
                <label>
                  Affected Residents
                  {affectedResidents.length > 0 && (
                    <span className="ea_resident_count"> ({affectedResidents.length} found)</span>
                  )}
                </label>
                {loadingResidents ? (
                  <div className="ea_residents_box ea_residents_loading">Loading residents…</div>
                ) : affectedResidents.length === 0 ? (
                  <div className="ea_residents_box ea_residents_empty">No residents found in "{selectedLocation}"</div>
                ) : (
                  <div className="ea_residents_box">
                    {affectedResidents.map((r) => (
                      <div key={r.resident_ID} className="ea_resident_chip">
                        <span className="ea_resident_icon">👤</span>
                        <div>
                          <div className="ea_resident_name">{r.name}</div>
                          <div className="ea_resident_id">ID: {r.resident_ID} — {r.address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            <div className="ea_form_row">
              <div className="ea_form_group">
                <label>Expiry Date &amp; Time</label>
                <input type="datetime-local" name="expired_time"
                  value={formData.expired_time} onChange={handleChange} required />
              </div>
              <div className="ea_form_group">
                <label>Status</label>
                <div className="ea_toggle_wrap" onClick={() => setIsActive((p) => !p)}>
                  <div className={`ea_toggle_sw ${isActive ? "on" : ""}`}><div className="ea_toggle_knob" /></div>
                  <span className="ea_toggle_lbl">{isActive ? "Active" : "Inactive"}</span>
                  <span className="ea_toggle_hint">{isActive ? "Visible to residents" : "Alert hidden"}</span>
                </div>
              </div>
            </div>

            <div className="ea_btn_row">
              <button type="button" className="ea_btn_cancel" onClick={() => navigate(-1)}>Cancel</button>
              <button type="submit" className="ea_btn_submit" disabled={submitting}>
                {submitting ? "Publishing..." : "🚨 Publish Alert"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddEmergencyAlert;