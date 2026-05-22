import React, { useState, useRef, useEffect } from "react";
import { NavDropdown, Form, FormControl } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,faUser,faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";
import "./admin_navigation.css";

function AdminNavbar() {

 

  return (
    <nav className="navbar">
      <div className="navbarLeft">
        <div className="logo">
          CleanLand
        </div>
      </div>

      <div className="navbarCenter">
        <Form className="searchBar">
          <div className="searchbarInputBorder">
            <FormControl
              type="text"
              placeholder="Search"
              className="searchInput"
            />
            <FontAwesomeIcon icon={faMagnifyingGlass} className="searchIcon" />
          </div>
        </Form>
      </div>

      <div className="navBarRight">
        <ul className="navBarLinks">
   
          <li className="navItem">
            <a href="/admin_dashboard" className="navBarItem">
                Dashboard
            </a>
             <a href="/home" className="navBarItem">
                Home
            </a>
         </li>
            

          <NavDropdown title="Manage">
            <NavDropdown.Item href="/admin_dashboard">Dashboard</NavDropdown.Item>
            <NavDropdown.Item href="/driver_managment">Manage Driver</NavDropdown.Item>
            <NavDropdown.Item href="/resident_managment">Manage Residents</NavDropdown.Item>
            <NavDropdown.Item href="/truck_management">Manage Trucks</NavDropdown.Item>
            <NavDropdown.Item href="/route_managment">Manage Routes</NavDropdown.Item>
            <NavDropdown.Item href="/bin_managment">Manage Bins</NavDropdown.Item>
            <NavDropdown.Item href="/qr_code_manage">Manage QR Codes</NavDropdown.Item>
            <NavDropdown.Item href="/schedule_management">Manage Schedules</NavDropdown.Item>
            <NavDropdown.Item href="/feedback_managemente">Manage Feedback</NavDropdown.Item>
            <NavDropdown.Item href="/content_managment">Manage Content</NavDropdown.Item>
            <NavDropdown.Item href="/complaint_managment">Manage Complaint</NavDropdown.Item>
            <NavDropdown.Item href="/pickup_managment">Manage Spcial Pickup Request</NavDropdown.Item>

          </NavDropdown>

          <NavDropdown title="Add New">
            <NavDropdown.Item href="/add_driver">Add Driver</NavDropdown.Item>
            <NavDropdown.Item href="/add_truck">Add Truck</NavDropdown.Item>
            <NavDropdown.Item href="/add_rout">Add Route</NavDropdown.Item>
            <NavDropdown.Item href="/add_bin">Add Bin</NavDropdown.Item>
            <NavDropdown.Item href="/add_qr_code">Add QR Code</NavDropdown.Item>
            <NavDropdown.Item href="/add_schedule">Add Schedule</NavDropdown.Item>
            <NavDropdown.Item href="/add_content">Add Content</NavDropdown.Item>
          </NavDropdown>



          <NavDropdown
            title={
              <span className="profileTrigger">
                <span className="avatar">AD</span>
              </span>
            }
            align="end"
            className="profileDropdown"
          >
            <NavDropdown.Header>
              <div className="profileInfo">
                <strong>Admin </strong>
                <span>admin@cleanland.lk</span>
              </div>
            </NavDropdown.Header>
            <NavDropdown.Divider />
            <NavDropdown.Item href="/profile">
              <FontAwesomeIcon icon={faUser} className="me-2" /> My Profile
            </NavDropdown.Item>
            
            <NavDropdown.Divider />
            <NavDropdown.Item href="/logout" className="logoutItem">
              <FontAwesomeIcon icon={faRightFromBracket} className="me-2" /> Logout
            </NavDropdown.Item>
          </NavDropdown>

        </ul>
      </div>
    </nav>
  );
}

export default AdminNavbar;