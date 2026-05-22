import axios from "axios";
import { useEffect, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";


const StarDisplay = ({ value }) => (
    <div className="af_stars">
        {[1, 2, 3, 4, 5].map((star) => (
            <span key= {star} className={star <= parseInt(value) ? "af_star filled" : "af_star empty"}>
                ★
            </span>
        ))}
    </div>
);


function AdminFeedback(){

    const navigate =useNavigate();
    
    const [feedbacks, setFeedbacks] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError]  = useState("")
    const [success, setSuccess]               = useState("");
    const [filterRating, setFilterRating]     = useState("all");
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget]     = useState(null);

    
 



    const fetchFeedbacks = () => {
        setLoading(true);
        axios.get("http://localhost:5000/get-feedback")
            .then(res => {
                setFeedbacks(res.data.feedback || []);
                setLoading(false);
            })

            .catch(() => {
                setError("Failed to load feedback.");
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchFeedbacks();
    }, []);


    //Filter by search and rating
    const filteredFeedbacks = feedbacks.filter( f=> {
        const matchSearch =
            (f.resident_name || "").toLowerCase().includes(search.toLowerCase()) ||
            (f.comment || "").toLowerCase().includes(search.toLowerCase()) ||
            (f.feedback_ID || "").toLowerCase().includes(search.toLowerCase());
        
        const matchRating =
            filterRating === "all" || parseInt(f.rating) === parseInt(filterRating);
        return matchSearch && matchRating;
            
    });

    //stats
    const avgRating = feedbacks.length > 0
        ? (feedbacks.reduce((sum, f) => sum + parseInt(f.rating), 0) / feedbacks.length).toFixed(1)
        : "0.0";

    const fiveStars = feedbacks.filter(f => parseInt(f.rating) === 5).length;
    const lowRatings = feedbacks.filter(f => parseInt(f.rating) <= 2).length;

    const openDelete = (feedback) => {
        setDeleteTarget(feedback);
        setShowDeleteModal(true);
    };


    const handleDelete = () => {
        axios.delete(`http://localhost:5000/delete-feedback/${deleteTarget.feedback_ID}`)
            .then(() => {
                setSuccess(`Feedback "${deleteTarget.feedback_ID}"deleted successfully`);
                setShowDeleteModal(false);
                setDeleteTarget(null);
                fetchFeedbacks();
            })

            .catch(err => {
                setError(err.response?.data || "Error deletinf feedback.");
                setShowDeleteModal(false);
            });
    };

    



return(
<div className="bm_page">

     <AdminNavBar/>
      <div className="body">

        <div className="page_header">
          <div>
            <h2>Manage Feedback</h2>
            <p>View and delete resident feedback & ratings</p>
          </div>
          <button className="add_btn" onClick={fetchFeedbacks}>
            Refresh
          </button>
        </div>

        {/* Stats Row */}
        <div className="status_row">
          <div className="status_card green">
            <div className="status_num">{feedbacks.length}</div>
            <div className="status_label">Total Feedback</div>
          </div>
          <div className="status_card blue">
            <div className="status_num">{avgRating} </div>
            <div className="status_label">Average Rating</div>
          </div>
          <div className="status_card orange">
            <div className="status_num">{fiveStars}</div>
            <div className="status_label">5 Star Reviews</div>
          </div>
          <div className="status_card yellow">
            <div className="status_num">{lowRatings}</div>
            <div className="status_label">Low Ratings (≤2)</div>
          </div>
        </div>

        {/* Alerts */}
        {error   && <div className="alert alert_error">⚠ {error}</div>}
        {success && <div className="alert balert_success">✓ {success}</div>}


        

        {/* Search & Filter Bar */}
        <div className="af_filter_row">
          <div className="search_bar" style={{ flex: 1 }}>
            <span className="search_icon">🔍</span>
            <input
              type="text"
              placeholder="Search by name, comment or feedback ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            {search && (
              <button className="clear_btn" onClick={() => setSearch("")}>✕</button>
            )}
          </div>

            <select
                    className="af_rating_filter"
                    value={filterRating}
                    onChange={(e) => setFilterRating (e.target.value)}
                >
                    <option value="all">⭐ All Ratings</option>
                    <option value="5">⭐⭐⭐⭐⭐ 5 Stars</option>
                    <option value="4">⭐⭐⭐⭐ 4 Stars</option>
                    <option value="3">⭐⭐⭐ 3 Stars</option>
                    <option value="2">⭐⭐ 2 Stars</option>
                    <option value="1">⭐ 1 Star</option>
            
            </select>
        </div>

             {/* Table Card */}
        <div className="bm_card">
          {loading ? (
            <div className="bm_loading">Loading feedback...</div>
          ) : filteredFeedbacks.length === 0 ? (
            <div className="bm_empty">
              <div className="bm_empty_icon">⭐</div>
              <p>No feedback found</p>
              <span>Try a different search or filter</span>
            </div>
          ) : (
            <table className="bm_table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Resident</th>
                  <th>Comment</th>
                  <th>Rating</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedbacks.map(f => (
                  <tr key={f.feedback_ID}>
                    <td>
                      <span className="bm_id_badge">{f.feedback_ID}</span>
                    </td>
                    <td>
                      <div className="bm_route_cell">
                        <div className="bm_route_name">
                          {f.resident_name || `Resident #${f.resident_ID}`}
                        </div>
                        <div className="bm_route_id">ID: {f.resident_ID}</div>
                      </div>
                    </td>
                    <td className="af_comment_cell">
                      {f.comment
                        ? f.comment
                        : <span className="af_no_comment">No comment provided</span>}
                    </td>
                    <td>
                      <StarDisplay value={f.rating} />
                      <span className="af_rating_num">{f.rating}/5</span>
                    </td>
                    <td>
                      {f.submitted_date ? f.submitted_date.split("T")[0] : "—"}
                    </td>
                    <td>
                      <div className="bm_action_btns">
                        <button
                          className="bm_btn_delete"
                          onClick={() => openDelete(f)}
                        >
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

        {!loading && filteredFeedbacks.length > 0 && (
          <div className="bm_count">
            Showing {filteredFeedbacks.length} of {feedbacks.length} feedback entries
          </div>
        )}


        {/* Delete Modal */}
        {showDeleteModal && (
          <div className="bm_modal_overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="bm_modal bm_modal_sm" onClick={(e) => e.stopPropagation()}>

              <div className="bm_modal_header">
                <h3>Delete Feedback</h3>
                <button className="bm_modal_close" onClick={() => setShowDeleteModal(false)}>✕</button>
              </div>

              <div className="bm_delete_body">
                <div className="bm_delete_icon">⭐</div>
                <p>Are you sure you want to delete feedback</p>
                <strong>"{deleteTarget?.feedback_ID}"</strong>
                <span>
                  {deleteTarget?.resident_name || `Resident #${deleteTarget?.resident_ID}`}
                </span>
                <StarDisplay value={deleteTarget?.rating} />
                <span style={{ color: "#e53935", fontSize: "12px" }}>
                  This action cannot be undone.
                </span>
              </div>

              <div className="bm_modal_footer">
                <button className="bm_btn_cancel" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="bm_btn_confirm_delete" onClick={handleDelete}>
                  Yes, Delete
                </button>
              </div>

            </div>
          </div>
        )}




      </div>


</div>
);

}

export default AdminFeedback;