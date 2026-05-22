import React, { useEffect, useRef, useState } from "react";
import "./complaints.css";
import NavBar from "../Navigation_Bar_Page/Navigation";
import Footer from "../Footer_Page/Footer";


const API_BASE = "http://localhost:5000";

const getResidentID = () => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    return user.id || null;
  } catch {
    return null;
  }
  };

  const StatusBadge = ({ status }) => {
    const cls = 
      status === "pending" ? "complaint_pending"
      : status === "in progress" ? "complaint_progress"
      : status === "completed" ? "complaint_completed"
      : "";
    return <span className={`complaint_status ${cls}`}>{status}</span>;
  };

const ComplaintManagement = () => {

  const residentID = getResidentID();

  const [showForm, setShowForm]     =useState(false);
  const [complaintType, setComplaintType] = useState("missed pickup");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileInputRef    = useRef(null);

  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]     =useState("");
  const [successMsg, setSuccessMsg] =useState("");

    useEffect(() => {
      if (residentID) fetchComplaints();
    }, []);


  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await fetch (`${API_BASE}/get-complaints/${residentID}`);
      const data = await res.json();
      if (data.success) setComplaints(data.complaints);
    } catch {
      setError("Failed to load complaints. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  const handleImageChange = (e) => {
    const file = e.target.files [0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const resetForm = () => {
    setComplaintType("missed pickup");
    setLocation("");
    setDescription("");
    setDate(new Date().toISOString().split("T")[0]);
    setImageFile(null);
    setImagePreview(null);
    setError("");
  };

  const handleSubmit = async () => {
    setError("");
    setSuccessMsg("");

    if (!residentID) {
      setError("You must be logged in as a resident to submit a complaint.");
      return;
    }

    if (!location.trim()) {
      setError("Please enter a location.");
      return;
    }

    const formData = new FormData();
    formData.append("complaint_type", complaintType);
    formData.append("description", description);
    formData.append("location", location);
    formData.append("date", date);
    formData.append("resident_ID", residentID);
    if (imageFile) formData.append("image", imageFile);

    setSubmitting(true);
    try {
      const res = await fetch (`${API_BASE}/submit-complaint`, {method: "POST", body: formData});
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(`Complaint ${data.complaint_ID} submitted successfully!`);
        resetForm();
        setShowForm(false);
        fetchComplaints();
      } else {
        setError(data.message || "Failed to submit complaint.");
      }
    } catch {
        setError("Network error. Please check your connection.");
      } finally {
        setSubmitting(false);
      }
    };

  return (
    <div className="complaint_page">
        <NavBar />
      <div className="complaint_page_container">

        {/* Header */}
        <div className="complaint_page_header">
          <div>
            <h1>💬 Complaint Management</h1>
            <p>Submit and track your complaints</p>
          </div>
          <button className="submit_button" onClick={() => {setShowForm(!showForm); setError(""); setSuccessMsg("");}}>
            {showForm ? "✕ Close Form" : "+ Submit New Complaint"}
          </button>
        </div>


        {successMsg && <div className="complaint_banner complaint_banner_success">✅ {successMsg}</div>}
        {error && <div className="complaint_banner complaint_banner_error">⚠️ {error}</div>}


        {/* FORM CARD */}
        {showForm &&(
        <div className="new_complaint">
          <h2>Submit New Complaint</h2>

          <div className="new_complaint_part">
            <label>Complaint Type</label>
            <select value={complaintType} onChange={(e) => setComplaintType(e.target.value)}> 
              <option>Missed Pickup</option>
              <option>Overflowing Bin</option>
              <option>Damaged Bin</option>
              <option>Other</option>
            </select>
          </div>

          <div className="new_complaint_part">
            <label>Location</label>
            <input placeholder="Enter location" value={location}
            onChange={(e) => setLocation(e.target.value)} />
          </div>

          <div className="new_complaint_part">
            <label>Date</label>
            <input type="date" value={date}
            max={new Date().toISOString().split("T")[0]}
            onChange={(e) => setImmediate(e.target.value)}/>
          </div>

          <div className="new_complaint_part">
            <label>Description</label>
            <textarea placeholder="Describe the issue" rows={4}
              value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="new_complaint_part">
            <label>Upload Image</label>
             <div className="complaint_image" onClick={() => fileInputRef.current?.click()}
                style={{ cursor: "pointer" }}>
                {imagePreview
                  ? <img src={imagePreview} alt="Preview"
                      style={{ maxHeight: 160, borderRadius: 6, objectFit: "cover" }} />
                  : <>📷 Click to upload image</>}
              </div>

              <input ref={fileInputRef} type="file" accept="image/*"
                style={{display: "none"}} onChange={handleImageChange} />
                {imageFile && <p style={{ fontSize: 12, color: "#6b7280", marginTop: 4}}>
                  Selected: {imageFile.name}</p>}
             </div>     

          <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
              <button className="submit_button" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit"}
              </button>
              <button className="complaint-button-outline" disabled={submitting}
                onClick={() => { resetForm(); setShowForm(false); }}>
                Cancel
              </button>
            </div>
        </div>

        )}

        {/* TABLE CARD (NOW GUARANTEED BELOW) */}
        <div className="complaints">
          <h2>My Complaints</h2>
        
        {loading ? (<p className="complaint_loading">Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <p className="complaint_empty">No complaints found. Submit one above!</p>
        ) : (
          

          <table className="complaint_table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Location</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) =>(
              <tr key={c.complaint_ID}>
                <td>{c.complaint_ID}</td>
                <td className="complaint_type_cell">{c.complaint_type}</td>
                <td>{c.location}</td>
                <td>{c.date ? c.date.split("T")[0] : "-"}</td>
                <td>
                 <span className={`complaint_status ${
                c.status === "pending" ? "complaint_pending"
                : c.status === "in progress" ? "complaint_progress"
                : c.status === "completed" ? "complaint_completed"
                : ""
              }`}>
                {c.status}
              </span>
              </td>
              </tr>
              ))}
             
            </tbody>
          </table>
        )}
        </div>

      </div>
      <Footer/>
    </div>
  );
};

export default ComplaintManagement;
