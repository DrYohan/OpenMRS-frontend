import React, { Component } from "react";
import feather from "feather-icons";

export default class Sidebar extends Component {
  componentDidMount() {
    // Initialize Feather icons after the component mounts
    feather.replace();
  }

  render() {
    return (
      <div
        className="app-menu"
        style={{ boxShadow: "rgba(0, 0, 0, 0.75) 0px 0px 4px -1px" }}
      >
        {/* Brand Logo */}
        <div className="logo-box">
          {/* Brand Logo Light */}
          <a href="/" className="logo-light">
            <img src="assets/images/Logo.png" alt="logo" className="logo-lg" />
            <img
              src="assets/images/Logo.png"
              alt="small logo"
              className="logo-sm"
            />
          </a>

          {/* Brand Logo Dark */}
          <a href="/" className="logo-dark">
            <img
              src="assets/images/Logo.png"
              alt="dark logo"
              className="logo-lg"
            />
            <img
              src="assets/images/Logo.png"
              alt="small logo"
              className="logo-sm"
            />
          </a>
        </div>

        {/* Menu */}
        <div className="scrollbar">
          <ul className="menu">
            <li className="menu-item">
              <a href="dashboard" className="menu-link">
                <span className="menu-icon">
                  <i className="fe-airplay"></i>
                </span>
                <span className="menu-text"> Dashboard </span>
              </a>
            </li>

            <li className="menu-item">
              <a
                href="#menuApps"
                data-bs-toggle="collapse"
                className="menu-link"
              >
                <span className="menu-icon">
                  <i className="fe-aperture"></i>
                </span>
                <span className="menu-text"> Pages </span>
                <span className="menu-arrow"></span>
              </a>
              <div className="collapse" id="menuApps">
                <ul className="sub-menu">
                  <li className="menu-item">
                    <a href="customerrequest" className="menu-link">
                      <span className="menu-icon">
                        <i data-feather="users"></i>
                      </span>
                      <span className="menu-text"> Center </span>
                    </a>
                  </li>

                  <li className="menu-item">
                    <a href="payment" className="menu-link">
                      <span className="menu-icon">
                        <i data-feather="users"></i>
                      </span>
                      <span className="menu-text"> Payment Slip Form </span>
                    </a>
                  </li>

                  <li className="menu-item">
                    <a href="viewreceivedrequests" className="menu-link">
                      <span className="menu-icon">
                        <i data-feather="users"></i>
                      </span>
                      <span className="menu-text">View Received Requests</span>
                    </a>
                  </li>

                  <li className="menu-item">
                    <a href="approvedrequests" className="menu-link">
                      <span className="menu-icon">
                        <i data-feather="users"></i>
                      </span>
                      <span className="menu-text">Approved Requests</span>
                    </a>
                  </li>

                  <li className="menu-item">
                    <a href="paymenthistory" className="menu-link">
                      <span className="menu-icon">
                        <i data-feather="users"></i>
                      </span>
                      <span className="menu-text">Payment History</span>
                    </a>
                  </li>
                </ul>
              </div>
            </li>

            <li className="menu-item">
              <a
                href="#menuExpages"
                data-bs-toggle="collapse"
                className="menu-link"
              >
                <span className="menu-icon">
                  <i className="fe-package"></i>
                </span>
                <span className="menu-text"> Settings </span>
                <span className="menu-arrow"></span>
              </a>
              <div className="collapse" id="menuExpages">
                <ul className="sub-menu">
                  <li className="menu-item">
                    <a href="userManagement" className="menu-link">
                      <span className="menu-icon">
                        <i className="fe-lock"></i>
                      </span>
                      <span className="menu-text"> User Management </span>
                    </a>

                    {/* {permissions.includes("User Group Permissions") && ( */}
                    <a href="usergrouppermission" className="menu-link">
                      <i className="fe-users"></i>
                      <span className="menu-text">User Group Permission</span>
                    </a>
                    {/* )} */}
                  </li>
                </ul>
              </div>
            </li>
          </ul>
        </div>
        {/* End Menu */}
      </div>
    );
  }
}
