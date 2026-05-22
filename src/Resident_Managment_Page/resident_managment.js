
import React, {useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../extra_CSS_file.css";
import "./resident_managment.css"
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";

function ManageResidents(){

    const navigate = useNavigate();

    const [residents, setResidens] = useState([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [success, setSuccess]= useState("");

    const [showModal, setShowModal] = useState(false);
     const [selectedResident, setSelectedResident] = useState(null);
    const [editData, setEditData] = useState({});

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

  // Safe ID access
     const getResidentId = (resident) => {
    if (!resident) return null;
    return resident.resident_ID || resident.resident_id || resident.id || null;
  };

    const fetchResidents =() => {
        setLoading(true);
        axios.get ("http://localhost:5000/get-resident")
        .then(res => {
            console.log("Residents from DB:", res.data);
            setResidens(res.data);
            setLoading(false);
        })

        .catch(() => {
            setError("Failed to load residents");
            setLoading(false);
        } );
    };
    
    useEffect(() => {
        fetchResidents();
    }, []);

    const filteredResidents =residents.filter (r =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.email.toLowerCase().includes(search.toLowerCase()) ||
        r.phone_no.toLowerCase().includes(search.toLowerCase()) ||
        r.address.toLowerCase().includes(search.toLowerCase()) ||
        (getResidentId(r) || "").toString().includes(search)

    );

    //Open edit modal
    const openEdit = (resident) => {
        console.log("Editing resident:", resident);
      setSelectedResident(resident);
        setEditData({
            name: resident.name,
            email: resident.email,
            phone_no: resident.phone_no,
            address: resident.address
        });

        setShowModal(true);
        setError("");
        setSuccess("");
        
    };


    // Handle edit input change
    const handleEditChange = (e) => {
        setEditData({...editData, [e.target.name]: e.target.value});
    };
 

    //Submit edit

    const handleUpdate =() => {
        const residentID =getResidentId(selectedResident);
        console.log("Updating resident ID:", residentID);

        if (!editData.name || !editData.email || !editData.phone_no || !editData.address){
        setError("All field are required");
        return
        }

        if (!residentID) {
        setError ("Resident ID is missing. Please close and try again");
        return;
        }
        
        if (editData.phone_no.length < 10) {
            setError("Phone number must be at least 10 digits.");
            return;
        }

        axios.put(`http://localhost:5000/update-resident/${residentID}`, editData)
        
        .then(() => {
            
            setSuccess(`Resident "${editData.name}" updated successfully!`);
            setShowDeleteModal(false);
            fetchResidents();
        })

        .catch(err => {
            setError(err.response?.data || "Error updating resident.");
        });

        };


        //Open delete confirm modal
        const openDelete = (resident) => {
            setDeleteTarget(resident);
             setShowDeleteModal(true);
        };

        //Confirm delete
        const handleDelete = () => {
            const residentID = getResidentId(deleteTarget);
            console.log("Deleting resident ID:", residentID);

        if(!residentID){
            setError("Resident ID is missing.Cannot delete.");
            setShowDeleteModal(false);
            return;
        }



        axios.delete(`http://localhost:5000/delete-resident/${residentID}`)
        
            .then(() => {
                setSuccess('Resident "${deleteTarget.name}"delete successfully!');
                setShowModal(false);
                setDeleteTarget(null);
                fetchResidents();
            })

            .catch(err => {
                setError(err.response?.data || "Error deleting residents.");
                setShowModal(false);
            });
        
        };

        const getInitials = (name) => {
            if (!name) return "RS";
            const parts = name.trim().split(" ");
            if (parts.length >= 2 && parts [1].length > 0)
                return parts [0] [0].toUpperCase() + parts [1] [0].toUpperCase();
            return name.trim() [0].toUpperCase();
        } ;
        
      

return(
    <div className="mr-page">
           <AdminNavBar/>

        <div className="mr-body">

            {/* Page Title */}
            <div className="mr-page-header">
                <div>
                    <h2>Manage Residents</h2>
                    <p>view,edit and delete registered residents</p>
                </div>
            </div>

            <div className="status_row">
                <div className="status_card green">
                    <div className="status_num">{residents.length}</div>
                    <div className="status_label">Total Residents</div>
                </div>

                 <div className="status_card orange">
                    <div className="status_num">{filteredResidents.length}</div>
                    <div className="status_label">Search Results</div>
                </div>

                <div className="status_card blue">
                    <div className="status_num">👥</div>
                    <div className="status_label">Community Members</div>
                </div>
            </div>


            {/* Alerts */}
            {error && <div className="mr-alert mr-alert-error">⚠ {error}</div>}
            {success && <div className="mr-alert mr-alert-success">✓ {success}</div>}

            {/* Search Bar */}
            <div className="mr-search-bar">
                <span className="mr-search-icon">🔍</span>
                <input
                    type="text"
                    placeholder="search by name,email,phone or address.."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />

                {search && (
                    <button className="mr-clear-btn" onClick={() => setSearch("")}>✕</button>
                )}      
         
            </div>


            <div className="mr-card">
          {loading ? (
            <div className="mr-loading">Loading residents...</div>
          ) : filteredResidents.length === 0 ? (
            <div className="mr-empty">
              <div className="mr-empty-icon">👥</div>
              <p>No residents found</p>
              <span>Try a different search term</span>
            </div>
          ) : (
            <table className="mr-table">
              <thead>
                <tr>
                  <th>Resident</th>
                  <th>ID</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredResidents.map((resident) => (
                  <tr key={getResidentId(resident)}>
                    <td>
                      <div className="mr-resident-cell">
                        <div className="mr-avatar">{getInitials(resident.name)}</div>
                        <span>{resident.name}</span>
                      </div>
                    </td>
                    <td>
                      <span className="mr-id-badge">{getResidentId(resident)}</span>
                    </td>
                    <td>{resident.email}</td>
                    <td>{resident.phone_no}</td>
                    <td className="mr-address">{resident.address}</td>
                    <td>
                      <div className="mr-action-btns">
                        <button
                          className="mr-btn-edit"
                          onClick={() => openEdit(resident)}
                        >
                          ✏ Edit
                        </button>
                        <button
                          className="mr-btn-delete"
                          onClick={() => openDelete(resident)}
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





        {/* Total count */}
        {!loading && filteredResidents.length > 0 && (
          <div className="mr-count">
            Showing {filteredResidents.length} of {residents.length} residents
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {showModal && (
        <div className="mr-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="mr-modal" onClick={(e) => e.stopPropagation()}>

            <div className="mr-modal-header">
              <h3>Edit Resident</h3>
              <button className="mr-modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <div className="mr-modal-avatar">
              <div className="mr-avatar large">{getInitials(editData.name)}</div>
              <span>ID: {getResidentId(selectedResident)}</span>
            </div>

            {error && <div className="mr-alert mr-alert-error">⚠ {error}</div>}

            <div className="mr-modal-body">
              <div className="mr-form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={editData.name}
                  onChange={handleEditChange}
                />
              </div>
              <div className="mr-form-group">
                <label>Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={editData.email}
                  onChange={handleEditChange}
                />
              </div>
              <div className="mr-form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  name="phone_no"
                  value={editData.phone_no}
                  onChange={handleEditChange}
                />
              </div>
              <div className="mr-form-group full-width">
                <label>Address</label>
                <input
                  type="text"
                  name="address"
                  value={editData.address}
                  onChange={handleEditChange}
                />
              </div>
            </div>

            <div className="mr-modal-footer">
              <button className="mr-btn-cancel" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button className="mr-btn-save" onClick={handleUpdate}>
                Save Changes
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ── Delete Confirm Modal ── */}
      {showDeleteModal && (
        <div className="mr-modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="mr-modal mr-modal-sm" onClick={(e) => e.stopPropagation()}>

            <div className="mr-modal-header">
              <h3>Delete Resident</h3>
              <button className="mr-modal-close" onClick={() => setShowDeleteModal(false)}>✕</button>
            </div>

            <div className="mr-delete-body">
              <div className="mr-delete-icon">👤</div>
              <p>Are you sure you want to delete</p>
              <strong>"{deleteTarget?.name}"</strong>
              <span>This action cannot be undone.</span>
            </div>

            <div className="mr-modal-footer">
              <button className="mr-btn-cancel" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="mr-btn-confirm-delete" onClick={handleDelete}>
                Yes, Delete
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ManageResidents;

            

            













