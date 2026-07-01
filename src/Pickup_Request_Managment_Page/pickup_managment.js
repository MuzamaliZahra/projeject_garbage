import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./pickup_managment.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";

const STATUS_OPTIONS = ["Pending", "Scheduled", "Completed", "Rejected"];
function AdminSpecialRequests() {
    const navigate = useNavigate();
    const [requests, setRequests]   =useState([]);
    const [search, setSearch]       =useState("");
    const [loading, setLoading]     =useState(true);
    const [error, setError]         = useState("");
    const [success, setSuccess]     = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedRequest, setSelectedRequest] =useState(null);
    const [editData, setEditData]   =useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget]   = useState(null);
    //fetch
        const fetchRequests = () => {
        setLoading(true);
        axios.get("http://localhost:5000/admin/special-requests")
        .then((res) => { setRequests(res.data.success ? res.data.requests : []); setLoading(false); })
        .catch(() => { setError("Failed to load requests."); setLoading(false); });
    };
    useEffect(() => { fetchRequests(); }, []);
    // Filter 
    const filteredRequests = requests.filter((r) => {
        const q = search.toLowerCase();
        return(
            String(r.request_ID).includes(q) || 
            (r.resident_name || "").toLowerCase().includes(q) ||
            (r.item_type    || "").toLowerCase().includes(q) ||
            (r.location || "").toLowerCase().includes(q) ||
            (r.status        || "").toLowerCase().includes(q)
        );
    });
    //  Status badge class 
    const getStatusClass = (status) => {
        switch (status) {
        case "Pending":   return "asr_badge_pending";
        case "Scheduled": return "asr_badge_scheduled";
        case "Completed": return "asr_badge_completed";
        case "Rejected":  return "asr_badge_rejected";
        default:          return "asr_badge_pending";
        } };
     //  Open edit modal 
        const openEdit = (req) => {
            setSelectedRequest(req);
            setEditData({
            status:        req.status        || "Pending",
            schedule_date: req.schedule_date ? req.schedule_date.split("T")[0] : "",
            schedule_time: req.schedule_time || "",
            });
            setError("");
            setSuccess("");
            setShowModal(true);
        };
        const handleEditChange = (e) => {
            setError("");
            const { name, value } = e.target;
            setEditData((prev) => ({ ...prev, [name]: value }));
        };
        // Submit update
    const handleUpdate = () => {
        if (!editData.status) { setError("Please select a status."); return; }

        if (editData.status === "Scheduled" && (!editData.schedule_date || !editData.schedule_time)) {
        setError("Please provide both schedule date and time when status is Scheduled.");
        return;
        }
        axios.patch(`http://localhost:5000/admin/special-requests/${selectedRequest.request_ID}`, editData)
        .then(() => {
            setSuccess(`Request #${selectedRequest.request_ID} updated successfully!`);
            setShowModal(false);
            fetchRequests();
        })
        .catch((err) => setError(err.response?.data?.message || "Error updating request."));
    };
    //  Delete 
    const openDelete = (req) => { setDeleteTarget(req); setShowDeleteModal(true); };
      const handleDelete = () => {
        axios.delete(`http://localhost:5000/admin/special-requests/${deleteTarget.request_ID}`)
          .then(() => {
            setSuccess(`Request #${deleteTarget.request_ID} deleted successfully!`);
            setShowDeleteModal(false);
            fetchRequests();
          })
          .catch(() => { setError("Error deleting request."); setShowDeleteModal(false); });
      };
    
      const formatDate = (d) => (d ? d.split("T")[0] : "—");
      const formatTime = (t) => {
        if (!t) return "—";
        const [h, m] = t.split(":");
        const hour = parseInt(h);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
      };
      const countByStatus = (s) => requests.filter((r) => r.status === s).length;
    


    return (
    <div className="asr_page">

      <AdminNavBar/>
      <div className="body">

        {/* ── Page Header ── */}
        <div className="page_header">
          <div>
            <h2>Special Pickup Requests</h2>
            <p>Review, schedule and manage resident special garbage pickup requests</p>
          </div>
        </div>

        {error && (
          <div className="alert alert_error">
            <i className="bi bi-exclamation-triangle-fill"></i> {error}
          </div>
        )}

        {success && (
          <div className="alert alert_success">
            <i className="bi bi-check-circle-fill"></i> {success}
          </div>
        )}

        {/* ── Stats ── */}
        <div className="status_row">
          <div className="status_card green">
            <div className="status_num">{requests.length}</div>
            <div className="status_label">Total Requests</div>
          </div>
          <div className="status_card orange">
            <div className="status_num">{countByStatus("Pending")}</div>
            <div className="status_label">Pending</div>
          </div>
          <div className="status_card blue">
            <div className="status_num">{countByStatus("Scheduled")}</div>
            <div className="status_label">Scheduled</div>
          </div>
          <div className="status_card yellow">
            <div className="status_num">{countByStatus("Completed")}</div>
            <div className="status_label">Completed</div>
          </div>
        </div>

        {/* ── Search ── */}
        <div className="search_bar">
          <span className="search_icon">
            <i className="bi bi-search"></i>
          </span>
          <input
            type="text"
            placeholder="Search by ID, resident, item type, location or status..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="clear_btn" onClick={() => setSearch("")}>
              <i className="bi bi-x-lg"></i>
            </button>
          )}
        </div>


        {/* ── Table ── */}
        <div className="asr_card">
          {loading ? (
            <div className="asr_loading">Loading requests...</div>
          ) : filteredRequests.length === 0 ? (
            <div className="asr_empty">
              <div className="asr_empty_icon">
                <i className="bi bi-truck"></i>
              </div>
              <p>No requests found</p>
              <span>Try a different search term</span>
            </div>
          ) : (
            <table className="asr_table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Resident</th>
                  <th>Item Type</th>
                  <th>Location</th>
                  <th>Requested</th>
                  <th>Scheduled</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((r) => (
                  <tr key={r.request_ID}>
                    <td><span className="asr_id_badge">#{r.request_ID}</span></td>
                    <td>
                      <div className="asr_resident_cell">
                        {/*<div className="asr_avatar">
                          {(r.resident_name || "R")[0].toUpperCase()}
                        </div>*/}

                        <div>
                          <div className="asr_resident_name">{r.resident_name || "—"}</div>
                          <div className="asr_resident_sub">{r.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="asr_type_badge">{r.item_type}</span></td>
                    <td>
                      {r.location}
                      <div className="asr_sub_text">{r.address}</div>
                    </td>
                    <td>
                      {formatDate(r.request_date)}
                      <div className="asr_sub_text">{formatTime(r.request_time)}</div>
                    </td>
                    <td>
                      {r.schedule_date
                        ? <>{formatDate(r.schedule_date)}<div className="asr_sub_text">{formatTime(r.schedule_time)}</div></>
                        : <span className="asr_sub_text">Not set</span>
                      }
                    </td>
                    <td>
                      <span className={`asr_status_badge ${getStatusClass(r.status)}`}>
                        {r.status || "Pending"}
                      </span>
                    </td>
                    <td>
                      <div className="asr_action_btns">
                        <button className="asr_btn_edit"
                          onClick={(e) => { e.stopPropagation(); openEdit(r); }}>
                          <i className="bi bi-pencil-square"></i> Edit
                        </button>
                        <button className="asr_btn_delete"
                          onClick={(e) => { e.stopPropagation(); openDelete(r); }}>
                          <i className="bi bi-trash3-fill"></i> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredRequests.length > 0 && (
          <div className="asr_count">
            Showing {filteredRequests.length} of {requests.length} requests
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {showModal && (
        <div className="asr_modal_overlay" onClick={() => setShowModal(false)}>
          <div className="asr_modal" onClick={(e) => e.stopPropagation()}>

            <div className="asr_modal_header">
              <h3>Update Request</h3>
              <button className="asr_modal_close" onClick={() => setShowModal(false)}><i className="bi bi-x-lg"></i></button>
            </div>

            <div className="asr_modal_banner">
              <span className="asr_modal_banner_icon">
                <i className="bi bi-truck"></i>
              </span>
              <div>
                <div className="asr_modal_banner_id">Request #{selectedRequest?.request_ID}</div>
                <div className="asr_modal_banner_sub">
                  {selectedRequest?.item_type} · {selectedRequest?.resident_name || "Resident"}
                </div>
              </div>
            </div>

            {error && (
              <div className="asr_alert asr_alert_error asr_modal_alert">
                <i className="bi bi-exclamation-triangle-fill"></i> {error}
              </div>
            )}

            <div className="asr_modal_body">

              {/* Status */}
              <div className="asr_form_group">
                <label>Status</label>
                <select name="status" value={editData.status} onChange={handleEditChange}>
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              {/* Schedule Date */}
              <div className="asr_form_group">
                <label>Schedule Date {editData.status === "Scheduled" ? "*" : "(Optional)"}</label>
                <input
                  type="date"
                  name="schedule_date"
                  value={editData.schedule_date}
                  onChange={handleEditChange}
                />
              </div>

              {/* Schedule Time */}
              <div className="asr_form_group">
                <label>Schedule Time {editData.status === "Scheduled" ? "*" : "(Optional)"}</label>
                <input
                  type="time"
                  name="schedule_time"
                  value={editData.schedule_time}
                  onChange={handleEditChange}
                />
              </div>

              {/* Hint when Scheduled is selected */}
              {editData.status === "Scheduled" && (
                <div className="asr_schedule_hint">
                  <i className="bi bi-calendar-event"></i>{" "}
                  Both date and time are required when setting status to{" "}
                  <strong>Scheduled</strong>.
                </div>
              )}

            </div>

            <div className="asr_modal_footer">
              <button className="asr_btn_cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="asr_btn_save" onClick={handleUpdate}>Save Changes</button>
            </div>

          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <div className="asr_modal_overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="asr_modal asr_modal_sm" onClick={(e) => e.stopPropagation()}>

            <div className="asr_modal_header">
              <h3>Delete Request</h3>
              <button className="asr_modal_close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>

            <div className="asr_delete_body">
              <div className="asr_delete_icon">
                <i className="bi bi-trash3-fill"></i>
              </div>
              <p>Are you sure you want to delete</p>
              <strong>Request #{deleteTarget?.request_ID}</strong>
              <span>{deleteTarget?.item_type} · {deleteTarget?.resident_name}</span>
              <span className="asr_delete_warning">This action cannot be undone.</span>
            </div>

            <div className="asr_modal_footer">
              <button className="asr_btn_cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="asr_btn_confirm_delete" onClick={handleDelete}>Yes, Delete</button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
 

export default AdminSpecialRequests;