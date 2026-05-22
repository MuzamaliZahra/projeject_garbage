import React, { useState } from "react";
import "./Signup.css";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone_no: "",
    address: "",
    password: ""
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setError("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.email ||
      !formData.phone_no ||
      !formData.address ||
      !formData.password
    ) {
      setError("All fields are required");
      return;
    }

    if (formData.phone_no.length < 10) {
      setError("Phone number must be at least 10 digits.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    axios
      .post("http://localhost:5000/signup", formData)
      .then((res) => {
        alert("Registration Successful");
        navigate("/login");
      })
      .catch((err) => {
        if (err.response && err.response.data) {
          setError(err.response.data);
        } else {
          setError("Error occurred. Please try again.");
        }

        console.log(err);
      });
  };

  return (
    <div className="register-container d-flex justify-content-center align-items-center">
      <div className="register-card shadow-lg">

        <h2 className="text-center title">
          CleanLand
        </h2>
        
        <p className="text-center subtitle">
          Join CleanLand Community
        </p>

        {error && (
          <div className="alert alert-danger text-center py-2">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="mb-3">
            <label className="form-label">
              Full Name
            </label>

            <input
              type="text"
              name="name"
              className="form-control"
              placeholder="Enter your full name"
              onChange={handleChange}
              value={formData.name}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Email
            </label>

            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="Enter your email"
              onChange={handleChange}
              value={formData.email}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Phone
            </label>

            <input
              type="text"
              name="phone_no"
              className="form-control"
              placeholder="Enter your phone number"
              onChange={handleChange}
              value={formData.phone_no}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Address
            </label>

            <input
              type="text"
              name="address"
              className="form-control"
              placeholder="Enter your address"
              onChange={handleChange}
              value={formData.address}
              required
            />
          </div>

          <div className="mb-4">
            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="Minimum 6 characters"
              onChange={handleChange}
              value={formData.password}
              required
            />
          </div>

          <div className="d-grid mb-3">
            <button
              type="submit"
              className="btn register-btn"
            >
              Register
            </button>
          </div>

          <p className="text-center">
            Already have an account? <Link to="/login">Login</Link>
          </p>

         

        </form>
      </div>
    </div>
  );
}

export default SignUp;