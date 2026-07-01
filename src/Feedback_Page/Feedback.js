import React, { useEffect, useState } from "react";
import "./Feedback.css";
import NavBar from "../Navigation_Bar_Page/Navigation";
import Footer from "../Footer_Page/Footer";

const API_BASE = "http://localhost:5000";

const getResidentID = () => {
  try {
    return JSON.parse(localStorage.getItem("user") || "{}").id || null;
  } catch { return null; }
};
const StarRating = ({ value, onChange, readonly = false }) => {
  const [selected, setSelected] = useState(parseInt(value) || 0);

  useEffect(() => {
    setSelected(parseInt(value) || 0);
  }, [value]);

  const handleClick = (star) => {
    if (!readonly) {
      setSelected(star);
      onChange(star);
    }
  };

  return (
    <div
      className={`stars ${
        readonly ? "stars_readonly" : "stars_interactive"
      }`}
    >
      {[1, 2, 3, 4, 5].map((star) => (
        <i
          key={star}
          className={`bi ${
            star <= selected ? "bi-star-fill filled" : "bi-star empty"
          }`}
          onClick={() => handleClick(star)}
          style={{
            cursor: readonly ? "default" : "pointer",
            fontSize: "24px",
            marginRight: "5px",
          }}
        ></i>
      ))}
    </div>
  );
};

function Feedback() {
  const residentID = getResidentID();

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [error, setError] = useState("");
  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/get-feedback`);
      const data = await res.json();

      if (data.success) {
        setFeedbackList(data.feedback || []);
      } else {
        setFeedbackList([]);
      }

    } catch {
      console.error("Failed to load feedback.");
      setFeedbackList([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setSuccessMsg("");

    if (!residentID) {
      setError("You must be logged in to submit feedback.");
      return;
    }

    if (rating === 0) {
      setError("Please select a star rating.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/submit-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment, rating, resident_ID: residentID }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccessMsg("Thank you for your feedback!");
        setRating(0);
        setComment("");
        fetchFeedback();
      } else {
        setError(data.message || "Failed to submit feedback.");
      }

    } catch {
      setError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <NavBar />
      <div className="feedback_page">

        <h1 className="feedback_page_title">
          <i className="bi bi-star-fill me-2"></i>
          Feedback & Rating
        </h1>
        <p className="feedback_page_subtitle">Share your experience with our service</p>

        {successMsg && (
          <div className="feedback_banner feedback_success">
            <i className="bi bi-check-circle-fill me-2"></i>
            {successMsg}
          </div>
        )}
        {error && (
          <div className="feedback_banner feedback_error">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            {error}
          </div>
        )}

        <div className="feedback_page_form">
          <h2>Submit Feedback</h2>

          <label>Rate Our Service</label>
          <StarRating value={rating} onChange={setRating} />

          <label>Comments (Optional)</label>
          <textarea
            placeholder="Write your feedback here..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />

          <button onClick={handleSubmit} disabled={submitting}>
            <i className="bi bi-send-fill me-2"></i>
            {submitting ? "Submitting..." : "Submit Feedback"}
          </button>
        </div>

        <div className="recent_part">
          <h2>Recent Feedback from Community</h2>

          {loading ? (
            <p className="feedback_loading">
              <i className="bi bi-arrow-repeat spin me-2"></i>
              Loading feedback...
            </p>
          ) : !feedbackList || feedbackList.length === 0 ? (
            <p className="feedback_empty">
              <i className="bi bi-chat-left-text me-2"></i>
              No feedback yet. Be the first!
            </p>
          ) : (
            feedbackList.map((f) => (
              <div className="feedback_list" key={f.feedback_ID}>
                <div className="feedback_list_text">
                  <p>{f.comment || "No comment provided."}</p>
                  <span>
                    {f.resident_name ? f.resident_name : `Resident #${f.resident_ID}`}
                    {" · "}
                    {f.submitted_date ? f.submitted_date.split("T")[0] : "—"}
                  </span>
                </div>
                <StarRating value={parseInt(f.rating)} readonly={true} />
              </div>
            ))
          )}
        </div>

      </div>
      <Footer />
    </div>
  );
}

export default Feedback;