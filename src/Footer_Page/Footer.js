import React from "react";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./Footer.css";

function Footer() {
  return (
    <footer className="footer_page">

      <div className="footer_content">

        {/* Brand */}
        <div className="footer_colomn">
          <h3>
            <i className="bi bi-trash3-fill"></i>
            CleanLand
          </h3>

          <p>
            Smart garbage management for a cleaner,
            greener Sri Lanka.
          </p>
        </div>

        {/* Quick Links */}
        <div className="footer_colomn">
          <h4>Quick Links</h4>

          <ul>
            <li>
              <i className="bi bi-grid-fill"></i>
              Features
            </li>

            <li>
              <i className="bi bi-info-circle-fill"></i>
              About Us
            </li>

            <li>
              <i className="bi bi-box-arrow-in-right"></i>
              Login
            </li>
          </ul>
        </div>

        {/* Support */}
        <div className="footer_colomn">
          <h4>Support</h4>

          <ul>
            <li>
              <i className="bi bi-life-preserver"></i>
              Help Center
            </li>

            <li>
              <i className="bi bi-question-circle-fill"></i>
              FAQ
            </li>

            <li>
              <i className="bi bi-headset"></i>
              Contact Us
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div className="footer_colomn">
          <h4>Contact</h4>

          <p>
            <i className="bi bi-envelope-fill"></i>
            info@cleanland.lk
          </p>

          <p>
            <i className="bi bi-telephone-fill"></i>
            +94 21 245 9178
          </p>

          <p>
            <i className="bi bi-geo-alt-fill"></i>
            Colombo, Sri Lanka
          </p>
        </div>

      </div>

      {/* Footer Bottom */}
      <div className="footer_bottom">
        © 2026 CleanLand. All rights reserved.
        <br />
        
      </div>

    </footer>
  );
}

export default Footer;