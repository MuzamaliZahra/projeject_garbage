
import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./add_bin.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";


function AddBin(){

const navigate = useNavigate();

const [formData, setFormData] = useState ({
    bin_ID: "",
    type: "",
    status: "",
    location: "",
    route_ID: "",
    QR_ID: ""
});

const [routes, setRoutes] = useState([]);
const [error, setError] = useState("");
const [success, setSuccess] = useState("");
const [loadingRoutes, setLoadingRoutes] = useState(true);
const [qrCodes, setQrCodes] = useState([]);
const [loadingQR, setLoadingQR] = useState(true)





  useEffect(() => {
    axios.get("http://localhost:5000/get-routes")
      .then(res => {
        setRoutes(res.data);
        setLoadingRoutes(false);
      })
      .catch(() => {
        setError("Failed to load routes.");
        setLoadingRoutes(false);
      });



      //fetch QR code
      axios.get("http://localhost:5000/get-qrcodes")
      .then(res => {
        setQrCodes(res.data);
        setLoadingQR(false);
      })
      .catch(() =>{
        setError("Failed to load QR codea.");
        setLoadingQR(false);
      });
  }, []);


const handleChange = (e) => {
    setFormData({...formData, [e.target.name]: e.target.value});
    setError("");
    setSuccess("");
};

const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.bin_ID || !formData.type || !formData.status ||
        !formData.location || !formData.route_ID || !formData.QR_ID) {
        setError ("All fields are required.");
        return;
    }

    axios.post("http://localhost:5000/add-bin", formData)
        .then(() => {
            setSuccess(`Bin "${formData.bin_ID}" added successfully!`);
            setFormData({bin_ID: "", type: "", status: "", location: "", route_ID: "", QR_ID: ""});
        })
        .catch(err => {
            setError(err.response?.data || "Server error. Please try again");
        });

};


const getBinIcon = () => {
    if (formData.type === "Recycling bins") return "♻️";
    if (formData.type === "Organic baste bins") return "🌿";
    if (formData.type === "Hazardous waste bins") return "☢️";
       return "🗑️";
}

