import React from 'react';
import './Footer.css'; // Optional: You can create a Footer.css file for styling.

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} Virtual Trading | Developed by Amit Kumar | All rights reserved</p>
      </div>
    </footer>
  );
};

export default Footer;
