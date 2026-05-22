import React from "react";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer_page">
      <div className="footer_content">

        <div className="footer_colomn">
          <h3>🗑️ CleanLand</h3>
          <p>
            Smart garbage management for a cleaner, greener Sri Lanka.
          </p>
        </div>

        <div className="footer_colomn">
          <h4>Quick Links</h4>
          <ul>
            <li>Features</li>
            <li>About Us</li>
            <li>Login</li>
          </ul>
        </div>

        <div className="footer_colomn">
          <h4>Support</h4>
          <ul>
            <li>Help Center</li>
            <li>FAQ</li>
            <li>Contact Us</li>
          </ul>
        </div>

        <div className="footer_colomn">
          <h4>Contact</h4>
          <p>📧 info@cleanland.lk</p>
          <p>📞 +94 21 245 9178</p>
          <p>📍 Colombo, Sri Lanka</p>
        </div>

      </div>

      <div className="footer_bottom">
        © 2026 CleanLand. All rights reserved. <br />
        Developed by SHAHRA M.A (E2447027) | University of Moratuwa
      </div>
    </footer>
  );
}

export default Footer;
