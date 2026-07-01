import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./add_schedule.css";
import "../extra_CSS_file.css";
import AdminNavBar from "../Admin_Navigation_Bar/admin_navigation";
import "bootstrap-icons/font/bootstrap-icons.css";


const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];


function AddSchedule() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        schedule_id: "",
        time: "",
        status: "Active",
        route_ID: "",
        area: ""
    });

    const [routes, setRoutes] = useState([]);
    const [selectedRoute, setSelectedRoute] = useState(null);
    const [selectedDays, setSelectedDays] = useState([]);
    const [truckConflict, setTruckConflict] = useState(null);
    const [conflictDetails, setConflictDetails] = useState(null);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Fetch all routes 
    useEffect(() => {
        axios
            .get("http://localhost:5000/get-routes")
            .then((res) => {
                setRoutes(res.data);
                setLoading(false);
            })
            .catch(() => {
                setError("Failed to load routes.");
                setLoading(false);
            });
    }, []);


    const [scheduledRoutes, setScheduledRoutes] = useState([]);

    // Fetch existing schedules to know which routes are taken
    useEffect(() => {
        axios.get("http://localhost:5000/get-schedules")
            .then((res) => {
                const usedRouteIDs = [...new Set(res.data.map((s) => s.route_ID))];
                setScheduledRoutes(usedRouteIDs);
            })
            .catch(() => console.log("Failed to load schedules."));
    }, []);


    // Check truck availability whenever route, time, or selected days change
    useEffect(() => {
        if (!formData.route_ID || !formData.time || selectedDays.length === 0) {
            setTruckConflict(null);
            setConflictDetails(null);
            return;
        }

        const route = routes.find((r) => r.route_ID == formData.route_ID);
        if (!route || !route.truck_ID) {
            setTruckConflict(null);
            return;
        }

        setTruckConflict("checking");
        setConflictDetails(null);

        // Check each selected day individually
        const checks = selectedDays.map((day) =>
            axios.get("http://localhost:5000/check-truck-availability", {
                params: {
                    truck_ID: route.truck_ID,
                    time: formData.time,
                    day_of_week: day,
                },
            })
        );

        Promise.all(checks)
            .then((responses) => {
                const conflictIndex = responses.findIndex((res) => res.data.conflict);
                if (conflictIndex !== -1) {
                    setTruckConflict("conflict");
                    setConflictDetails({
                        ...responses[conflictIndex].data.conflictDetails,
                        day: selectedDays[conflictIndex],
                    });
                } else {
                    setTruckConflict("ok");
                    setConflictDetails(null);
                }
            })
            .catch(() => setTruckConflict(null));
    }, [formData.route_ID, formData.time, selectedDays, routes]);


    const handleChange = (e) => {
        const { name, value } = e.target;
        setError("");
        setSuccess("");

        if (name === "route_ID") {
            const route = routes.find((r) => r.route_ID == value);
            setSelectedRoute(route || null);
            setTruckConflict(null);
            setConflictDetails(null);
        }

        setFormData((prev) => ({ ...prev, [name]: value }));
    };


    const toggleDay = (day) => {
        setError("");
        setSelectedDays((prev) =>
            prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
        );
    };

    const selectAllDays  = () => setSelectedDays([...DAYS]);
    const clearAllDays   = () => setSelectedDays([]);
    const selectWeekdays = () => setSelectedDays(["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    const selectWeekend  = () => setSelectedDays(["Saturday", "Sunday"]);


    const handleSubmit = (e) => {
        e.preventDefault();

        if (!formData.schedule_id || !formData.time || !formData.route_ID) {
            setError("All fields are required.");
            return;
        }

        if (selectedDays.length === 0) {
            setError("Please select at least one day.");
            return;
        }

        if (!selectedRoute) {
            setError("Please select a valid route.");
            return;
        }

        if (!selectedRoute.area_name) {
            setError("Selected route has no area assigned.");
            return;
        }

        if (truckConflict === "conflict") {
            setError("Truck is already assigned at this time. Please choose a different time.");
            return;
        }

        if (truckConflict === "checking") {
            setError("Please wait - checking truck availability...");
            return;
        }

        setSubmitting(true);
        setError("");
        setSuccess("");

        // send one POST per selected day, each with unique schedule_id
        const promises = selectedDays.map((day) => {
            const payload = {
                schedule_id: `${formData.schedule_id}-${day.slice(0, 3).toUpperCase()}`,
                time:        formData.time,
                area:        selectedRoute?.area_name || "",
                status:      formData.status,
                day_of_week: day,
                route_ID:    formData.route_ID,
            };
            return axios.post("http://localhost:5000/add-schedule", payload);
        });

        Promise.all(promises)
            .then(() => {
                setSuccess(
                    `Schedule "${formData.schedule_id}" added successfully for ${selectedDays.length} day${selectedDays.length > 1 ? "s" : ""}!`
                );
                //  Reset ALL state including selectedDays
                setFormData({
                    schedule_id: "",
                    time: "",
                    status: "Active",
                    route_ID: "",
                    area: "",
                });
                setSelectedRoute(null);
                setSelectedDays([]);          
                setTruckConflict(null);
                setConflictDetails(null);
                setSubmitting(false);

                // Refresh scheduled routes so the just added route appears as taken
                axios.get("http://localhost:5000/get-schedules")
                    .then((res) => {
                        const usedRouteIDs = [...new Set(res.data.map((s) => s.route_ID))];
                        setScheduledRoutes(usedRouteIDs);
                    })
                    .catch(() => {});
            })
            .catch((err) => {
                // Show which specific day failed 
                const msg = err.response?.data || "Server error. Please try again.";
                setError(typeof msg === "string" ? msg : JSON.stringify(msg));
                setSubmitting(false);
            });
    };


    return (
        <div className="as_page">
             <AdminNavBar/>

            <div className="ad-body">
                {/* Page title */}
                <div className="as_page_title">
                    <h2>Add New Schedule</h2>
                    <p>Assign a collection schedule to a route with date and time</p>
                </div>

                {/* Stats row */}
                <div className="status_row">
                    <div className="status_card green">
                       <div className="status_num">
                        <i className="bi bi-calendar-event-fill"></i>
                        </div>
                        <div className="status_label">New Schedule</div>
                    </div>
                    <div className="status_card orange">
                        <div className="status_num">{routes.length}</div>
                        <div className="status_label">Total Routes</div>
                    </div>
                    <div className="status_card blue">
                        <div className="status_num">
                            {routes.filter((r) => r.truck_ID).length}
                        </div>
                        <div className="status_label">Routes with Trucks</div>
                    </div>
                </div>

                {/* Form Card */}
                <div className="as_card">
                    <div className="as_card_icon_wrap">
                       <div className="as_card_icon">
                        <i className="bi bi-calendar-event-fill "></i>
                        </div>
                        <div className="as_card_label">Schedule Registration</div>
                    </div>

                   {error && (
                    <div className="as_alert as_alert_error">
                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                        {error}
                    </div>
                    )}

                    {success && (
                    <div className="as_alert as_alert_success">
                        <i className="bi bi-check-circle-fill me-2"></i>
                        {success}
                    </div>
                    )}
                      <form onSubmit={handleSubmit}>

                        {/* Row 1 */}
                        <div className="as_form_row">
                            <div className="as_form_group">
                                <label>Schedule ID</label>
                                <input
                                    type="text"
                                    name="schedule_id"
                                    placeholder="e.g. SCH001"
                                    value={formData.schedule_id}
                                    onChange={handleChange}
                                    required
                                />
                                {formData.schedule_id && selectedDays.length > 0 && (
                                    <div className="as_id_hint">
                                        Will create: {selectedDays.map(d =>
                                            `${formData.schedule_id}-${d.slice(0, 3).toUpperCase()}`
                                        ).join(", ")}
                                    </div>
                                )}
                            </div>
                            <div className="as_form_group">
                                <label>Status</label>
                                <select name="status" value={formData.status} onChange={handleChange}>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>

                        {/* Day Selector */}
                        <div className="as_form_group">
                            <label>Select Days <span className="as_required">*</span></label>

                            <div className="as_day_quick_btns">
                                <button type="button" className="as_quick_btn" onClick={selectAllDays}>All Days</button>
                                <button type="button" className="as_quick_btn" onClick={selectWeekdays}>Weekdays</button>
                                <button type="button" className="as_quick_btn" onClick={selectWeekend}>Weekend</button>
                                <button type="button" className="as_quick_btn as_quick_clear" onClick={clearAllDays}>Clear</button>
                            </div>

                            <div className="as_day_pills">
                                {DAYS.map((day) => (
                                    <button
                                        key={day}
                                        type="button"
                                        className={`as_day_pill ${selectedDays.includes(day) ? "selected" : ""}`}
                                        onClick={() => toggleDay(day)}
                                    >
                                        <span className="as_day_short">{day.slice(0, 3)}</span>
                                        <span className="as_day_full">{day}</span>
                                    </button>
                                ))}
                            </div>

                            {selectedDays.length > 0 && (
                                <div className="as_selected_days_summary">
                                    <i className="bi bi-calendar-check-fill me-2"></i>
                                     Selected: <strong>{selectedDays.join(", ")}</strong>
                                    <span className="as_days_count">
                                        ({selectedDays.length} day{selectedDays.length > 1 ? "s" : ""})
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Time */}
                        <div className="as_form_group">
                            <label>Time <span className="as_required">*</span></label>
                            <input
                                type="time"
                                name="time"
                                value={formData.time}
                                onChange={handleChange}
                                required
                            />

                            {truckConflict === "checking" && (
                                <div className="as_availability checking"> Checking truck availability...</div>
                            )}
                            {truckConflict === "ok" && (
                                <div className="as_availability ok">✓ Truck is available on all selected days</div>
                            )}
                            {truckConflict === "conflict" && (
                                <div className="as_availability conflict">
                                     Truck conflict on <strong>{conflictDetails?.day}</strong>
                                    {conflictDetails && (
                                        <span> — assigned to <strong>{conflictDetails.route_name}</strong> at {conflictDetails.time}</span>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Route Selection */}
                       
                    <div className="as_form_group">
                        <label>
                            Select Route <span className="as_required">*</span>
                        </label>

                        {loading ? (
                            <div className="as_loading_select">
                                <i className="bi bi-arrow-repeat me-2"></i>
                                Loading routes...
                            </div>
                        ) : routes.length === 0 ? (
                            <div className="as_no_data">
                                <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                No routes available. Please add a route first.
                            </div>
                        ) : (
                            <select
                                name="route_ID"
                                value={formData.route_ID}
                                onChange={handleChange}
                                required
                            >
                                <option value="">--- Select a Route ---</option>

                                {routes.map((route) => {
                                    const isScheduled = scheduledRoutes.includes(
                                        route.route_ID
                                    );

                                    return (
                                        <option
                                            key={route.route_ID}
                                            value={route.route_ID}
                                            disabled={isScheduled}
                                            style={{
                                                color: isScheduled
                                                    ? "#aaa"
                                                    : "inherit",
                                            }}
                                        >
                                            {isScheduled ? "[Scheduled]" : "[Available]"}{" "}
                                            {route.route_name} - ID:{" "}
                                            {route.route_ID} | Area:{" "}
                                            {route.area_name}
                                            {isScheduled
                                                ? " (Already Scheduled)"
                                                : route.truck_ID
                                                ? ` | Truck: ${route.truck_ID}`
                                                : " | No Truck"}
                                        </option>
                                    );
                                })}
                            </select>
                        )}

                        <div className="as_route_availability_hint">
                            <i className="bi bi-info-circle-fill me-1"></i>
                            {
                                routes.filter(
                                    (r) =>
                                        !scheduledRoutes.includes(r.route_ID)
                                ).length
                            }{" "}
                            of {routes.length} routes available
                        </div>
                    </div>

                        {/* Area auto filled */}
                        {selectedRoute && (
                            <div className="as_form_group">
                                <label>Area</label>
                                <input
                                    type="text"
                                    value={selectedRoute.area_name || "No area assigned"}
                                    readOnly
                                />
                            </div>
                        )}

                        {/* Conflict Banner */}
                        {truckConflict === "conflict" && (
                            <div className="as_conflict_banner">
                               <div className="as_conflict_icon">
                                    <i className="bi bi-x-octagon-fill text-danger"></i>
                                </div>
                                <div className="as_conflict_text">
                                    <strong>Truck Unavailable on {conflictDetails?.day}</strong>
                                    <p>
                                        The truck assigned to this route is already scheduled on{" "}
                                        <strong>{conflictDetails?.day}</strong> at{" "}
                                        <strong>{formData.time}</strong>.
                                        {conflictDetails && (
                                            <> It is assigned to route <strong>"{conflictDetails.route_name}"</strong>.</>
                                        )}
                                        Please select a different time or deselect <strong>{conflictDetails?.day}</strong>.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Route Preview */}
                        {selectedRoute && (
                            <div className="as_route_preview">
                                <div className="as_route_preview_header">
                                    <span className="as_preview_icon">
                                        <i className="bi bi-geo-alt-fill text-danger"></i>
                                    </span>
                                    <div>
                                        <div className="as_preview_route_name">{selectedRoute.route_name}</div>
                                        <div className="as_preview_route_id">Route ID: {selectedRoute.route_ID}</div>
                                    </div>
                                </div>
                                <div className="as_route_detail_grid">

                        <div className="as_route_detail_item">
                            <span className="as_detail_label">
                                <i className="bi bi-geo-alt-fill text-success me-1"></i>
                                Start
                            </span>
                            <span className="as_detail_value">
                                {selectedRoute.start_location}
                            </span>
                        </div>

                        <div className="as_route_detail_item">
                            <span className="as_detail_label">
                                <i className="bi bi-geo-alt-fill text-danger me-1"></i>
                                End
                            </span>
                            <span className="as_detail_value">
                                {selectedRoute.end_location}
                            </span>
                        </div>

                        <div className="as_route_detail_item">
                            <span className="as_detail_label">
                                <i className="bi bi-pin-map-fill me-1"></i>
                                Area
                            </span>
                            <span className="as_detail_value">
                                {selectedRoute.area_name}
                            </span>
                        </div>

                        <div className="as_route_detail_item">
                            <span className="as_detail_label">
                                <i className="bi bi-clock-fill me-1"></i>
                                Duration
                            </span>
                            <span className="as_detail_value">
                                {selectedRoute.estimated_duration || "—"}
                            </span>
                        </div>

                        <div className="as_route_detail_item">
                            <span className="as_detail_label">
                                <i className="bi bi-truck-front-fill me-1"></i>
                                Truck
                            </span>
                            <span className="as_detail_value">
                                {selectedRoute.truck_ID ? (
                                    `ID: ${selectedRoute.truck_ID}`
                                ) : (
                                    <span style={{ color: "#e8872a" }}>
                                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                        No truck assigned
                                    </span>
                                )}
                            </span>
                        </div>

                        <div className="as_route_detail_item">
                            <span className="as_detail_label">
                                <i className="bi bi-person-fill me-1"></i>
                                Driver
                            </span>
                            <span className="as_detail_value">
                                {selectedRoute.driver_name || selectedRoute.driver_ID ? (
                                    selectedRoute.driver_name ||
                                    `ID: ${selectedRoute.driver_ID}`
                                ) : (
                                    <span style={{ color: "#e8872a" }}>
                                        <i className="bi bi-exclamation-triangle-fill me-1"></i>
                                        No driver assigned
                                    </span>
                                )}
                            </span>
                        </div>

                    </div>
                            </div>
                        )}

                        {/* Summary Preview */}
                        {formData.schedule_id && formData.time && formData.route_ID &&
                         selectedDays.length > 0 && truckConflict !== "conflict" && (
                            <div className="as_summary_preview">
                                <div className="as_summary_title">
                                <i className="bi bi-clipboard-data-fill me-2"></i>
                                Schedule Summary
                                </div>
                                <div className="as_summary_grid">
                                    <div className="as_summary_item">
                                        <span className="as_summary_label">Schedule ID</span>
                                        <span className="as_summary_value">{formData.schedule_id}</span>
                                    </div>
                                    <div className="as_summary_item">
                                        <span className="as_summary_label">Days</span>
                                        <span className="as_summary_value">{selectedDays.join(", ")}</span>
                                    </div>
                                    <div className="as_summary_item">
                                        <span className="as_summary_label">Time</span>
                                        <span className="as_summary_value">{formData.time}</span>
                                    </div>
                                    <div className="as_summary_item">
                                        <span className="as_summary_label">Area</span>
                                        <span className="as_summary_value">{selectedRoute?.area_name || "—"}</span>
                                    </div>
                                    <div className="as_summary_item">
                                        <span className="as_summary_label">Route</span>
                                        <span className="as_summary_value">{selectedRoute?.route_name || "—"}</span>
                                    </div>
                                    <div className="as_summary_item">
                                        <span className="as_summary_label">Status</span>
                                        <span className={`as_status_badge ${formData.status === "Active" ? "active" : "inactive"}`}>
                                            {formData.status}
                                        </span>
                                    </div>
                                    <div className="as_summary_item">
                                        <span className="as_summary_label">Entries to Create</span>
                                        <span className="as_summary_value as_entries_count">
                                            {selectedDays.length} schedule{selectedDays.length > 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Buttons */}
                        <div className="as_btn_row">
                            <button type="button" className="as_btn_cancel" onClick={() => navigate(-1)}>
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="as_btn_submit"
                                disabled={truckConflict === "conflict" || truckConflict === "checking" || submitting}
                            >
                                {submitting
                                    ? "Adding..."
                                    : ` Add Schedule${selectedDays.length > 1 ? ` (${selectedDays.length} days)` : ""}`}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
}

export default AddSchedule;