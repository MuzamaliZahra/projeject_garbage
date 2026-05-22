import "./driver_dashboard.css";
import NavBar from "../Navigation_Bar_Page/Navigation";
import Footer from "../Footer_Page/Footer";

export default function DriverDashboard() {
  return (
    <>
    <NavBar/>
    <div className="driver_page">


      {/* Header */}
      <header className="driver_page_heading">
        <h1>Driver Dashboard 🚛</h1>
        <p>Your daily route and vehicle overview</p>
      </header>

      {/* Stats */}
      <section className="stats_driver_page">
        <StatBox value="12/15" label="Bins Collected Today" color="green" />
        <StatBox value="3" label="Remaining Stops" color="orange" />
        <StatBox value="8.5 km" label="Distance Covered" color="teal" />
        <StatBox value="45 min" label="Est Time Remaining" color="blue" />
      </section>



      {/* Today's Route */}
      <section className="route_details">
        <h3>Today's Route – Colombo 03</h3>
        <RouteItem
          stop="Stop 1: Galle Road"
          details="15 bins · Residential area"
          status="completed"
        />
        <RouteItem
          stop="Stop 2: Marine Drive"
          details="10 bins · Commercial area"
          status="active"
        />
        <RouteItem
          stop="Stop 3: Duplication Road"
          details="8 bins · Mixed area"
          status="pending"
        />
      </section>

      {/* Vehicle Info */}
      <section className="panel vehicle_card">
        <h3>Vehicle Information</h3>
        <ul>
          <li>🚚 Vehicle Number: <strong>WP CAB 1234</strong></li>
          <li>⛽ Fuel Level: <strong>75%</strong></li>
          <li>🛠️ Last Maintenance: <strong>2024-01-15</strong></li>
        </ul>
      </section>

      {/* Quick Actions */}
      <section className="panel actions_card">
        <h3>Quick Actions</h3>
        <div className="actions_grid">
          <button className="btn green">📷 Scan Bin QR Code</button>
          <button className="btn orange">⚠️ Report Issue</button>
          <button className="btn outline">🗺️ View Full Route</button>
          <button className="btn outline">☕ Take Break</button>
        </div>
      </section>
    </div>
    <Footer/>
    </>
  );
}

/* Components */
function StatBox({ value, label, color }) {
  return (
    <div className={`stat ${color}`}>
      <h2>{value}</h2>
      <p>{label}</p>
    </div>
  );
}

function RouteItem({ stop, details, status }) {
  return (
    <div className="route_item">
      <div className="route_text">
        <h4>{stop}</h4>
        <p>{details}</p>
      </div>
      <div className={`status ${status}`}>
        {status === "completed"
          ? "✔ Completed"
          : status === "active"
          ? "Mark Complete"
          : "Pending"}
      </div>

    </div>
    
  );
}
