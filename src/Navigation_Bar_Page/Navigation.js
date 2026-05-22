import React from "react";
import {Navbar,Nav,NavDropdown,Form,FormControl} from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";

import "./Naviation.css";

function NavBar() {
  

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
      <li>Collection Schedule</li>
      <li>Complaints</li>
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

      <button className="loginButton">Login</button>
    </ul>
  </div>
</nav>
  );
}

export default NavBar;
