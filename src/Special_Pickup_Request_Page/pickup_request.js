import { useEffect, useState } from "react";
import NavBar from "../Navigation_Bar_Page/Navigation";
import Footer from "../Footer_Page/Footer";
import "./pickup_requesr.css"


const API_BASE = "http://localhost:5000";

const getResidentID = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").id || null;
  } catch { return null; }
};

const ITEM_TYPES = ["Furniture","Construction Waste", "Electronics", "Appliances", "Mattress", "Other"];

const STATUS_CLASS = {
    Pending:   "sr_status_pending",
    Scheduled: "sr_status_scheduled",
    Completed: "sr_status_completed",
    Rejected:  "sr_status_rejected",
}


function SpecialRequest() {

    const residentID = getResidentID();

    //form state
    const [form, setForm] = useState({
        location: "",
        email: "",
        address: "",
        description: "",
        item_type: "",
         request_date: "",
        request_time: "",
    });

    const [submitting, setSubmitting] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [error, setError] = useState("");

    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (residentID) fetchMyRequests();
    }, []);

    const fetchMyRequests = async () => {
        setLoading(true);
        try {
            const res = await fetch (`${API_BASE}/special-requests/${residentID}`);
            const data = await res.json();
            setRequests(data.success ? (data.requests || []) : []);
        }   catch {
            setRequests([]);
        }   finally {
            setLoading(false);
        }
    };



    const handleChange = (e) => {
        setForm((prev) => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleSubmit = async () => {
        setError("");
        setSuccessMsg("");

        if (!residentID) {
            setError("You must be logged in to submi a request.");
            return;
        }

        const required = ["location", "email", "address", "item_type", "request_date", "request_time"];
        for (const field of required) {
            if (!form[field].trim()) {
                setError(`Please fill in the "${field.replace("_", " ")}" field.`);
                return;
            }
        }

        setSubmitting(true);
        try {
            const res = await fetch (`${API_BASE}/special-requests`,{
                method: "POST",
                headers: { "Content-Type": "application/json"},
                body: JSON.stringify({...form, resident_ID: residentID}),
            });

            const data = await res.json();

            if (data.success) {
                setSuccessMsg("Your special pickup request has been submitted!");
                setForm({location: "", email: "", address: "", description: "", item_type: "", request_date: "", request_time: ""});
                fetchMyRequests();
            } else {
                setError(data.message || "Failed to submit request.");
            }

        } catch {
            setError("Network error.Please try again.");
        }   finally {
            setSubmitting(false);
        }
    };

return(
    <div>
        <NavBar />

        <div className="sr_page">


            <h1 className="sr_page_title">
                <i className="bi bi-truck me-2"></i>
                Special Garbage Pickup
            </h1>
            <p className="sr_page_subtitle">Request a special collection for bulky or unusual items</p>
        

            {successMsg && (
            <div className="sr_banner sr_success">
                <i className="bi bi-check-circle-fill me-2"></i>
                {successMsg}
            </div>
            )}

        {error && (
        <div className="sr_banner sr_error">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
        </div>
        )}

        {/* form card*/}

        <div className="sr_form_card">
            <h2>New Pickup Request</h2>

            <div className="sr_form_grid">

                <div className="sr_form_group">
                    <label>Location *</label>
                    <input name="location" placeholder="e.g. Colombo 05" value={form.location} onChange={handleChange}/>
                </div>

                <div className="sr_form_group">
                    <label>Email *</label>
                    <input name="email" type="email" placeholder="your@email.com" value={form.email} onChange={handleChange}/>
                </div>

                 <div className="sr_form_group sr_full">
                    <label>Address *</label>
                    <input name="address" placeholder="Full pickup address" value={form.address} onChange={handleChange} />
                </div>

                <div className="sr_form_group">
                    <label>Item Type</label>
                    <select name="item_type" value={form.item_type} onChange={handleChange}>
                        <option value=" ">Select item type</option>
                        {ITEM_TYPES.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                <div className="sr_form_group">
                    <label>Preferred Date *</label>
                    <input name="request_date" type="date" value={form.request_date} onChange={handleChange} />    
                </div>

                <div className="sr_form_group">
                    <label>Preferred Time*</label>
                    <input name="request_time" type="time" value={form.request_time} onChange={handleChange} />
                </div>

                <div className="sr_form_group sr_full">
                    <label>Description (Optional)</label>
                    <textarea name="description" placeholder="Describe the item(s) or any special notes..." value={form.description} onChange={handleChange} />
                </div>

            </div>

            <button className="sr_submit_btn" onClick={handleSubmit} disabled={submitting}>
                {submitting ? "submitting..." : "submit request" }
            </button>
        </div>

        {/* ── MY REQUESTS ── */}
        <div className="sr_list_card">
            <h2>My Requests</h2>

            {loading ? (
                <p className="sr_loading">Loading your requests...</p>
            )   : requests.length === 0 ? (
                <p className="sr_empty">No requests yet. Submit one above!</p>
            ): (
                requests.map((r) => (
                    <div className="sr_item" key={r.request_ID}>
                        <div className="sr_item_info">
                            <h4>
                            <i className="bi bi-archive-fill me-2"></i>
                            {r.item_type}
                            </h4>
                            <p>
                            <i className="bi bi-geo-alt-fill me-2"></i>
                            {r.address}, {r.location}
                            </p>
                            {r.description && (
                            <p>
                                <i className="bi bi-card-text me-2"></i>
                                {r.description}
                            </p>
                            )}
                            {r.schedule_date && (
                               <p>
                            <i className="bi bi-calendar-event-fill me-2"></i>
                            Scheduled: {r.schedule_date}
                            {r.schedule_time ? ` at ${r.schedule_time}` : ""}
                            </p>
                            )}



                           <span>
                            <i className="bi bi-clock-history me-2"></i>
                            Requested:{" "}
                            {new Date(r.request_date).toLocaleDateString("en-GB", {
                                day: "2-digit",
                                month: "long",
                                year: "numeric",
                            })}{" "}
                            at{" "}
                            {new Date(`1970-01-01T${r.request_time}`).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: true,
                            })}
                            </span>



                        </div>
                        <span className={`sr_status ${STATUS_CLASS[r.status] || "sr_status_pending"}`}>
                        {r.status || "Pending"}
                        </span>
                    </div>
                ))
            )}
            
        </div>


        
        </div>

        <Footer/>
    </div>
)
}

export default SpecialRequest;