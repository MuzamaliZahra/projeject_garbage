
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./content_managment.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";


function ManageContent() {
    const navigate = useNavigate();

    const [contents, setContents] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const [showModal, setShowModal] = useState(false);
    const [selectedContent, setSelectedContent] = useState(null);
    const [editData, setEditData] = useState({});
    const [editImageFile, setEditImageFile] = useState(null);
    const [editImagePreview, setEditImagePreview] = useState(null);

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);


    const fetchContents = () => {
        setLoading(true);
        axios
            .get("http://localhost:5000/get-awareness-content")
            .then((res) =>{setContents(res.data); setLoading(false);})
            .catch(() => {setError ("Failed to load content."); setLoading(false); });
    };

    useEffect(() => { fetchContents(); }, []);

    const filtered = contents.filter((c) => {
        const q = search.toLowerCase();
        return(
            (c.content_ID || "").toLowerCase().includes(q) ||
            (c.title || "").toLowerCase().includes(q) ||
            (c.content_type || "").toLowerCase().includes(q) ||
            (c.description || "").toLowerCase().includes(q)
        );
    });


    const getTypeBadgeClass = (type) => {
        if (!type) return "mc_type_default";
        const t = type.toLowerCase();
        if (t.includes("awareness")) return "mc_type_orange";
        if (t.includes("recycling")) return "mc_type_green";
        if (t.includes("news"))      return "mc_type_blue";
        if (t.includes("announce"))  return "mc_type_purple";
        return "mc_type_default";
    };


    const openEdit = (content) => {
        setSelectedContent(content);
        setEditData({
            title:          content.title || "",
            content_type:   content.content_type || "",
            content_body:   content.content_body || "",
            description:    content.description || "",

        });

        setEditImageFile(null);
        setEditImagePreview(content.image
            ? `http://localhost:5000/uploads/${content.image}`
            : null
        );
        setShowModal(true);
        setError("");
        setSuccess("");
    };

    const handleEditChange = (e) => {
        setEditData({...editData, [e.target.name]: e.target.value});
    };

    const handleEditImage = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setEditImageFile(file);
        setEditImagePreview(URL.createObjectURL(file));
    };

    const handleUpdate = () => {
        if (!editData.title || !editData.content_type || !editData.content_body || !editData.description) {
            setError ("All fields are required.");
            return;
        }

        const data = new FormData();
        data.append("title",        editData.title);
        data.append("content_type", editData.content_type);
        data.append("content_body", editData.content_body);
        data.append("description", editData.description);
        if (editImageFile) data.append("image", editImageFile);

        axios
            .put(`http://localhost:5000/update-awareness-content/${selectedContent.content_ID}`, data, {
            headers: { "Content-Type": "multipart/form-data" },
        })
        .then(() => {
            setSuccess (`Content "${editData.title}" updated successfully!`);
            setShowModal(false);
            fetchContents();
        })
        .catch((err) => setError(err.response?.data || "Error update content."));
    };

        const openDelete = (content) => {
            setDeleteTarget(content);
            setShowDeleteModal(true);
        };

        const handleDelete = () => {
            axios
              .delete(`http://localhost:5000/delete-awareness-content/${deleteTarget.content_ID}`)
              .then(() => {
                setSuccess(`Content "${deleteTarget.title}" deleted successfully!`);
                setShowDeleteModal(false);
                fetchContents();
              })
              .catch(() => {
                setError("Error deleting content.");
                setShowDeleteModal(false);
              });
          };
        

    return(
        <div className="mc_page">

              <AdminNavBar/>



            <div className="body">

                {/* Page Header */}
                <div className="page_header">
                <div>
                    <h2>Manage Awareness Content</h2>
                    <p>View, edit and delete awareness and educational content</p>
                </div>
                <button className="add_btn" onClick={() => navigate("/add-awareness-content")}>
                    + Add New Content
                </button>
                </div>

                {error   && <div className="alert alert_error">⚠ {error}</div>}
                {success && <div className="alert alert_success">✓ {success}</div>}


                 {/* Stats */}
                <div className="status_row">
                    <div className="status_card green">
                        <div className="status_num">{contents.length}</div>
                        <div className="status_label">Total Content</div>
                    </div>
                    <div className="status_card orange">
                        <div className="status_num">
                        {contents.filter(c => c.content_type?.includes("Awareness")).length}
                        </div>
                        <div className="status_label">Awareness Campaigns</div>
                    </div>
                    <div className="status_card blue">
                        <div className="status_num">{contents.filter(c => c.image).length}</div>
                        <div className="status_label">With Images</div>
                    </div>
                </div>

                {/*Search*/}

                <div className="search_bar">
                    <span className="search_icon">🔍</span>
                    <input
                        type="text"
                        placeholder="Search by ID, title, type or description..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    /> 
                    {search && (
                        <button className="clear_btn" onClick={() => setSearch("")}>
                            ✕
                        </button>
                    )}
                </div>

                {/*Table*/}

                <div className="mc_card">
                    {loading ? (
                        <div className="mc_loading">Loaing content</div>
                    ) :  filtered.length === 0 ? (
                        <div className="mc_empty"> 
                            <div className="mc_empty_icon">📢</div>
                            <p>No content found</p>
                            <span>Try a different search or add new content</span>
                        </div>
                    )   : (
                        <table className="mc_table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Image</th>
                                    <th>Title</th>
                                    <th>Type</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filtered.map((content) => (
                                    <tr key = {content.content_ID}>
                                        <td>
                                            <span className="mc_id_badge">{content.content_ID}</span>
                                        </td>

                                        <td>
                                            {content.image ? (
                                                <img
                                                    src={`http://localhost:5000/uploads/${content.image}`}
                                                    alt= {content.title}
                                                    className="mc_thumb"
                                                />
                                            ): (
                                                <div className="mc_no_image">No image</div>
                                            )}
                                        </td>

                                        <td>
                                            <span className="mc_title_text">{content.title}</span>
                                        </td>

                                        <td>
                                            <span className={`mc_type_badge ${getTypeBadgeClass(content.content_type)}`}>
                                                {content.content_type || "—"}
                                            </span>
                                        </td>

                                         <td>
                                            <span className="mc_desc_text">
                                                {content.description?.length > 60
                                                ? content.description.substring(0, 60) + "..."
                                                : content.description || "—"}
                                            </span>
                                        </td>

                                        <td>
                                            <div className="mc_action_btns">
                                                <button
                                                className="mc_btn_edit"
                                                onClick={(e) => { e.stopPropagation(); openEdit(content); }}
                                                >
                                                ✏ Edit
                                                </button>
                                                <button
                                                className="mc_btn_delete"
                                                onClick={(e) => { e.stopPropagation(); openDelete(content); }}
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

                {!loading && filtered.length > 0 && (
                    <div className="mc_count">
                        Showing {filtered.length} of {contents.length} content items
                    </div>
                )}
            </div>

            {/*edit modal*/}

            {showModal && (
                <div className="mc_modal_overlay" onClick={() => setShowModal(false)}>
                    <div className="mc_modal" onClick={(e) => e.stopPropagation()}>
                    
                    <div className="mc_modal_header">
                        <h3>Edit Content</h3>
                        <button className="mc_modal_close" onClick={() => setShowModal(false)}>✕</button>
                    </div>

                    <div className="mc_modal_banner">
                        <span className="mc_modal_banner_icon">📢</span>
                        <div>
                            <div className="mc_modal_banner_id">{selectedContent?.content_ID}</div>
                            <div className="mc_modal_banner_sub">Content ID</div>
                        </div>
                    </div>

                     {error && (
                        <div className="mc_alert mac_alert_error" style={{ margin: "0 1.5rem 0" }}>
                            ⚠ {error}
                        </div>
                    )}

                    <div className="mc_modal_body">

                        <div className="mc_form_group">
                            <label>Title</label>
                            <input type="text" name="title" value={editData.title} onChange={handleEditChange} />
                        </div>

                         <div className="mc_form_group">
                            <label>Content Type</label>
                            <select name="content_type" value={editData.content_type} onChange={handleEditChange}>
                            <option value="">— Select Type —</option>
                            <option value="Informative content">Informative content</option>
                            <option value="Awareness campaigns">Awareness campaigns</option>
                            <option value="Recycling tips">Recycling tips</option>
                            <option value="News">News</option>
                            <option value="Announcements">Announcements</option>
                            </select>
                        </div>

                        <div className="mc_form_group">
                            <label>Description</label>
                            <textarea
                            name="description"
                            value={editData.description}
                            onChange={handleEditChange}
                            rows={3}
                            />
                        </div>

                        <div className="mc_form_group">
                            <label>Content Body</label>
                            <textarea
                            name="content_body"
                            value={editData.content_body}
                            onChange={handleEditChange}
                            rows={4}
                            />
                        </div>

                        <div className="mc_form_group">
                             <label>Image</label>
                             <div className="mc_image_upload_area">
                                {editImagePreview ? (
                                    <div className="mc_image_preview_wrap">
                                    <img src={editImagePreview} alt="Preview" className="mac_image_preview" />
                                    <button
                                        type="button"
                                        className="mc_image_remove_btn"
                                        onClick={() => { setEditImageFile(null); setEditImagePreview(null); }}
                                    >
                                        ✕ Remove
                                    </button>
                                    </div>
                                ) : (
                                    <label className="mc_image_upload_label" htmlFor="edit_image_input">
                                    <span className="mc_upload_icon">🖼️</span>
                                    <span className="mc_upload_text">Click to upload new image</span>
                                    </label>
                                )}

                                <input
                                    id="edit_image_input"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleEditImage}
                                    style={{ display: "none" }}
                                />
                            </div>
                        </div>
                    </div>


                    <div className="mc_modal_footer">
                        <button className="mc_btn_cancel" onClick={() => setShowModal(false)}>Cancel</button>
                        <button className="mc_btn_save" onClick={handleUpdate}>Save Changes</button>
                    </div>

                    </div>
                </div>
            )}

            {/* ── Delete Modal ── */}
      {showDeleteModal && (
        <div className="mc_modal_overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="mc_modal mc_modal_sm" onClick={(e) => e.stopPropagation()}>

            <div className="mc_modal_header">
              <h3>Delete Content</h3>
              <button className="mc_modal_close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>

            <div className="mc_delete_body">
              <div className="mc_delete_icon">🗑️</div>
              <p>Are you sure you want to delete</p>
              <strong>"{deleteTarget?.title}"</strong>
              <span>{deleteTarget?.content_type}</span>
              <span className="mc_delete_warning">This action cannot be undone.</span>
            </div>

            <div className="mc_modal_footer">
              <button className="mc_btn_cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="mc_btn_confirm_delete" onClick={handleDelete}>Yes, Delete</button>
            </div>

          </div>
        </div>
      )}

    </div>

);

}

export default ManageContent;