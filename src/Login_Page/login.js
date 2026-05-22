import React, { useState } from "react";
import "./login.css";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function ResidentLogin() {

  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    role: "Resident"
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    setError("");
  };

  const handleLogin = (e) => {
    e.preventDefault();

    axios.post("http://localhost:5000/login", formData)
      .then((res) => {

        if (res.data.success) {

          localStorage.setItem(
            "user",
            JSON.stringify(res.data.user)
          );

          localStorage.setItem(
            "role",
            res.data.role
          );

          alert(`Welcome, ${res.data.user.name}!`);

          if (res.data.role === "Admin") {
            navigate("/admin/home");

          } else if (res.data.role === "Collector") {
            navigate("/driver/home");

          } else {
            navigate("/home");
          }
        }
      })
      .catch((err) => {

        if (
          err.response &&
          err.response.status === 401
        ) {
          setError(
            "Invalid email or password. Please try again."
          );
        } else {
          setError(
            "Server error. Please try again later."
          );
        }

        console.log(err);
      });
  };

  return (
    <div className="login-page d-flex justify-content-center align-items-center">

      <div className="login-card shadow">

        <h2 className="text-center title">
          CleanLand
        </h2>

        <p className="text-center subtitle">
          Garbage Management System
        </p>

        <form onSubmit={handleLogin}>

          <div className="mb-3">
            <label className="form-label">
              Email Address
            </label>

            <input
              type="email"
              name="email"
              className="form-control"
              placeholder="resident@cleanland.lk"
              onChange={handleChange}
              value={formData.email}
              required
            />
          </div>

          <div className="mb-3">
            <label className="form-label">
              Password
            </label>

            <input
              type="password"
              name="password"
              className="form-control"
              placeholder="******"
              onChange={handleChange}
              value={formData.password}
              required
            />
          </div>

          <div className="mb-3 text-center">
            <label className="form-label-center">
              Login As
            </label>

            <select
              name="role"
              className="form-select"
              onChange={handleChange}
              value={formData.role}
            >
              <option>Resident</option>
              <option>Admin</option>
              <option>Collector</option>
            </select>
          </div>

          {error && (
            <div
              className="alert alert-danger py-2"
              role="alert"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            className="btn login-btn w-100 mb-2"
          >
            LOGIN
          </button>

          <p className="mt-2 text-center">
            Don't have an account?
            <Link to="/">
              Sign Up
            </Link>
          </p>

        </form>

      </div>
    </div>
  );
}

export default ResidentLogin;