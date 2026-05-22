import React, { useEffect, useState } from "react";
import "./CollectionSchedule.css";
import NavBar from "../Navigation_Bar_Page/Navigation";
import Footer from "../Footer_Page/Footer";
import axios from "axios";

const DAY_ORDER = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];


const formatTime = (t) => {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h);
  return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
};

function CollectionSchedule(){

  const [mySchedules, setMySchedules] = useState([]);
  const [allSchedules, setAllSchedules] = useState([]);
  const [matchedArea, setMatchedArea] = useState("");
  const [loadingMine, setLoadingMine] = useState(true);
  const [loadingAll, setLoadingAll] = useState(true);
  const [error, setError] = useState("");

  // Reads from the "user" object stored by your login page

  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const residentId = user?.resident_ID || user?.id || user?.resident_id;

  // fetch this resident's matched route schedule

  useEffect(() => {
    if (!residentId) {
      setLoadingMine(false);
      return;
    }
    axios.get(`http://localhost:5000/get-resident-schedule/${residentId}`)
      .then((res) => {
        setMatchedArea(res.data.matchedArea || "");
        setMySchedules(res.data.schedules || []);
        setLoadingMine(false);
      })
      
      .catch(() => {
    setError("Could not load your area schedule.");
    setLoadingMine(false);
  });;

      
  }, [residentId]);

  //fetch all schedules
  useEffect(() => {
      axios.get("http://localhost:5000/get-schedules")
        .then((res) => {setAllSchedules(res.data || []); setLoadingAll(false);})
        .catch(() => setLoadingAll(false));
  }, []);

  const myScheduleIds = new Set(mySchedules.map((s) =>  s.schedule_id ));
  const otherSchedules = allSchedules.filter((s) => !myScheduleIds.has(s.schedule_id));

  const sortByDay = (arr) => 
  [...arr].sort(
    (a,b) => DAY_ORDER.indexOf(a.day_of_week) - DAY_ORDER.indexOf(b.day_of_week)
  );

  const tableData = mySchedules.length === 0 ? allSchedules : otherSchedules;


  return (
<>
<NavBar/>
    <div className="schedule_Page">
          
      <h1 className="schedule_Page_title">Collection Schedule</h1>
      <p className="schedule_Page_subtitle">View garbage collection schedule for your area</p>

      {error && <p style={{ color: "red"}}>⚠ {error}</p>}


      {/* Area Card */}
      <div className="area_part">
        <h2 className="area_name">
          Your Area: {matchedArea || "-"}
        </h2>

        {!residentId ? (
          <p>Please <strong>log in</strong> to see your personalised area schedule.</p>
        ) : loadingMine ? (
          <p>Loading your schedules...</p>
        ) : mySchedules.length === 0 ? (
          <p>No schedules found for your area yet. Please contact the admin</p>
        ) : (
          sortByDay(mySchedules)
        .map((s) => (
          <div className="Time_Date" key= {s.schedule_id}>
            <div>
              <h3>{s.day_of_week} || {s.day_of_week}</h3>
              <p>{formatTime(s.time)} - {s.area}</p>
              {s.route_name && <p> {s.route_name}</p>}
            </div>
            <span className="status">{s.status}</span>
          </div>
        ))        
        )}

       {mySchedules.length > 0 && (
            <div className="notification">
              🔔 You will receive notifications before each scheduled collection
            </div>
          )}
        </div>

        {/* Table Section */}
        <div className="schedule_table">
          <h2>All Areas Schedule</h2>


            {loadingAll ? (
              <p>Loading schedules...</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Day</th>
                    <th>Time</th>
                    <th>Area</th>
                    <th>Route</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {sortByDay(tableData).map ((s) => (
                    <tr key={s.schedule_id}>
                      <td>{s.day_of_week || "📅"} {s.day_of_week}</td>
                      <td>{formatTime(s.time)}</td>
                      <td>{s.area || "-"}</td>
                      <td>{s.route_name || `Route ${s.route_ID}` || "-"}</td>
                       <td><span className="status">{s.status || "—"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        
      <br/>
      <br/>

    </div>
    <Footer />
    </>
  );
};

export default CollectionSchedule;
