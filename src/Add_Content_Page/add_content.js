import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./add_content.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";


function AddContent() {

    const [formData, setFormData] = useState({
        content_ID: "",
        title: "",
        content_type: "",
        content_body: "",
        description: "",
    });


    const navigate =useNavigate();

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        setError("");
        setSuccess("");
        setFormData({...formData, [e.target.name]: e.target.value });
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
    };
    
    const handleSubmit = (e) => {
        e.preventDefault();
        const { content_ID, title, content_type, content_body,description } = formData;

        if (!content_ID || !title || !content_type || !content_body || !description) {
            setError("All fields are required.");
            return;
        }

    
        setSubmitting(true);
    
        const data = new FormData();
        data.append("content_ID", content_ID);
        data.append("title", title);
        data.append("content_type", content_type);
        data.append("content_body", content_body);
        data.append("description", description);
        if (imageFile) data.append("image", imageFile);
    
        axios
          .post("http://localhost:5000/add-awareness-content", data, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then(() => {
            setSuccess(`Content "${title}" added successfully!`);
            setFormData({ content_ID: "", title: "", content_type: "", content_body: "", description: "" });
            setImageFile(null);
            setImagePreview(null);
            setSubmitting(false);
          })
          .catch((err) => {
            setError(err.response?.data || "Server error. Please try again.");
            setSubmitting(false);
          });
      };

    return(
        <div className="ac_page">
<AdminNavBar/>
          
           
            <div className="ac_body">



            {/*page header*/}
            <div className="ac_page_header">
                <h2>Add Content</h2>
                <p>Upload educational or awareness content for residents</p>
            </div>

            {/* Stats Row */}

            <div className="status_row">
                <div className="status_card green">
                    <span className="status_num">📢</span>
                    <div className="status_label">New Content</div>
                </div>
                <div className="status_card orange">
                    <span className="status_num">🖼️</span>
                    <div className="status_label">With Image</div>
                </div>
                <div className="status_card blue">
                    <span className="status_num">📋</span>
                    <div className="status_label">Fill All Fields</div>
                </div>
            </div>

            {/*Form card*/}
            <div className="ac_card">
                <div className="ac_card_header">
                    <span className="ac_card_icon">📝</span>
                    <span className="ac_card_label">Content Registration</span>
                </div>

                {error && <div className="ac_alert ac_alert_error" style={{ margin: "1rem 1.5rem 0" }}>⚠ {error}</div>}
                {success && <div className="ac_alert aac_alert_success" style={{ margin: "1rem 1.5rem 0" }}>✓ {success}</div>}
            
                <form onSubmit={handleSubmit} className="ac_form">

                     {/* Row 1 — ID + Type */}
                     <div className="ac_form_row">
                        <div className="ac_form_group">
                            <label>Content ID</label>
                            <input
                                type="text"
                                name="content_ID"
                                placeholder="e.g. Con001"
                                value={formData.content_ID}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="ac_form_group">
                            <label>Content Type</label>
                            <select name="content_type" 
                            value={formData.content_type} 
                            onChange={handleChange} 
                            required>
                                <option value="">-Select Type-</option>
                                <option value="Informative Content">Informative content</option>
                                <option value="Awareness campaigns">Awareness campaigns</option>
                                <option value="Recycling tips">Recycling tips</option>
                                <option value="News">News</option>
                                <option value="Announcements">Announcements</option>
                            </select>
                        </div>
                     </div>

                     {/*Title*/}

                     <div className="ac_form_group">
                        <label>Title</label>
                        <input 
                            type="text"
                            name="title"
                            placeholder="Enter content title..."
                            value={formData.title}
                            onChange={handleChange}
                            required
                            />
                     </div>

                     {/* Description */}
                    <div className="ac_form_group">
                    <label>Description</label>
                    <textarea
                        name="description"
                        placeholder="Short description of the content..."
                        value={formData.description}
                        onChange={handleChange}
                        rows={3}
                        required
                    />
                    </div>

                    {/* Content Body */}
                    <div className="ac_form_group">
                    <label>Content Body</label>
                    <textarea
                        name="content_body"
                        placeholder="Full content text..."
                        value={formData.content_body}
                        onChange={handleChange}
                        rows={5}
                        required
                    />
                    </div>

                    {/* Image Upload */}
                    <div className="ac_form_group">
                        <label>Image </label>
                        <div className="ac_image_upload_area">
                            {imagePreview ? (
                                <div className="ac_image_preview_wrap">
                                    <img src= {imagePreview} alt="Preview" className="ac_image_preview"/>
                                    <button
                                        type="button"
                                        className="ac_image_remove_btn"
                                        onClick={() => {setImageFile(null); setImagePreview(null); }}
                                    >
                                        ✕ Remove
                                    </button>
                                </div>
                            ) : (
                                <label className="ac_image_upload_label" htmlFor="image_input">
                                    <span className="ac_upload_icon">🖼️</span>
                                    <span className="ac_upload_text">Click to upload image</span>
                                    <span className="ac_upload_hint">PNG, JPG, WEBP supported</span>
                                </label>
                            )}
                            <input 
                                id="image_input"
                                type="file"
                                accept="image/*"
                                onChange={handleImageChange}
                                style={{ display: "none" }}
                            />
                        </div>
                    </div>

                     {/* Buttons */}

                     <div className="ac_btn_row">
                        <button type="button" className="ac_btn_cancel" onClick={() => navigate(-1)}>
                            Cancel
                        </button>

                        <button type="submit" className="ac_btn_submit" disabled={submitting}>
                             {submitting ? "Adding..." : "📢 Add Content"}
                        </button>
                    </div>
                </form>
            </div>
            </div>
            
        </div>
    )

}
export default AddContent;