return(


    <div className="ab_page">
       <AdminNavBar/>
    

        <div className="ab_body">

            {/*Page title*/}
            <div className="ab_page_title">
                <h2>Add New Bin</h2>
                <p>Register a new waste collection bin to the system</p>
            </div>

            {/* Stats Row */}
            <div className="status_row">
                <div className="status_card green">
                    <div className="status_num">🗑️</div>
                    <div className="status_label">New Bin</div>
                </div>

                <div className="status_card orange">
                    <div className="status_num">📋</div>
                    <div className="status_label">Fill All Details</div>
                </div>

                <div className="status_card blue">
                    <div className="status_num">✅</div>
                    <div className="status_label">Save to System</div>
                </div>
            </div>

            {/* Form Card */}

            <div className="ab_card">

                {/* Bin Icon */}
                <div className="ab_avatar_wrap">
                    <div className="ab_avatar">{getBinIcon()}</div>
                    <div className="ab-avatar-label">Bin Registration</div>
                </div>

                {error && <div className="ab_alert ab_alert_error"> ⚠ {error}</div>}
                {success && <div className="ab_alert ab_alert_success">✓{success}</div>}


                <form onSubmit={handleSubmit}>

                    {/* Row 1 — Bin ID & QR ID */}
                    <div className="ab_form_row">
                        <div className="ab_form_group">
                            <label>Bin ID</label>
                            <input
                                type="text"
                                name="bin_ID"
                                placeholder="e.g. B001"
                                value={formData.bin_ID}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="ab_form_group">
                            <label>QR ID</label>
                            {loadingQR ? (
                                <div className="ab_loading">Loading QR codes...</div>
                            ) : qrCodes.length === 0 ? (
                                <div className="ab_no_data">⚠ No QR codes available.</div>
                            ) : (
                                <select 
                                    name="QR_ID"
                                    value={formData.QR_ID}
                                    onChange={handleChange}
                                    required
                                    >
                                    
                                    <option value=" ">--Select QR Code--</option>
                                    {qrCodes.map(qr => (
                                        <option key={qr.QR_id} value={qr.QR_id}>
                                          📱 {qr.QR_id}  
                                        </option>
                                    ))}
                                </select>
                            )}
                        </div>
                    </div>
                    

                    {/* Row 2 — Type & Status */}
                    <div className="ab_form_row">
                        <div className="ab_form_group">
                            <label>Bin Type</label>
                            <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            required
                            >
                            
                            <option value="">--Select Bin Type--</option>
                            <option value="Recycling bins">♻️ Recycling Bins</option>
                            <option value="Organic baste bins">🌿 Organic Waste Bins</option>
                            <option value="Hazardous waste bins">☢️ Hazardous Waste Bins</option>
                            </select>
                        </div>

                        <div className="ab_form_group">
                            <label>Status</label>
                            <select
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                required
                            >
                                <option value="">--Select Status</option>
                                <option value="Empty">🟢 Empty</option>
                                <option value="Filled">🔴 Filled</option>
                            </select>
                        </div>
                    </div>
                    <div className="ab_form_group">
                        <label>Location</label>
                        <input
                            type="text"
                            name="location"
                            placeholder="e.g. Colombo 03, Main street"
                            value={formData.location}
                            onChange={handleChange}
                            required
                            />
                    </div>

                    {/* Route */}

                    <div className="ab_form_group">
                        <label>Assign Route</label>
                        {loadingRoutes ? (
                            <div className="ab_loading">Loading routes....</div>
                        ) : routes.length === 0 ? (
                            <div className="ab_no_data">⚠ No routes available. Please add a route first.</div>
                        ): (
                            <select
                            name="route_ID"
                            value={formData.route_ID}
                            onChange={handleChange}
                            required
                            >
                            
                            <option value="">--Select a Route</option>
                            {routes.map(route => (
                                <option key={route.route_ID} value={route.route_ID}>
                                 📍 {route.route_name} — ID: {route.route_ID} — {route.area_name}
                                 </option>
                            ))}
                            </select>
                        )}

                    </div>

                     {/* Preview Card */}
                     {(formData.bin_ID || formData.type || formData.location || formData.route_ID) && (
                        <div className="ab_preview">
                            <div className="ab_preview_icon">{getBinIcon()}</div>
                            <div className="ab_preview_details">
                                {formData.bin_ID && (
                                    <div className="ab_preview_row_items">
                                        <span className="ab_preview_label">Bin ID:</span>
                                        <span className="ab_preview_value">{formData.bin_ID}</span>
                                    </div>
                                )}

                                  {formData.type && (
                                    <div className="ab_preview_row_item">
                                        <span className="ab_preview_label">Type:</span>
                                        <span className="ab_preview_value">{formData.type}</span>
                                    </div>
                                )}

                                 {formData.location && (
                                    <div className="ab_preview_row_item">
                                        <span className="ab_preview_label">Location:</span>
                                        <span className="ab_preview_value">{formData.location}</span>
                                    </div>
                                )}


                                {formData.status && (
                                    <div className="ab_preview_row_item">
                                        <span className="ab_preview_label">Status:</span>
                                        <span className={`ab_preview_status ${formData.status === "Empty" ? "empty" : "filled"}`}>
                                            {formData.status === "Empty" ? "🟢 Empty" : "🔴 Filled"}
                                        </span>
                                    </div>
                                )}


                                {formData.route_ID && (
                                    <div className="ab_preview_row_item">
                                        <span className="ab_preview_label">Route:</span>
                                        <span className="ab_preview_value">
                                            {routes.find(r => r.route_ID === formData.route_ID)?.route_name}
                                        </span>
                                    </div>
                                )}

                            </div>
                        </div>

                         )}

                          <div className="ab_btn_row">
                            <button type="button" className="ab_btn_cancel" onClick={() => navigate(-1)}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="ab_btn_submit"
                               // disabled={loadingRoutes}
                            >
                                🗑️ Add Bin
                            </button>
                         </div>
                    

                </form>

            </div>
        </div>
</div>


);
}

export default AddBin;