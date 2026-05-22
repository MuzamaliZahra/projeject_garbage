import React from "react";
import "./track.css";
import Footer from "../Footer_Page/Footer";
import NavBar from "../Navigation_Bar_Page/Navigation";

const LiveTracking = () => {
  return (
    <div className="tracking-wrapper">
      <NavBar/>

      {/* Header */}
     <div className="tracking_page">
     

  <div className="tracking_container">
    <h1>🚚 Live Truck Tracking</h1>
    <p className="tracking_subtitle">
      Monitor garbage collection trucks in real-time
    </p>

    <div className="tracking_card">
      <h3>Active Trucks</h3>

      <div className="truck_row">
        <div>
          <strong>WP CAB 1234</strong>
          <p>Driver: Kamal Silva • Route: Colombo 03</p>
        </div>
        <div className="truck_status">
          <span className="status active">Active</span>
          <small>ETA: 15 mins</small>
        </div>
      </div>

      <div className="truck_row">
        <div>
          <strong>WP CAB 5678</strong>
          <p>Driver: Nimal Perera • Route: Colombo 04</p>
        </div>
        <div className="truck_status">
          <span className="status active">Active</span>
          <small>ETA: 45 mins</small>
        </div>
      </div>
    </div>

    <div className="tracking_card">
      <h3>Map View 🗺️</h3>
      <div className="map_box">Map Placeholder</div>
    </div>
  </div>

  <Footer/>
</div>

    </div>
  );
};

export default LiveTracking;
