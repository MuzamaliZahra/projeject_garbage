import "./home.css";
import Footer from "../Footer_Page/Footer";
import NavBar from "../Navigation_Bar_Page/Navigation";
import LiveTracking from "../track_page/track";
import { useNavigate } from "react-router-dom";
import React, { useState, useEffect } from "react";

function Home() {
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);
  const [alerts, setAlerts] = useState([]);

   // Read from the "user" object your login actually saves
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;
  const residentId = user?.id || null;

  useEffect(() => {
    fetch("http://localhost:5000/get-active-schedules")
      .then((res) => res.json())
      .then((data) => setSchedules(data))
      .catch((err) => console.error("Failed to load schedules:", err));
  }, []);

  // Fetch this resident's active, non-expired alerts
  useEffect(() => {
    if (!residentId) return;

    const fetchAlerts = () => {
      fetch(`http://localhost:5000/get-alerts/resident/${residentId}`)
        .then((res) => res.json())
        .then((data) => setAlerts(data))
        .catch((err) => console.error("Failed to load alerts:", err));
    };

    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000); // re-check every 30s
    return () => clearInterval(interval);
  }, [residentId]);

  // Locally remove an alert the instant it hits its expiry time,
  // without waiting for the next poll
  useEffect(() => {
    if (alerts.length === 0) return;
    const timers = alerts.map((alert) => {
      const msLeft = new Date(alert.expired_time).getTime() - Date.now();
      if (msLeft <= 0) return null;
      return setTimeout(() => {
        setAlerts((prev) => prev.filter((a) => a.alert_ID !== alert.alert_ID));
      }, msLeft);
    });
    return () => timers.forEach((t) => t && clearTimeout(t));
  }, [alerts]);

  return (
    <div className="home">

      <NavBar />

      {/* Emergency Alert Section — dynamic, per-resident, auto-expiring */}
      {alerts.length > 0 && (
        <div className="emergency-alert-stack">
          {alerts.map((alert) => (
            <div className="emergency-alert" key={alert.alert_ID}>
              <div className="alert-content">
                <i className="bi bi-exclamation-triangle-fill alert-icon"></i>
                <div>
                  <h3>{alert.tittle}</h3>
                  <p>{alert.message}</p>
                  <small className="alert-meta">
                    {alert.alert_type} · expires {new Date(alert.expired_time).toLocaleString()}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hero Section */}
      <section className="hero">
        <div className="hero_left">
          <h1>
            Smart Garbage <br />
            Management for a <br />
            <span>Cleaner Sri Lanka</span>
          </h1>

          <p>
            Transform waste collection with real-time tracking, smart
            scheduling, and digital complaint management.
          </p>

          <div className="hero_buttons">
            <button className="primary-btn" onClick={() => navigate("/")}>
              Get Started Free
            </button>
            <button className="secondary-btn" onClick={() => navigate("/login")}>
              Sign In
            </button>
          </div>

          <div className="stats">
            <div><h3>1,200+</h3><p>Active Users</p></div>
            <div><h3>15</h3><p>Garbage Trucks</p></div>
            <div><h3>98%</h3><p>Satisfaction Rate</p></div>
          </div>
        </div>

        <div className="hero-right">
          <div className="feature-card top">
            <strong><i className="bi bi-truck me-2"></i>Real-time Tracking</strong>
            <p>Track trucks live</p>
          </div>
          <div className="truck"><i className="bi bi-truck-front-fill"></i></div>
          <div className="feature-card right">
            <strong><i className="bi bi-calendar-check me-2"></i>Smart Scheduling</strong>
            <p>Never miss a pickup</p>
          </div>
          <div className="feature-card bottom">
            <strong><i className="bi bi-chat-dots-fill me-2"></i>Quick Complaints</strong>
            <p>Report & track issues</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features">
        <h2>Powerful Features</h2>
        <p className="features-subtitle">
          Everything you need for efficient garbage management
        </p>

        <div className="features-grid">

          <div className="feature-box">
            <i className="bi bi-geo-alt-fill feature-icon"></i>
            <h3>Live Truck Tracking</h3>
            <p>
              Track garbage collection trucks in real-time and get
              accurate ETA for your area.
            </p>
          </div>

          <div className="feature-box">
            <i className="bi bi-calendar-week-fill feature-icon"></i>
            <h3>Collection Schedules</h3>
            <p>
              View detailed collection schedules and receive timely
              notifications.
            </p>
          </div>

          <div className="feature-box">
            <i className="bi bi-chat-left-text-fill feature-icon"></i>
            <h3>Digital Complaints</h3>
            <p>
              Submit complaints with images and track their status
              easily.
            </p>
          </div>

          <div className="feature-box">
            <i className="bi bi-qr-code-scan feature-icon"></i>
            <h3>QR Code Scanner</h3>
            <p>
              Scan bin QR codes to view information, status, and history.
            </p>
          </div>

          <div className="feature-box">
            <i className="bi bi-star-fill feature-icon"></i>
            <h3>Feedback System</h3>
            <p>
              Rate services and provide feedback to improve quality.
            </p>
          </div>

          <div className="feature-box">
            <i className="bi bi-bell-fill feature-icon"></i>
            <h3>Smart Notifications</h3>
            <p>
              Get alerts for upcoming collections and important updates.
            </p>
          </div>

        </div>
      </section>

      {/* Schedule Table */}
<div className="schedule_table">
  <h2>All Areas Schedule</h2>

  <table>
    <thead>
      <tr>
        <th>Schedule ID</th>
        <th>Day</th>
        <th>Time</th>
        <th>Area</th>
        <th>Route</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      {schedules.length === 0 ? (
        <tr>
          <td colSpan="6" style={{ textAlign: "center" }}>
            No schedules found
          </td>
        </tr>
      ) : (
        schedules.map((s) => (
          <tr key={s.schedule_id}>
            <td>{s.schedule_id}</td>
            <td>{s.day_of_week}</td>
            <td>{s.time}</td>
            <td>{s.area}</td>
            <td>{s.route_name ?? "—"}</td>
            <td>
              <span className={`status ${s.status === "Active" ? "active" : "inactive"}`}>
                {s.status}
              </span>
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>

      {/* CTA */}
      <section className="cta">
        <h2>Ready to Get Started?</h2>
        <p>
          Join thousands of residents making their communities cleaner and greener
        </p>
        <button className="cta-btn">Create Free Account</button>
      </section>

      <br />

      {/* Floating Button */}
      <a href="/track" className="floating-track-btn">
        <i className="bi bi-truck me-2"></i>
        Track Live Truck
      </a>

      <Footer />
    </div>
  );
}

export default Home;