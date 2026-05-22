import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./complaint_managment.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";

function ComplaintManagementAdmin(){

    const navigate = useNavigate();

    const [complaints, setComplaints] = useState([]);
    const [search, setSearch] = useState("");
    const[loading, setLoading] =useState(true); 
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] =useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [editStatus, setEditStatus] = useState("pending");

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [ showViewModal, setShowViewModal] = useState(false);
    const [viewTarget, setViewTarget] = useState(null);

    const fetchComplaints = () => {
     setLoading(true);
     axios.get("http://localhost:5000/get-all-complaints")   
        .then((res) => { setComplaints(res.data.complaints || res.data); setLoading(false); })
        .catch(() => { setError("Failed to load complaints"); setLoading(false); });
    };

    useEffect(() => { 
        fetchComplaints(); 
        }, []);

    const filteredComplaints = complaints.filter((c) => {
        const q = search.toLowerCase();
        return (
            (c.complaint_ID ||"").toString().toLowerCase().includes(q) ||
            (c.complaint_type || "").toLowerCase().includes(q) ||
            (c.status || "").toLowerCase().includes(q) ||
            (c.location || "").toLowerCase().includes(q) ||
            (c.resident_ID || "").toString().toLowerCase().includes(q)
        );
    });

    const getStatusClass= (status) => {
        if (!status) return "";
        if (status === "pending") return "cm_badge_pending";
        if (status === "in progress") return "cm_badge_progress";
        if (status === "completed") return "cm_badge_completed";
        return "";
    };

    const openEdit = (complaint) => {
        setSelectedComplaint(complaint);
        setEditStatus(complaint.status || "pending");
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const handleUpdate = () => {
        axios.put(`http://localhost:5000/update-complaint-status/${selectedComplaint.complaint_ID}`, {
      status: editStatus,
    })
        .then(() => {
            setSuccess(`Complaint #${selectedComplaint.complaint_ID} updated to "${editStatus}" successfully!`);
            setShowModal(false);
            fetchComplaints();
        })
        .catch((err) => setError(err.response?.data?.message || "Error updating complaint."));
};

      const openDelete = (complaint) => {
        setDeleteTarget(complaint);
        setShowDeleteModal(true);
     };

    const handleDelete = () => {
        axios.delete(`http://localhost:5000/delete-complaint/${deleteTarget.complaint_ID}`)
            .then(() => {
                setSuccess(`Complaint #${deleteTarget.complaint_ID} deleted successfully!`);
                setShowDeleteModal(false);
                fetchComplaints();
            })
            .catch(() => { setError("Error deleting complaint." ); 
                setShowDeleteModal(false);
            });
    };

    const openView = (complaint) => {
        setViewTarget(complaint);
        setShowViewModal(true);
    };

    const formatDate = (d) => (d ? d.split("T")[0] : "—");

    return(
        <div className="cm_page">

             <AdminNavBar/>

            <div className="body">

                {/* Page Header */}
                <div className="page_header">
                <div>
                    <h2>Manage Complaints</h2>
                    <p>View and update resident complaint statuses</p>
                </div>
                </div>

                {error && <div className="alert alert_error">⚠ {error}</div>}
                {success && <div className="alert alert_success">✓{success}</div>}

                {/* Stats */}
                <div className="status_row">
                    <div className="status_card blue">
                        <div className="status_num">{complaints.length}</div>
                        <div className="status_label">Total complaints</div>
                    </div>

                     <div className="status_card orange">
                        <div className="status_num">{complaints.filter((c) => c.status === "pending").length}</div>
                        <div className="status_label">Pending</div>
                    </div>

                     <div className="status_card yellow">
                        <div className="status_num">{complaints.filter((c) => c.status === "in progress").length}</div>
                        <div className="status_label">In Progress complaints</div>
                    </div>

                     <div className="status_card green">
                        <div className="status_num">{complaints.filter((c) => c.status === "completed").length}</div>
                        <div className="status_label">Completed complaints</div>
                    </div>
                </div>

                    {/*search*/}
                    <div className="cm_search_bar">
                        <span className="cm_search_icon">🔍</span>
                        <input 
                            type="text"
                            placeholder="Search by ID, type, location, resident or status..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />

                        {search && (
                            <button className="cm_clear_btn" onClick={() => setSearch("")}>✕</button>
                        )}
                    </div>

                    {/*Table*/}
                    <div className="cm_card">
                        {loading ? (
                            <div className="cm_loading">Loading Complaints...</div>
                        ): filteredComplaints.length === 0 ? (
                            <div className="cm_empty">
                                <div className="cm_empty_icon">💬</div>
                                <p>No complaints found</p>
                                <span>Try a different search term</span>
                            </div>
                        ) : (
                            <table className="cm_table">
                                <thead>
                                    <tr>
                                    <th>ID</th>
                                    <th>Resident ID</th>
                                    <th>Type</th>
                                    <th>Location</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                    </tr>
                                </thead>


                                <tbody>
                                    {filteredComplaints.map((complaint) => (
                                        <tr key={complaint.complaint_ID}>
                                        <td><span className="cm_id_badge">#{complaint.complaint_ID}</span></td>
                                        <td>{complaint.residernt_ID || "-"}</td> 
                                        <td><span className="cm_type_badge">{complaint.complaint_type || "—"}</span></td>
                                        <td>{complaint.location || "—"}</td>
                                        <td>{formatDate(complaint.date)}</td>
                                        <td>
                                            <span className={`cm_status_badge ${getStatusClass(complaint.status)}`}>
                                                {complaint.status || "—"}
                                            </span>
                                        </td>

                                        <td>
                                             <div className="cm_action_btns">
                                                <button className="cm_btn_view"
                                                onClick={(e) => { e.stopPropagation(); openView(complaint); }}>
                                                👁 View
                                                </button>
                                                <button className="cm_btn_edit"
                                                onClick={(e) => { e.stopPropagation(); openEdit(complaint); }}>
                                                ✏ Status
                                                </button>
                                                <button className="cm_btn_delete"
                                                onClick={(e) => { e.stopPropagation(); openDelete(complaint); }}>
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

                    {!loading && filteredComplaints.length > 0 && (
                        <div className="cm_count">
                            Showing {filteredComplaints.length} of {complaints.length} Complaints
                        </div>
                    )}

                </div>

                {/*view modal*/}
                {showViewModal && viewTarget && (
                    <div className="cm_modal_overlay" onClick={() => setShowViewModal(false)}>
                        <div className="cm_modal" onClick={(e) => e.stopPropagation()}>
                        
                            <div className="cm_modal_header">
                                <h3>Complaint Details</h3>
                                <button className="cm_modal_close" onClick={() => setShowViewModal(false)}>✕</button>
                            </div>

                            <div className="cm_modal_banner">
                            <span className="cm_modal_banner_icon">💬</span>
                            <div>
                                <div className="cm_modal_banner_id">#{viewTarget.complaint_ID}</div>
                                <div className="cm_modal_banner_sub">Complaint ID</div>
                            </div>
                            </div>

                            <div className="cm_modal_body">
                                <div className="cm_detail_row">
                                    <span className="cm_detail_label">Resident ID</span>
                                    <span className="cm_detail_value">{viewTarget.resident_ID || "—"}</span>
                                </div>

                                <div className="cm_detail_row">
                                    <span className="cm_detail_label">Type</span>
                                    <span className="cm_detail_value">{viewTarget.complaint_type || "—"}</span>
                                </div>

                                <div className="cm_detail_row">
                                    <span className="cm_detail_label">Location</span>
                                    <span className="cm_detail_value">{viewTarget.location || "—"}</span>
                                </div>

                                 <div className="cm_detail_row">
                                    <span className="cm_detail_label">Date</span>
                                    <span className="cm_detail_value">{formatDate(viewTarget.date)}</span>
                                </div>

                                <div className="cm_detail_row">
                                    <span className="cm_detail_label">Status</span>
                                    <span className={`cm_status_badge ${getStatusClass(viewTarget.status)}`}>
                                    {viewTarget.status || "—"}
                                    </span>
                                </div>

                                {viewTarget.description && (
                                    <div className="cm_detail_col">
                                    <span className="cm_detail_label">Description</span>
                                    <p className="cm_detail_desc">{viewTarget.description}</p>
                                    </div>
                                )}
                                {viewTarget.image && (
                                    <div className="cm_detail_col">
                                    <span className="cm_detail_label">Attached Image</span>
                                    <img
                                        src={`http://localhost:5000/uploads/${viewTarget.image}`}
                                        alt="complaint"
                                        className="cm_detail_img"
                                    />
                                    </div>
                                )}
                            </div>

                             <div className="cm_modal_footer">
                                <button className="cm_btn_cancel" onClick={() => setShowViewModal(false)}>Close</button>
                                <button className="cm_btn_save" onClick={() => { setShowViewModal(false); openEdit(viewTarget); }}>
                                    Update Status
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                
      {/* ── Edit Status Modal ── */}
      {showModal && selectedComplaint && (
        <div className="cm_modal_overlay" onClick={() => setShowModal(false)}>
          <div className="cm_modal cm_modal_sm" onClick={(e) => e.stopPropagation()}>

            <div className="cm_modal_header">
              <h3>Update Status</h3>
              <button className="cm_modal_close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="cm_modal_banner">
              <span className="cm_modal_banner_icon">💬</span>
              <div>
                <div className="cm_modal_banner_id">#{selectedComplaint.complaint_ID}</div>
                <div className="cm_modal_banner_sub">{selectedComplaint.complaint_type}</div>
              </div>
            </div>

            {error && <div className="cm_alert cm_alert_error cm_modal_alert">⚠ {error}</div>}

            <div className="cm_modal_body">

              <div className="cm_form_group">
                <label>Current Status</label>
                <span className={`cm_status_badge ${getStatusClass(selectedComplaint.status)}`}>
                  {selectedComplaint.status}
                </span>
              </div>

              <div className="cm_form_group">
                <label>Update Status To</label>
                <div className="cm_status_pills">
                  {["pending", "in progress", "completed"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`cm_status_pill ${editStatus === s ? "selected" : ""} cm_pill_${s.replace(" ", "_")}`}
                      onClick={() => setEditStatus(s)}
                    >
                      {s === "pending" && "🕐 "}
                      {s === "in progress" && "⚙️ "}
                      {s === "completed" && "✅ "}
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="cm_form_group">
                <label>Location</label>
                <input type="text" readOnly className="cm_input_readonly" value={selectedComplaint.location || "—"} />
              </div>

              <div className="cm_form_group">
                <label>Submitted Date</label>
                <input type="text" readOnly className="cm_input_readonly" value={formatDate(selectedComplaint.date)} />
              </div>

            </div>

            <div className="cm_modal_footer">
              <button className="cm_btn_cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="cm_btn_save" onClick={handleUpdate}>Save Changes</button>
            </div>

          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
      {showDeleteModal && deleteTarget && (
        <div className="cm_modal_overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="cm_modal cm_modal_sm" onClick={(e) => e.stopPropagation()}>

            <div className="cm_modal_header">
              <h3>Delete Complaint</h3>
              <button className="cm_modal_close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>

            <div className="cm_delete_body">
              <div className="cm_delete_icon">🗑️</div>
              <p>Are you sure you want to delete</p>
              <strong>Complaint #{deleteTarget.complaint_ID}</strong>
              <span>{deleteTarget.complaint_type} — {deleteTarget.location}</span>
              <span className="cm_delete_warning">This action cannot be undone.</span>
            </div>

            <div className="cm_modal_footer">
              <button className="cm_btn_cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="cm_btn_confirm_delete" onClick={handleDelete}>Yes, Delete</button>
            </div>

          </div>
        </div>
      )}




        </div>
    )

}
export default ComplaintManagementAdmin;