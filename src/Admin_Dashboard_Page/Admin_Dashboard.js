import React from "react";
import "./Admin_Dashboard.css";
import { useNavigate } from "react-router-dom";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";



function StatBox({ value, label, color }) {
  return (
    <div className={`stat ${color}`}>
      <h2>{value}</h2>
      <p>{label}</p>  
    </div>
  );
}


export default function AdminDashboard() {


const navigate = useNavigate();

  return (
    <div>
        <AdminNavBar/>
    <div className="admin_page">

   

      {/* Header */}
       
      <div className="admin_page_explain">
        <h1>Admin Dashboard 👩‍💼</h1>
        <p>System overview and management</p>
      </div>

      {/* Stats */}
      <div className="stats_count">
        <StatBox value="1,247" label="Total Residents" color="green" />
        <StatBox value="15" label="Active Trucks" color="orange" />
        <StatBox value="87" label="Pending Complaints" color="blue" />
        <StatBox value="245" label="Bins Managed" color="teal" />
      </div>

      {/* Main Section */}
      <div className="main_section">
        {/* Complaints */}
        <div className="complaint_truck_section">
          <h3>Recent Complaints</h3>

          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Type</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>C001</td>
                <td>Missed Pickup</td>
                <td><span className="status pending">Pending</span></td>
                <td><button className="btn resolve">Resolve</button></td>
              </tr>
              <tr>
                <td>C002</td>
                <td>Overflowing Bin</td>
                <td><span className="status progress">In Progress</span></td>
                <td><button className="btn view">View</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Truck Status */}
        <div className="complaint_truck_section">
          <h3>Truck Status</h3>

          <div className="truck_update">
            <div>
              🚛 <b>WP CAB 1234</b>
              <p>Colombo 03 · Kamal Silva</p>
            </div>
            <span className="status active">Active</span>
          </div>

          <div className="truck_update">
            <div>
              🚛 <b>WP CAB 5678</b>
              <p>Colombo 04 · Nimal Perera</p>
            </div>
            <span className="status active">Active</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick_action_part">
        <h3>Quick Actions</h3>

        <div className="actions_part">
          <button className="action green" onClick={() => navigate("/add_driver")}>👥 Add Driver</button>
          <button className="action green" onClick={() => navigate("/driver_managment")}>👥 Manage Driver</button>
          <button className="action green" onClick={() => navigate("/resident_managment")}>👥 Manage Residents</button>
          <button className="action green" onClick={() => navigate("/add_truck")}>🚛 Add Trucks</button>
          <button className="action green" onClick={() => navigate("/truck_management")}>🚛 Manage Trucks</button>
          <button className="action green" onClick={() => navigate("/add_route")}>📍  Add Route</button>
          <button className="action green" onClick={() => navigate ("/route_managment")}>📍 Manage Routes</button>
          <button className="action green" onClick={() => navigate ("/add_bin")}>🗑️ Add Bins</button>
          <button className="action green" onClick={() => navigate ("/bin_managment")}>🗑️ Manage Bins</button>
          <button className="action green" onClick={() => navigate ("/add_qr_code")}>🗑️ Add QR Code</button>
          <button className="action green" onClick={() => navigate ("/qr_code_manage")}>🗑️ Manage QR Code</button>
          <button className="action green" onClick={() => navigate ("/add_schedule")}>📅 Add Schedule</button>
          <button className="action green" onClick={() => navigate ("/schedule_management")}>📅Manage Schedule</button>
          <button className="action green" onClick={() => navigate ("/add_content")}>📢 Add Content</button>
          <button className="action green" onClick={() => navigate ("/content_managment")}>📢 Manage Content</button>
          <button className="action green" onClick={() => navigate ("/feedback_management")}>📢 Manage Feedback</button>
          <button className="action green" onClick={() => navigate ("/complaint_managment")}>📢 Complaint Managment</button>
           <button className="action green" onClick={() => navigate ("/pickup_managment")}>📢 Spcial Pickup Request Managment</button>




                      

          <button className="action green">📅 Update Schedule</button>
          <button className="action danger">🚨 Emergency Alert</button>
        </div>
      </div>
    </div>
    </div>
  );
}
