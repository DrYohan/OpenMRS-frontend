import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/home" className="navbar-logo">
          <div className="logo-icon">
            <svg
              width="40"
              height="40"
              viewBox="0 0 40 40"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect width="40" height="40" rx="8" fill="url(#gradient)" />
              <path d="M20 10L12 18H16V28H24V18H28L20 10Z" fill="white" />
              <defs>
                <linearGradient id="gradient" x1="0" y1="0" x2="40" y2="40">
                  <stop offset="0%" stopColor="#667eea" />
                  <stop offset="100%" stopColor="#764ba2" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <span className="logo-text ">Inventory Management System</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <li className="nav-item">
            <Link to="/home" className="nav-link">
              Home
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/center" className="nav-link">
              Center
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/location" className="nav-link">
              Location
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/department" className="nav-link">
              Department
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/fixed-asset" className="nav-link">
              Fixed Asset
            </Link>
          </li>
        </ul>

        {/* Mobile Menu Toggle */}
        <button className="menu-toggle" onClick={toggleMenu}>
          <span className={`hamburger ${isMenuOpen ? "active" : ""}`}></span>
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
