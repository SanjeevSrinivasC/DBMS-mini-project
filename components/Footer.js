import React from "react";
import "./Footer.css";

const Footer = () => {
  return (
    <footer className="footer">
      <p>Copyright © 2024, FlickTickets. All rights reserved.</p>
      <nav>
        <a href="#">Home</a> |
        <a href="#">About Us</a> |
        <a href="#">Terms & Conditions</a> |
        <a href="#">FAQ</a> |
        <a href="#">Contact Us</a>
      </nav>
    </footer>
  );
};

export default Footer;
