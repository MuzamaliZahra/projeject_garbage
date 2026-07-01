import React, { useState, useEffect } from "react";
import "./Admin_Dashboard.css";
import { useNavigate } from "react-router-dom";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";

function StatBox({ value, label, color }) {
  return (
    <div className={`stat ${color}`}>
      <h2>{value ?? "..."}</h2>
      <p>{label}</p>
    </div>
  );
}

 function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    residents: null,
    truckCount: null,
    pendingComplaints: null,
    bins: null,
  });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [trucks, setTrucks] = useState([]);

  useEffect(() => {
    // Stats
    fetch("http://localhost:5000/get-dashboard-stats")
      .then((res) => res.json())
      .then((data) => setStats(data))
      .catch((err) => console.error("Failed to load stats:", err));

    // Recent complaints
    fetch("http://localhost:5000/get-recent-complaints")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setRecentComplaints(data.complaints);
      })
      .catch((err) => console.error("Failed to load complaints:", err));
    // Trucks
    fetch("http://localhost:5000/get-trucks-with-driver")
      .then((res) => res.json())
      .then((data) => {
        console.log("Trucks loaded:", data);
        setTrucks(data);
      })
      .catch((err) => console.error("Failed to load trucks:", err));
  }, []);
  const getStatusClass = (status) => {
    if (status === "pending") return "pending";
    if (status === "in progress") return "progress";
    return "";
  };
  return (
    <div>
      <AdminNavBar />
      <div className="admin_page">

        <div className="admin_page_explain">
          <h1>Admin Dashboard</h1>
          <p>System overview and management</p>
        </div>

        {/* Stats */}
        <div className="stats_count">
          <StatBox value={stats.residents}         label="Total Residents"    color="green"  />
          <StatBox value={stats.trucks}            label="Active Trucks"      color="orange" />
          <StatBox value={stats.pendingComplaints} label="Pending Complaints" color="blue"   />
          <StatBox value={stats.bins}              label="Bins Managed"       color="teal"   />
        </div>
        {/* Main Section */}
        <div className="main_section">
          {/* Recent Complaints */}
          <div className="complaint_truck_section">
            <h3>Recent Complaints</h3>
            <table>
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Type</th>
                  <th>Resident</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recentComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: "center" }}>
                      No pending complaints
                    </td>
                  </tr>
                ) : (
                  recentComplaints.map((c) => (
                    <tr key={c.complaint_ID}>
                      <td>{c.complaint_ID}</td>
                      <td>{c.complaint_type}</td>
                      <td>{c.resident_name}</td>
                      <td>
                        <span className={`status ${getStatusClass(c.status)}`}>
                          {c.status}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn view"
                          onClick={() => navigate("/complaint_managment")}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          {/* Truck Status */}
          <div className="complaint_truck_section">
            <h3>Truck Status</h3>
            {trucks.length === 0 ? (
              <p style={{ textAlign: "center" }}>No trucks found</p>
            ) : (
              trucks.map((truck) => (
                <div className="truck_update" key={truck.truck_ID}>
                  <div>
                    <b>{truck.vehicle_number}</b>
                    <p>{truck.truck_ID} · {truck.driver_name ?? "No driver assigned"}</p>
                  </div>
                  <span className="status active">Active</span>
                </div>
              ))
            )}
          </div> </div>
        {/* Quick Actions */}
        <div className="quick_action_part">
          <h3>Quick Actions</h3>
          <div className="actions_part">
            <button className="action green" onClick={() => navigate("/add_driver")}>
              <i className="bi bi-person-plus-fill"></i> Add Driver
            </button>
            <button className="action green" onClick={() => navigate("/driver_managment")}>
              <i className="bi bi-people-fill"></i> Manage Driver
            </button>
            <button className="action green" onClick={() => navigate("/resident_managment")}>
              <i className="bi bi-house-door-fill"></i> Manage Residents
            </button>
            <button className="action green" onClick={() => navigate("/add_truck")}>
              <i className="bi bi-truck"></i> Add Trucks
            </button>
            <button className="action green" onClick={() => navigate("/truck_management")}>
              <i className="bi bi-truck-flatbed"></i> Manage Trucks
            </button>
            <button className="action green" onClick={() => navigate("/add_route")}>
              <i className="bi bi-geo-alt-fill"></i> Add Route
            </button>
            <button className="action green" onClick={() => navigate("/route_managment")}>
              <i className="bi bi-map-fill"></i> Manage Routes
            </button>
            <button className="action green" onClick={() => navigate("/add_bin")}>
              <i className="bi bi-trash-fill"></i> Add Bins
            </button>
            <button className="action green" onClick={() => navigate("/bin_managment")}>
              <i className="bi bi-trash3-fill"></i> Manage Bins
            </button>
            <button className="action green" onClick={() => navigate("/add_qr_code")}>
              <i className="bi bi-qr-code-scan"></i> Add QR Code
            </button>
            <button className="action green" onClick={() => navigate("/qr_code_manage")}>
              <i className="bi bi-upc-scan"></i> Manage QR Code
            </button>
            <button className="action green" onClick={() => navigate("/add_schedule")}>
              <i className="bi bi-calendar-plus-fill"></i> Add Schedule
            </button>
            <button className="action green" onClick={() => navigate("/schedule_management")}>
              <i className="bi bi-calendar-check-fill"></i> Manage Schedule
            </button>
            <button className="action green" onClick={() => navigate("/add_content")}>
              <i className="bi bi-megaphone-fill"></i> Add Content
            </button>
            <button className="action green" onClick={() => navigate("/content_managment")}>
              <i className="bi bi-file-earmark-text-fill"></i> Manage Content
            </button>
            <button className="action green" onClick={() => navigate("/feedback_management")}>
              <i className="bi bi-chat-dots-fill"></i> Manage Feedback
            </button>
            <button className="action green" onClick={() => navigate("/complaint_managment")}>
              <i className="bi bi-exclamation-triangle-fill"></i> Complaint Management
            </button>
            <button className="action green" onClick={() => navigate("/pickup_managment")}>
              <i className="bi bi-box-seam-fill"></i> Special Pickup Request Management
            </button>
            <button className="action danger" onClick={() => navigate("/add_emergency_alert")}>
              <i className="bi bi-bell-fill"></i> Emergency Alert
            </button>
            <button className="action danger" onClick={() => navigate("/emergency_alert_managment")}>
              <i className="bi bi-bell-fill"></i> Emergency Alert Management
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
export default AdminDashboard;