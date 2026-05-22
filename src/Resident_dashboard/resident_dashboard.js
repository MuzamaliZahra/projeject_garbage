import React from "react";
import "./resident_dashboard.css";

function ResidentDashboard() {
  return (
    <div className="dashboard-container">

      {/* ================= HEADER ================= */}
      <header className="dashboard-header">
        <div className="brand">
          🗑️ <span>CleanLand</span>
        </div>

        <div className="user-info">
          <div className="avatar">J</div>
          <span>John Resident</span>
        </div>
      </header>

      {/* ================= CONTENT ================= */}
      <div className="dashboard-content">

        {/* Welcome */}
        <h1 className="welcome-text">
          Welcome Back! 👋
        </h1>
        <p className="subtitle">
          Here's your garbage collection overview
        </p>

        {/* Alert */}
        <div className="alert-box">
          🔔 <strong>Next Collection:</strong> Tomorrow at 7:00 AM – Colombo 03 Area
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">

          <div className="stat-card green">
            <h2>2</h2>
            <p>Collections This Week</p>
          </div>

          <div className="stat-card orange">
            <h2>3</h2>
            <p>Active Complaints</p>
          </div>

          <div className="stat-card blue">
            <h2>95%</h2>
            <p>On-Time Rate</p>
          </div>

          <div className="stat-card teal">
            <h2>12</h2>
            <p>Bins in Your Area</p>
          </div>

        </div>

        {/* Recent Activities */}
        {/* ================= ACTIVITY TIMELINE ================= */}
<div className="activity-timeline">

  <div className="timeline-item">
    <h4>Today - Garbage Collected</h4>
    <p>7:30 AM · Regular waste collection completed</p>
  </div>

  <div className="timeline-item">
    <h4>Yesterday - Complaint Resolved</h4>
    <p>Your complaint #C123 has been resolved</p>
  </div>

  <div className="timeline-item">
    <h4>2 Days Ago - Special Pickup</h4>
    <p>Furniture pickup request approved</p>
  </div>

</div>

{/* ================= QUICK ACTIONS ================= */}
<div className="quick-actions">

  <h3>Quick Actions</h3>

  <button className="action-btn primary">
    📍 Track Garbage Truck
  </button>

  <button className="action-btn orange">
    💬 Submit Complaint
  </button>

  <button className="action-btn outline">
    📱 Scan QR Code
  </button>

  <button className="action-btn outline">
    🚛 Request Special Pickup
  </button>

</div>


      </div>
    </div>
  );
}

export default ResidentDashboard;
