import { Navigate, useNavigate } from "react-router-dom";
import "./truck_management.css";
import { useState, useEffect } from "react";
import axios from "axios";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";


function ManageTruck(){


    const navigate = useNavigate();

   const [trucks, setTrucks] = useState([]);
     const [drivers, setDrivers] = useState([]);
     const [search, setSearch] = useState("");
     const [loading, setLoading] = useState(true);
     const [error, setError] = useState("");
     const [success, setSuccess] = useState("");
   
     const [showModal, setShowModal] = useState(false);
     const [selectedTruck, setSelectedTruck] = useState(null);
     const [editData, setEditData] = useState({});
   
     const [showDeleteModal, setShowDeleteModal] = useState(false);
     const [deleteTarget, setDeleteTarget] = useState(null);

  // Fetch all trucks
    const fetchTrucks =() => {
        setLoading(true); 
        axios.get ("http://localhost:5000/get-trucks")
            .then(res => {
                console.log("Trucks from DB:", res.data);
                setTrucks(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load trucks.");
                setLoading(false);
            });
        };


   //Fetch all drivers
   const fetchAllDrivers=() => {
    axios.get("http://localhost:5000/gt-drivers")
    .then(res => setDrivers(res.data))
    .catch(() => console.log("Failed to load drivers"));
   };

   useEffect(() => {
    fetchTrucks();
    fetchAllDrivers();
   }, []); 

 // Filter trucks by search
    const filteredTrucks = trucks.filter (t =>
    (t.truck_ID || "").toString().toLowerCase().includes(search.toLowerCase()) ||

    (t.vehicle_number || "").toLowerCase().includes(search.toLowerCase()) ||
    
    (t.driver_id || "").toString().toLowerCase().includes(search.toLowerCase())
    );



// Get driver name by ID

    const getDriverName =(driver_id) => {
        const driver = drivers.find (d => 
        (d.driver_ID || d.driver_id) === driver_id
        );
        return driver ? driver.name: driver_id;
    };

//Open edit modal

const openEdit = (truck) =>{
    console.log("Editing truck:", truck);
    setSelectedTruck(truck);
    setEditData({
        vehicle_number: truck.vehicle_number,
        driver_id: truck.driver_id
    });

     axios
    .get(`http://localhost:5000/get-available-drivers/${truck.truck_ID}`)
    .then((res) => setDrivers(res.data))
    .catch(() => setError("Failed to load drivers."));



    setShowModal(true);
    setError("");
    setSuccess("");
};

const handleEditChange = (e) => {
    setEditData({...editData, [e.target.name]: e.target.value});
};

//submit edit

const handleUpdate = () => {

   const truckID = selectedTruck?.truck_ID;
    console.log("Updating truck ID:", truckID);

    if (!editData.vehicle_number || !editData.driver_id){
        setError ("All fields are required.");
        return;
    }

    axios.put(`http://localhost:5000/update-truck/${truckID}`, editData)
        .then(() => {
            setSuccess(`Truck "${editData.vehicle_number}" update successfully!`);
            setShowModal(false);
            fetchTrucks();
        })
        .catch(err => {
            setError(err.response?.data || "Error updatinf truck.");
        });
};



  // Open delete modal
  const openDelete = (truck) => {
    setDeleteTarget(truck);
    setShowDeleteModal(true);
  };

  // Confirm delete
  const handleDelete = () => {
    const truckID = deleteTarget?.truck_ID;
    console.log("Deleting truck ID:", truckID);

    if (!truckID) {
      setError("Truck ID missing. Cannot delete.");
      setShowDeleteModal(false);
      return;
    }

    axios.delete(`http://localhost:5000/delete-truck/${truckID}`)
      .then(() => {
        setSuccess(`Truck "${deleteTarget.vehicle_number}" deleted successfully!`);
        setShowDeleteModal(false);
        setDeleteTarget(null);
        fetchTrucks();
      })
      .catch(err => {
        setError(err.response?.data || "Error deleting truck.");
        setShowDeleteModal(false);
      });
  };

return (
  <div className="tm_page">
    <AdminNavBar />

    <div className="body">

      {/* Header */}
      <div className="page_header">
        <div>
          <h2>Manage Truck</h2>
          <p>View, edit and delete trucks</p>
        </div>

        <button
          className="add_btn"
          onClick={() => navigate("/add_truck")}
        >
          + Add Truck
        </button>
      </div>

      {/* Stats Row */}
      <div className="status_row">
        <div className="status_card green">
          <div className="status_num">{trucks.length}</div>
          <div className="status_label">Total Trucks</div>
        </div>

        <div className="status_card orange">
          <div className="status_num">{filteredTrucks.length}</div>
          <div className="status_label">Search Results</div>
        </div>

        <div className="status_card blue">
          <div className="status_num">🚛</div>
          <div className="status_label">Active Fleet</div>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="alert alert_error">
          ⚠ {error}
        </div>
      )}

      {success && (
        <div className="alert alert_success">
          ✓ {success}
        </div>
      )}

      {/* Search */}
      <div className="search_bar">
        <span className="search_icon">🔍</span>

        <input
          type="text"
          placeholder="Search by truck ID, vehicle number or driver..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {search && (
          <button
            className="clear_btn"
            onClick={() => setSearch("")}
          >
            ✕
          </button>
        )}
      </div>

      {/* Table Card */}
      <div className="card">
        {loading ? (
          <div className="loading">
            Loading trucks...
          </div>
        ) : filteredTrucks.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🚛</div>
            <p>No trucks found</p>
            <span>
              Try a different search or add a new truck
            </span>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Truck</th>
                <th>Truck ID</th>
                <th>Vehicle Number</th>
                <th>Assigned Driver</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredTrucks.map((truck) => (
                <tr key={truck.truck_ID}>
                  <td>
                    <div className="icon_cell">
                      🚛
                    </div>
                  </td>

                  <td>
                    <span className="id_badge">
                      {truck.truck_ID}
                    </span>
                  </td>

                  <td>
                    <strong>
                      {truck.vehicle_number}
                    </strong>
                  </td>

                  <td>
                    <div className="tm_driver_cell">
                      <div className="tm_driver_avatar">
                        {getDriverName(truck.driver_id)
                          ?.charAt(0)
                          ?.toUpperCase() || "?"}
                      </div>

                      <div>
                        <div className="tm_driver_name">
                          {getDriverName(truck.driver_id)}
                        </div>

                        <div className="tm_driver_id">
                          ID: {truck.driver_id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <div className="action_btns">
                      <button
                        className="btn_edit"
                        onClick={() => openEdit(truck)}
                      >
                        ✏ Edit
                      </button>

                      <button
                        className="btn_delete"
                        onClick={() => openDelete(truck)}
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

      {/* Count */}
      {!loading && filteredTrucks.length > 0 && (
        <div className="tm_count">
          Showing {filteredTrucks.length} of{" "}
          {trucks.length} trucks
        </div>
      )}
    </div>




            {/* ── EDIT MODAL ── */}
            {showModal && (
                <div className="tm_modal_overlay" onClick={() => setShowModal(false)}>
                    <div className="tm_modal tm_modal_sm" onClick={(e) => e.stopPropagation()}>

                        <div className="tm_modal_header">
                            <h3>Edit Truck</h3>
                            <button className="tm_modal_close" onClick={() => setShowModal(false)}>✕</button>
                        </div>

                        <div className="tm_modal_truck_icon">
                            <span className="tm_modal_icon">🚛</span>
                            <span>ID: {selectedTruck?.truck_ID}</span>
                        </div>

                        <div className="tm_modal_bodyy">
                            {error && <div className="alert alert_error">⚠ {error}</div>}

                            <div className="tm_form_group">
                                <label>Vehicle Number</label>
                                <input
                                    type="text"
                                    name="vehicle_number"
                                    value={editData.vehicle_number || ""}
                                    onChange={handleEditChange}
                                    placeholder="Enter vehicle number"
                                />
                            </div>

                            <div className="tm_form_group">
                                <label>Assign Driver</label>
                                <select
                                    name="driver_id"
                                    value={editData.driver_id || ""}
                                    onChange={handleEditChange}
                                >
                                    <option value="">-- Select Driver --</option>
                                    {drivers.map((driver) => (
                                        <option
                                            key={driver.driver_ID || driver.driver_id}
                                            value={driver.driver_ID || driver.driver_id}
                                        >
                                            {driver.name} (ID: {driver.driver_ID || driver.driver_id})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="tm_modal_footer">
                            <button className="tm_btn_cancel" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="tm_btn_save" onClick={handleUpdate}>Save Changes</button>
                        </div>

                    </div>
                </div>
            )}

            {/* ── DELETE MODAL ── */}
            {showDeleteModal && (
                <div className="tm_modal_overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="tm_modal tm_modal_sm" onClick={(e) => e.stopPropagation()}>

                        <div className="tm_modal_header">
                            <h3>Delete Truck</h3>
                            <button className="tm_modal_close" onClick={() => setShowDeleteModal(false)}>✕</button>
                        </div>

                        <div className="tm_delete_body">
                            <div className="tm_delete_icon">🗑️</div>
                            <strong>{deleteTarget?.vehicle_number}</strong>
                            <p>Are you sure you want to delete this truck?</p>
                            <span>ID: {deleteTarget?.truck_ID} — This action cannot be undone.</span>
                        </div>

                        <div className="tm_modal_footer">
                            <button className="tm_btn_cancel" onClick={() => setShowDeleteModal(false)}>Cancel</button>
                            <button className="tm_btn_confirm_delete" onClick={handleDelete}>Yes, Delete</button>
                        </div>

                    </div>
                </div>
            )}

        </div>

);

}


export default ManageTruck;