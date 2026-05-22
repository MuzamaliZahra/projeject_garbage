import "./home.css";
import Footer from "../Footer_Page/Footer";
import NavBar from "../Navigation_Bar_Page/Navigation";
import LiveTracking from "../track_page/track";


function Home() {

  return (
    <div className="home">

      {/* Navbar */}
     
<NavBar/>

{/* Emergency Alert Section */}
<div className="emergency-alert">
  <div className="alert-content">
    <span className="alert-icon">🚨</span>
    <div>
      <h3>Emergency Alert</h3>
      <p>
        Garbage collection delayed today in Colombo 03 due to heavy rainfall.
      </p>
    </div>
  </div>
</div>


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
            <button className="primary-btn">Get Started Free</button>
            <button className="secondary-btn">Sign In</button>
          </div>

          <div className="stats">
            <div>
              <h3>1,200+</h3>
              <p>Active Users</p>
            </div>
            <div>
              <h3>15</h3>
              <p>Garbage Trucks</p>
            </div>
            <div>
              <h3>98%</h3>
              <p>Satisfaction Rate</p>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="feature-card top">
            <strong>🚚 Real-time Tracking</strong>
            <p>Track trucks live</p>
          </div>

          <div className="truck">🚛</div>

          <div className="feature-card right">
            <strong>📅 Smart Scheduling</strong>
            <p>Never miss a pickup</p>
          </div>

          <div className="feature-card bottom">
            <strong>💬 Quick Complaints</strong>
            <p>Report & track issues</p>
          </div>
        </div>
      </section>

      {/* 🔹 Second Image – Features Section */}
      <section className="features">
        <h2>Powerful Features</h2>
        <p className="features-subtitle">
          Everything you need for efficient garbage management
        </p>

        <div className="features-grid">

          <div className="feature-box">
            📍
            <h3>Live Truck Tracking</h3>
            <p>
              Track garbage collection trucks in real-time and get
              accurate ETA for your area.
            </p>
          </div>

          <div className="feature-box">
            📅
            <h3>Collection Schedules</h3>
            <p>
              View detailed collection schedules and receive timely
              notifications.
            </p>
          </div>

          <div className="feature-box">
            💬
            <h3>Digital Complaints</h3>
            <p>
              Submit complaints with images and track their status
              easily.
            </p>
          </div>

          <div className="feature-box">
            📱
            <h3>QR Code Scanner</h3>
            <p>
              Scan bin QR codes to view information, status, and history.
            </p>
          </div>

          <div className="feature-box">
            ⭐
            <h3>Feedback System</h3>
            <p>
              Rate services and provide feedback to improve quality.
            </p>
          </div>

          <div className="feature-box">
            🔔
            <h3>Smart Notifications</h3>
            <p>
              Get alerts for upcoming collections and important updates.
            </p>
          </div>

        </div>
      </section>




<div className="schedule_table">
        <h2>All Areas Schedule</h2>

        <table>
          <thead>
            <tr>
              <th>Day</th>
              <th>Time</th>
              <th>Area</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Monday</td>
              <td>07:00 AM</td>
              <td>Colombo 03</td>
              <td><span className="status">Active</span></td>
            </tr>
            <tr>
              <td>Thursday</td>
              <td>07:00 AM</td>
              <td>Colombo 03</td>
              <td><span className="status">Active</span></td>
            </tr>
          </tbody>
        </table>
      </div>




            {/* Call To Action Section */}
      <section className="cta">
        <h2>Ready to Get Started?</h2>
        <p>
          Join thousands of residents making their communities cleaner and greener
        </p>
        <button className="cta-btn">Create Free Account</button>
      </section>
      <br/>
      {/* Floating Live Tracking Button */}
<a href="/track" className="floating-track-btn">
  🚚 Track Live Truck
</a>

<Footer />

    </div>
  );
}

export default Home;

