import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../css/Navbar.css";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mainDropdownOpen, setMainDropdownOpen] = useState(false);
  const [assetDropdownOpen, setAssetDropdownOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleMainDropdown = (e) => {
    e.preventDefault();
    setMainDropdownOpen(!mainDropdownOpen);
    if (assetDropdownOpen) setAssetDropdownOpen(false);
  };

  const toggleAssetDropdown = (e) => {
    e.preventDefault();
    setAssetDropdownOpen(!assetDropdownOpen);
    if (mainDropdownOpen) setMainDropdownOpen(false);
  };

  const closeAllDropdowns = () => {
    setMainDropdownOpen(false);
    setAssetDropdownOpen(false);
    setIsMenuOpen(false);
  };

  const handleNavClick = () => {
    closeAllDropdowns();
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/home" className="navbar-logo" onClick={closeAllDropdowns}>
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
          <span className="logo-text">Inventory Management System</span>
        </Link>

        {/* Desktop Navigation */}
        <ul className={`nav-menu ${isMenuOpen ? "active" : ""}`}>
          <li className="nav-item">
            <Link to="/home" className="nav-link" onClick={handleNavClick}>
              Home
            </Link>
          </li>

          {/* Main Dropdown */}
          <li
            className={`nav-item dropdown ${mainDropdownOpen ? "active" : ""}`}
          >
            <button
              className="nav-link dropdown-toggle"
              onClick={toggleMainDropdown}
            >
              Main
              <span className="dropdown-arrow">▼</span>
            </button>

            <ul className={`dropdown-menu ${mainDropdownOpen ? "active" : ""}`}>
              <li className="dropdown-item">
                <Link
                  to="/center"
                  className="dropdown-link"
                  onClick={handleNavClick}
                >
                  Center
                </Link>
              </li>
              <li className="dropdown-item">
                <Link
                  to="/location"
                  className="dropdown-link"
                  onClick={handleNavClick}
                >
                  Location
                </Link>
              </li>
              <li className="dropdown-item">
                <Link
                  to="/department"
                  className="dropdown-link"
                  onClick={handleNavClick}
                >
                  Department
                </Link>
              </li>
              <li className="dropdown-item">
                <Link
                  to="/supplier"
                  className="dropdown-link"
                  onClick={handleNavClick}
                >
                  Supplier Details
                </Link>
              </li>
            </ul>
          </li>

          {/* Asset Dropdown */}
          <li
            className={`nav-item dropdown ${assetDropdownOpen ? "active" : ""}`}
          >
            <button
              className="nav-link dropdown-toggle"
              onClick={toggleAssetDropdown}
            >
              Asset
              <span className="dropdown-arrow">▼</span>
            </button>
            <ul
              className={`dropdown-menu ${assetDropdownOpen ? "active" : ""}`}
            >
              <li className="dropdown-item">
                <Link
                  to="/fixed-asset"
                  className="dropdown-link"
                  onClick={handleNavClick}
                >
                  Fixed Asset
                </Link>
              </li>
              <li className="dropdown-item">
                <Link
                  to="/fixed-asset-sub"
                  className="dropdown-link"
                  onClick={handleNavClick}
                >
                  Sub Category
                </Link>
              </li>
              <li className="dropdown-item">
                <Link
                  to="/item-grn"
                  className="dropdown-link"
                  onClick={handleNavClick}
                >
                  Item-GRN
                </Link>
              </li>
              <li className="dropdown-item">
                <Link
                  to="/item-grn-approve"
                  className="dropdown-link"
                  onClick={handleNavClick}
                >
                  Item-GRN Approve
                </Link>
              </li>
            </ul>
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
