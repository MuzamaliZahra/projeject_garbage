import axios from "axios";
import React, { useEffect, useState } from "react";
import { data, useNavigate } from "react-router-dom";
import "./qr_code_manage.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";



function ManageQRCode(){

    const navigate = useNavigate();
    const [qrCodes, setQrCodes] = useState([]);
    const [search, setSearch] =useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedQR, setSelectedQR] = useState(null);
    const [editData, setEditData] = useState({data: ""});

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);


    const fetchQRCodes =() => {
        setLoading(true);
        axios.get("http://localhost:5000/get-qrcodes")
            .then(res => {setQrCodes(res.data); setLoading(false); })
            .catch(() => { setError("Failed to load QR codes."); setLoading(false) });
    }

    


    useEffect(() => {
    fetchQRCodes();
}, []);


    const filteredQR = qrCodes.filter(q =>
        (q.QR_id || "").toLowerCase().includes(search.toLowerCase()) ||
        (q.data || "").toLowerCase().includes(search.toLowerCase())
    );

    // generate new qr code
    const generateNewData = () => {
        const timestamp = Date.now();
        const rand = Math.random().toString(36).substring(2,8).toUpperCase();
        setEditData({ data: `CLEANLAND-BIN-${rand}-${timestamp}` });
    };


    //open edit model
    const openEdit = (qr) => {
        setSelectedQR(qr);
        setEditData({data: qr.data});
        setShowModal(true);
        setError("");
        setSuccess("");
    };


    const handleEditChange = (e) => {
        setEditData({...editData, [e.target.name]: e.target.value});
    };

    const handleUpdate = () => {
        if (!editData.data) {
            setError("Data fields are required");
            return;
        }

        axios.put(`http://localhost:5000/update-qrcode/${selectedQR.QR_id}`, editData)
            .then(() => {
                setSuccess(`QR Code "${selectedQR.QR_id}" updated successfully!`);
                setShowModal(false);
                fetchQRCodes();
            })

    };

    const openDelete = (qr) => {
        setDeleteTarget(qr);
        setShowDeleteModal(true);
    };

    const handleDelete = () => {
        axios.delete(`http://localhost:5000/delete-qrcode/${deleteTarget.QR_id}`)
            .then(() => {
                setSuccess(`QR Code "${deleteTarget.QR_id}" delete successfully!`);
                setShowDeleteModal(false);
                setDeleteTarget(null);
                fetchQRCodes();
            })
            .catch(err => {
                setError(err.response?.data || "Error deleting QR code.");
                setShowModal(false);
            });
    };
 



    return(
        <div className="qm_page">
               <AdminNavBar/>

            <div className="body">

                {/*page header*/}
                <div className="page_header">
                    <div>
                        <h2>Mnsge QR Codes</h2>
                        <p>View, edit and delete QR codes assigned to bins</p>
                    </div>
                    <button className="add_btn" onClick={() => navigate("/add_qrcode")}>
                        + Add QR Code
                    </button>
                </div>


                {/* Stats Row */}
                <div className="status_row">
                    <div className="status_card green">
                        <div className="status_num">{qrCodes.length}</div>
                        <div className="status_label">Search Results</div>
                    </div>

                    <div className="status_card orange">
                        <div className="status_num">{filteredQR.length}</div>
                        <div className="status_label">Search Results</div>
                    </div>

                    <div className="status_card blue">
                        <div className="status_num">📱</div>
                        <div className="status_label">Active Codes</div>
                    </div>
                </div>

                {/* Alerts */}

                {error && <div className="alert alert_error">⚠{error}</div>}
                {success && <div className="alert alert_success">✓{success}</div>}
                

                {/*search bar*/}

                <div className="search_bar">
                    <span className="search_icon">🔍</span>
                    <input 
                        type="text"
                        placeholder="Search by QR ID or data..." 
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />

                    {search && (
                        <button className="clear_btn" onClick={() => setSearch("")}>✕</button>
                    )}
                </div>

                {/*Table card*/}
                <div className="qm_card">
                    {loading ? (
                        <div className="qm_loading">Loading QR codes...</div>
                    ) : filteredQR.length === 0 ? (
                        <div className="qm_empty">
                            <div className="qm_empty_icob">📱</div>
                            <p>No QR codes found</p>
                            <span>Try a different search or add a new QR code</span>
                        </div>
                    ) : (
                        <table className="qm_table">
                            <thead>
                                <tr>
                                    <th>Icon</th>
                                    <th>QR ID</th>
                                    <th>Data</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredQR.map(qr => (
                                    <tr key= {qr.QR_id}>
                                        <td>
                                            <div className="qm_qr_icon_cell">📱</div>
                                        </td>

                                        <td>
                                            <span className="qm_id_badge">{qr.QR_id}</span>
                                        </td>

                                        <td>
                                            <div className="qm_data_cell">{qr.data}</div>
                                        </td>
                                        <td>
                                            <div className="qm_action_btns">
                                                <button className="qm_btn_edit" onClick={() => openEdit(qr)}>
                                                    ✏ Edit
                                                </button>

                                                <button className="qm_btn_delete" onClick={() => openDelete(qr)}>
                                                    🗑 Delete
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) }
                </div>

                {!loading && filteredQR.length > 0 && (
                    <div className="qm_count">
                        Showing {filteredQR.length} of {qrCodes.length} QR codes
                    </div>
                )}

                {/* Edit modal*/}

                {showModal && (
                    <div className="qm_modal_overlay" onClick={() => setShowModal(false)}>
                        <div className="qm_modal" onClick={(e) => e.stopPropagation()}>
                            <div className="qm_modal_header">
                                <h3>Edit QR Code</h3>
                                <button className="qm_modal_close" onClick={() => setShowModal(false)}>✕</button>
                            </div>

                            <div className="qm_modal_qr_icon">
                                <div className="qm_modal_icon">📱</div>
                                <span>QR ID: {selectedQR.QR_id}</span>
                            </div>

                            {error && (
                                <div className="qm_alert qm_alert_error" style={{ margin: "0 1.5rem" }}>
                                ⚠ {error}
                                </div>
                            )}


                            <div className="qm_modal_body">
                                <div className="qm_form_group">
                                <label>QR ID <span style={{ color: "#aaa", fontWeight: 400 }}>(cannot be changed)</span></label>
                                <input
                                    type="text"
                                    value={selectedQR?.QR_id}
                                    disabled
                                    style={{ background: "#f5f5f5", color: "#999", cursor: "not-allowed" }}
                                />
                                </div>

                                <div className="qm_form_group">
                                    <label>QR Data</label>
                                    <div className="qm_input_with_btn">
                                        <input
                                        type="text"
                                        name="data"
                                        value={editData.data}
                                        onChange={handleEditChange}
                                        placeholder="Enter QR data"
                                        />

                                        <button type="button" className="qm_inline_btn" onClick={generateNewData}>
                                        🔄 Generate
                                        </button>

                                        </div>
                                    </div>
                                </div>

                                <div className="qm_modal_footer">
                                    <button className="qm_btn_cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                    <button className="qm_btn_save" onClick={handleUpdate}>Save Changes</button>
                                </div>

                        </div>
                    </div>
                )}

                {/* ── Delete Modal ── */}
        {showDeleteModal && (
          <div className="qm_modal_overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="qm_modal qm_modal_sm" onClick={(e) => e.stopPropagation()}>

              <div className="qm_modal_header">
                <h3>Delete QR Code</h3>
                <button className="qm_modal_close" onClick={() => setShowDeleteModal(false)}>✕</button>
              </div>

              <div className="qm_delete_body">
                <div className="qm_delete_icon">🗑️</div>
                <p>Are you sure you want to delete</p>
                <strong>"{deleteTarget?.QR_id}"</strong>
                <span style={{ fontSize: "12px", color: "#888", wordBreak: "break-all" }}>
                  {deleteTarget?.data}
                </span>
                <span style={{ color: "#e53935", fontSize: "12px" }}>
                  This action cannot be undone.
                </span>
              </div>

              <div className="qm_modal_footer">
                <button className="qm_btn_cancel" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
                <button className="qm_btn_confirm_delete" onClick={handleDelete}>
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
export default ManageQRCode;