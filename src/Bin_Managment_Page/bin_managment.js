import axios from "axios";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./bin_managment.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";
function ManageBin() { 
    const navigate = useNavigate();
    const [bins, setBins] = useState([]);
    const [routes, setRoutes] = useState([]);
    const [qrCodes, setQrCodes]= useState([]);
    const [search, setSearch] = useState ("");
    const [loading, setLoading] = useState ("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedBin, setSelectedBin] = useState(null);
    const [editData, setEditData] = useState({});
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    // Fetch all bins
      const fetchBins = () => {
        setLoading(true);
        axios.get("http://localhost:5000/get-bins")
          .then(res => {
            setBins(res.data);
            setLoading(false);
          })
          .catch(() => {
            setError("Failed to load bins.");
            setLoading(false);
          });
      };

    //Fetcj all routes
    const fetchRoutes =() => {
        axios.get("http://localhost:5000/get-routes")
            .then(res => 
                setRoutes(res.data))
            .catch(() => 
                console.log("Failed to load routes."));
    };
    // Fetch all QR codes
    const fetchQRCodes = () => {
        axios.get("http://localhost:5000/get-qrcodes")
            .then(res => 
                setQrCodes(res.data))
            .catch(() => 
                console.log ("Failed to load QR codes"));
    };
    useEffect(() => {
        fetchBins();
        fetchRoutes();
        fetchQRCodes();
    }, []);
    //Filter bins by search
    const filteredBins = bins.filter (b => 
        (b.bin_ID || "").toLowerCase().includes(search.toLowerCase()) ||
        (b.type || "").toLowerCase().include(search.toLowerCase()) ||
        (b.location || "").toLowerCase().includes(search.toLowerCase()) ||
        (b.route_ID || "").toLowerCase().includes(search.toLowerCase()) ||
        (b.status ||"").toLowerCase().includes(search.toLowerCase())
    );
    // Get route name by ID
    const getRouteName = (route_ID) => {
        const route = routes.find(r => r.route_ID === route_ID);
        return route ? route.route_name : route_ID;
    };
     // Bin type icon
   const getBinIcon = (type) => {
    if (type === "Recycling bins") {
        return <i className="bi bi-recycle"></i>;
    }
    if (type === "Organic baste bins") {
        return <i className="bi bi-flower1"></i>;
    }
    if (type === "Hazardous waste bins") {
        return <i className="bi bi-exclamation-octagon-fill"></i>;
    }
    return <i className="bi bi-trash-fill"></i>;
};
    const formatDate = (d) => d? d.split("T")[0] : "-";
    const formatTime = (t) => t ? t.slice(0,5) : "-";
    //count by status
    const emptyCount = bins.filter(b => b.status === "Empty").length;
    const filledCount = bins.filter(b => b.status === "Filled").length;
    //Open edit modal
    const openEdit = (bin) => {
        setSelectedBin(bin);
        setEditData({
            type: bin.type,
            status: bin.status,
            location: bin.location,
            route_ID: bin.route_ID,
            QR_ID: bin.QR_ID,
            lst_clctn_date: bin.lst_clctn_date ? bin.lst_clctn_date.split("T")[0] : "",
            lst_clctn_time: bin.lst_clctn_time ? bin.lst_clctn_time.slice(0, 5) : "",
        });
        setShowModal(true);
        setError("");
        setSuccess("");
    };
    const handleEditChange =(e) => {
        setEditData({...editData, [e.target.name]: e.target.value});
    };
    //submit edit
    const handleUpdate = () => {
        if (!editData.type || !editData.status || !editData.location ||
            !editData.route_ID || !editData.QR_ID) {
        setError ("All fields are required");
        return;
     }
     axios.put(`http://localhost:5000/update-bin/${selectedBin.bin_ID}`, editData)
        .then(() => {
            setSuccess(`Bin "${selectedBin.bin_ID}" updated successfully!`);
            setShowModal(false);
            fetchBins();
        })
        .catch(err => {
            setError(err.response?.data || "Error updating bin.");
        });  
    };
    //Open delete modal
    const openDelete = (bin) => {
        setDeleteTarget(bin);
        setShowDeleteModal(true);
    };
     // Confirm delete
      const handleDelete = () => {
        axios.delete(`http://localhost:5000/delete-bin/${deleteTarget.bin_ID}`)
          .then(() => {
            setSuccess(`Bin "${deleteTarget.bin_ID}" deleted successfully!`);
            setShowDeleteModal(false);
            setDeleteTarget(null);
            fetchBins();
          })
          .catch(err => {
            setError(err.response?.data || "Error deleting bin.");
            setShowDeleteModal(false);
          });
      };


    return(
        <div className="bm_page">
             <AdminNavBar/>

            

            <div className="body">
                {/*Page header*/}
                <div className="page_header">
                    <div>
                        <h2>Manage Bins</h2>
                        <p>View, edit and delete garbage collection bins</p>
                    </div>

                    <button className="add_btn" onClick={() => navigate("/add_bin")}>
                        + Add Bin
                    </button>
                </div>

                {/* Stats Row */}
                <div className="status_row">
                    <div className="status_card green">
                        <div className="status_num">{bins.length}</div>
                        <div className="status_label">Total Bins</div>
                    </div>

                    <div className="status_card orange">
                        <div className="status_num">{filledCount}</div>
                        <div className="status_label">Filled Bins</div>
                    </div>

                    <div className="status_card blue">
                        <div className="status_num">{emptyCount}</div>
                        <div className="status_label">Empty Bins</div>
                    </div>
                </div>

                {/* Alerts */}

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

                {/*search bar*/}
                <div className="search_bar">
                    <span className="search_icon"><i className="bi bi-search"></i></span>
                    <input 
                        type="text"
                        placeholder="Search by bin ID, type, location, route or status..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value) }
                    />

                    {search && (
                        <button className="clear_btn" onClick={() => setSearch("")}> <i className="bi bi-x-lg"></i></button>
                    )}
                </div>

                {/*Table Card*/}
                <div className="card">
                    {loading? (
                        <div className="loading">Loading bins...</div>
                    ): filteredBins.length === 0 ? (
                        <div className="empty">
                            <div className="empty_icon"><i className="bi bi-trash3-fill"></i></div>
                            <p>No bins found</p>
                            <span>Try a different search or add a new bin</span>
                        </div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Type</th>
                                    <th>Bin ID</th>
                                    <th>Location</th>
                                    <th>Route</th>
                                    <th>QR ID</th>
                                    <th>Status</th>
                                    <th>Last Collection</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>

                            <tbody>
                                {filteredBins.map(bin =>(
                                    <tr key={bin.bin_ID}>
                                        <td>
                                            <div className="icon_cell">
                                                {getBinIcon(bin.type)}
                                            </div>
                                        </td>

                                        <td>
                                            <span className="id_badge">{bin.bin_ID}</span>
                                        </td>

                                        <td>
                                            <div className="bm_location_cell">
                                                <div className="bm_location_name">{bin.location}</div>
                                            </div>
                                        </td>

                                        <td>
                                            <div className="bm_route_cell">
                                                <div className="bm_route_name">{getRouteName(bin.route_ID)}</div>
                                                <div className="bm_route_id">ID: {bin.route_ID}</div>
                                            </div>
                                        </td>

                                        <td>
                                            <span className="bm_qr_badge"><i className="bi bi-qr-code-scan"></i> {bin.QR_ID}</span>
                                        </td>

                                        <td>
                                            <span
                                                className={`bm_status_badge ${
                                                    bin.status === "Empty" ? "empty" : "filled"
                                                }`}
                                                >
                                                {bin.status === "Empty" ? (
                                                    <>
                                                    <i className="bi bi-circle-fill"></i> Empty
                                                    </>
                                                ) : (
                                                    <>
                                                    <i className="bi bi-circle-fill"></i> Filled
                                                    </>
                                                )}
                                                </span>
                                        </td>

                                        <td>
                                            <div className="bm_collection_cell">
                                                {bin.lst_clctn_date || bin.lst_clctn_time ? (
                                                    <>
                                                        <div className="bm_collection_date">
                                                            <i className="bi bi-calendar-event"></i> {formatDate(bin.lst_clctn_date)}
                                                        </div>

                                                        <div className="bm_collection_time">
                                                            <i className="bi bi-clock"></i> {formatTime(bin.lst_clctn_time)}
                                                        </div>
                                                    </>
                                                
                                                ) :(
                                                    <span className="bm_no_collection">Not collected yet</span>
                                               
                                                )}
                                            </div>
                                        </td>

                                        <td>
                                            <div className="action_btns">
                                                <button className="btn_edit" onClick={() => openEdit(bin)}>
                                                       <i className="bi bi-pencil-square"></i>
                                                </button>

                                                <button className="btn_delete" onClick={() => openDelete(bin)}>
                                                   <i className="bi bi-trash-fill"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                 {!loading && filteredBins.length > 0 && (
                    <div className="bm_count">
                        Showing {filteredBins.length} of {bins.length} bins
                    </div>
                    )}

                {/* ── Edit Modal ── */}

                {showModal && (
                    <div className="bm_modal_overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="bm_modal" onClick={(e) => e.stopPropagation()}>
                        
                        <div className="bm_modal_header">
                            <h3>Edit Bin</h3>
                            <button className="bm_modal_close" onClick={() => setShowModal(false)}> <i className="bi bi-x-lg"></i></button>
                        </div>

                        <div className="bm_modal_bin_icon">
                            <div className="bm_modal_icon">{getBinIcon(selectedBin?.type)}</div>
                            <span>Bin ID: {selectedBin?.bin_ID}</span>
                        </div>

                        {error && <div className="bm_alert bm_alert_error" style={{margin: "0.1.5 rem"}}> <i className="bi bi-exclamation-triangle-fill"></i>{error}</div>}

                        <div className="bm_modal_body">
                            {/*Type & status*/}
                            <div className="bm_modal_row">
                                <div className="bm_form_grop">
                                    <label>Bin Type</label>
                                    <select name="type" value={editData.type} onChange={handleEditChange}>
                                        <option value="">--- Select Type--- </option>
                                        <option value="Recycling bins"> Recycling Bins</option>
                                        <option value="Organic baste bins"> Organic Waste Bins</option>
                                        <option value="Hazardous waste bins"> Hazardous Waste Bins</option>
                                    </select>
                                </div>
                                <div className="bm_form_group">
                                    <label>Status</label>
                                    <select name="status" value={editData.status} onChange={handleEditChange}>
                                        <option value="">-- Select Status --</option>
                                        <option value="Empty"> Empty</option>
                                        <option value="Filled">Filled</option>
                                    </select>
                                </div>
                            </div>

                            {/*Location*/}
                            <div className="bm_form_group">
                                <label>Location</label>
                                <input
                                    type="text"
                                    name="location"
                                    value={editData.location}
                                    onChange={handleEditChange}
                                    placeholder="e.g. colombo 03, Main Street"
                                />  
                            </div>

                            {/*Route*/}
                            <div className="bm_form_group">
                                <label>Assign Route</label>
                                <select name="route_ID" value={editData.route_ID} onChange={handleEditChange}>
                                <option value="">--Select Route--</option>
                                {routes.map(route => (
                                    <option key= {route.route_ID} value={route.route_ID}>
                                        {route.route_name} - {route.route_ID}
                                    </option>
                                ))}
                                </select>
                            </div>

                            {/*QR ID*/}
                            <div className="bm_form_group">
                                <label>QR ID</label>
                                <select name="QR_ID" value={editData.QR_ID} onChange={handleEditChange}>
                                    <option value="">--Select QR Code--</option>
                                    {qrCodes.map(qr => (
                                        <option key={qr.QR_id} value={qr.QR_id}>
                                             {qr.QR_id}
                                        </option>
                                    ))}
                                </select>
                            </div>   
                                        
                             <div className="bm_collection_section">
                                    <div className="bm_collection_label"> <i className="bi bi-card-checklist"></i> Last Collection Info</div>
                                    <div className="bm_modal_row">
                                        <div className="bm_form_group">
                                            <label>Last Collection Date</label>
                                            <input
                                                type="date"
                                                name="lst_clctn_date"
                                                value={editData.lst_clctn_date}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                        <div className="bm_form_group">
                                            <label>Last Collection Time</label>
                                            <input
                                                type="time"
                                                name="lst_clctn_time"
                                                value={editData.lst_clctn_time}
                                                onChange={handleEditChange}
                                            />
                                        </div>
                                    </div>
                                </div>

                            <div className="bm_modal_footer">
                                <button className="bm_btn_cancel" onClick={() => setShowModal(false)}>Cancel</button>
                                <button className="bm_btn_save" onClick={handleUpdate}>Save Changes</button>
                            </div>

                        </div>
                        </div>
                        </div>
                    //===//
                )}

                {/*Delete Modal*/}

                {showDeleteModal && (
                    <div className="bm_modal_overlay" onClick={() => setShowDeleteModal(false)}>
                        <div className="bm_modal bm_modal_sm" onClick={(e) => e.stopPropagation() }>
                        
                            <div className="bm_modal_header">
                                <h3>Delete Bin</h3>
                                <button className="bm_modal_close" onClick={() => setShowDeleteModal(false)}><i className="bi bi-x-lg"></i></button>
                            </div>

                            <div className="bm_delete_body">
                                <div className="bm_delete_icon"><i className="bi bi-trash3-fill"></i></div>
                                <p>Are you sure you want to delete</p>
                                <strong>"{deleteTarget?.bin_ID}"</strong>
                                <span>{deleteTarget?.location}</span>
                                <span style={{color: "#e53935", fontSize: "12px"}}>This action cannot be undone.</span>
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

export default ManageBin;
 