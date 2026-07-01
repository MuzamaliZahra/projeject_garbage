import React from "react";
import {Navbar,Nav,NavDropdown,Form,FormControl} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faMagnifyingGlass,faUser,faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

import { useNavigate } from "react-router-dom";

import "./Naviation.css";

function NavBar() {

  const navigate = useNavigate();
  

  return (
    <nav className="navbar">
  <div className="navbarLeft">
    <div className="logo">CleanLand</div>
  </div>

  <div className="navbarCenter">
    <Form className="searchBar">
      <div className="searchbarInputBorder">
        <FormControl
          type="text"
          placeholder="Search"
          className="searchInput"
        />
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="searchIcon"
          
        />
      </div>
    </Form>
  </div>

  <div className="navBarRight">
    <ul className="navBarLinks">
     
             <a href="/home" className="navBarItem">
                Home
            </a>
        

      <li>About</li>
      <li>Contact</li>

       
          
      <NavDropdown title="Services">
        <NavDropdown.Item href="/collection_schedule">Collection Schedule</NavDropdown.Item>
        <NavDropdown.Item href="/complaints">Complaints</NavDropdown.Item>
        <NavDropdown.Item href="/track">Tracking</NavDropdown.Item>
        <NavDropdown.Item href="/scanner">Scanning</NavDropdown.Item>
        <NavDropdown.Item href="/feedback">Feedback</NavDropdown.Item>
        <NavDropdown.Item href="/admin_dashboard">Admin Dashboard</NavDropdown.Item>
        <NavDropdown.Item href="/driver_dashboard">Driver Dashboard</NavDropdown.Item>
        <NavDropdown.Item href="/pickup_request">Special Pickup Request</NavDropdown.Item>
      </NavDropdown>

      
          <NavDropdown
            title={
              <span className="profileTrigger">
                <span className="avatar">RS</span>
              </span>
            }
            align="end"
            className="profileDropdown"
          >
            <NavDropdown.Header>
              <div className="profileInfo">
                <strong>Resident </strong>
              </div>

            </NavDropdown.Header>
            <NavDropdown.Divider />
            <NavDropdown.Item href="/profile">
              <FontAwesomeIcon icon={faUser} className="me-2" /> My Profile
            </NavDropdown.Item>
            
            <NavDropdown.Divider />
            <NavDropdown.Item onClick={() => navigate("/login")} className="logoutItem">
              <FontAwesomeIcon icon={faRightFromBracket} className="me-2" /> Logout
            </NavDropdown.Item>
          </NavDropdown>

      
    </ul>
  </div>
</nav>
  );
}

export default NavBar;
