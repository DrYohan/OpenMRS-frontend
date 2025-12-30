import React, { useEffect, useState } from "react";
import Swal from "sweetalert2";
import apiClient from "./utils/apiClient";
import API_Route from "./apiConfig";

function TopBar() {
  const [permissions, setPermissions] = useState([]);
  const [userName, setUserName] = useState("Guest");

  useEffect(() => {
    const storedName = localStorage.getItem("userName");
    if (storedName) {
      setUserName(storedName);
    }
  }, []);

  useEffect(() => {
    const fetchUserPermissions = async () => {
      try {
        const userId = localStorage.getItem("userId");
        if (userId) {
          const userResponse = await apiClient(
            API_Route.userpermissions.GET_USERDETAILS(userId)
          );
          const userGroupId = userResponse.userdetails.usergroupid;
          const permissionsResponse = await apiClient(
            API_Route.userpermissions.GET_PERMISSIONSBYGROUPID(userGroupId)
          );
          const permissionsStrings = permissionsResponse.permissions.map(
            (perm) => perm.userpermission
          );
          setPermissions(permissionsStrings);
          console.log("Mapped permissions (TopBar):", permissionsStrings);
        } else {
          console.warn("User ID is missing from localStorage");
          setPermissions([]);
        }
      } catch (error) {
        console.error("Error fetching permissions:", error);
      }
    };
    fetchUserPermissions();
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Are you sure?",
      text: "You will be logged out of the system.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, logout",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();

        Swal.fire({
          title: "Logged Out!",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          window.location.href = "/login";
        });
      }
    });
  };

  return (
    <div className="navbar-custom">
      <div className="topbar">
        <div className="topbar-menu d-flex align-items-center gap-1">
          {/* Topbar Brand Logo */}
          <div className="logo-box">
            {/* Brand Logo Light */}
            <a href="/" className="logo-light">
              <img
                src="assets/images/Logo.png"
                alt="logo"
                className="logo-lg"
                height="60"
              />
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
                height="60"
              />
              <img
                src="assets/images/Logo.png"
                alt="small logo"
                className="logo-sm"
              />
            </a>
          </div>

          {/* Sidebar Menu Toggle Button */}
          <button className="button-toggle-menu">
            <i className="mdi mdi-menu"></i>
          </button>

          {/* Dropdown Menu */}
          <div className="dropdown d-none d-xl-block">
            <a
              className="nav-link dropdown-toggle waves-effect waves-light"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
              aria-haspopup="false"
              aria-expanded="false"
            >
              Create New
              <i className="mdi mdi-chevron-down ms-1"></i>
            </a>
            <div className="dropdown-menu">
              {permissions.includes("New Complaint") && (
                <a href={void 0} className="dropdown-item">
                  <i className="fe-briefcase me-1"></i>
                  <span>New Complaint</span>
                </a>
              )}
              {permissions.includes("InstituteRegistrstion") && (
                <a
                  href="instituteregistrstion"
                  className="dropdown-item notify-item"
                >
                  <i className="far fa-building"></i>&nbsp;
                  <span>Institute Registration</span>
                </a>
              )}
              {permissions.includes("Checklist Items") && (
                <a href="checklistitems" className="dropdown-item notify-item">
                  <i className="fas fa-list-ul"></i>&nbsp;
                  <span>Checklist Items</span>
                </a>
              )}
              <a href={void 0} className="dropdown-item">
                <i className="fe-settings me-1"></i>
                <span>Settings</span>
              </a>
              <div className="dropdown-divider"></div>
              <a href={void 0} className="dropdown-item">
                <i className="fe-headphones me-1"></i>
                <span>Help &amp; Support</span>
              </a>
              <a href="usercreation" className="dropdown-item">
                <i className="fe-user me-1"></i>
                <span>Create User</span>
              </a>
            </div>
          </div>
        </div>

        <ul className="topbar-menu d-flex align-items-center">
          {/* App Dropdown */}
          <li className="dropdown d-none d-md-inline-block">
            <a
              className="nav-link dropdown-toggle waves-effect waves-light arrow-none"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
              aria-haspopup="false"
              aria-expanded="false"
            >
              <i className="fe-grid font-22"></i>
            </a>
            <div className="dropdown-menu dropdown-menu-end dropdown-menu-animated dropdown-lg p-0">
              <div className="p-2">
                <div className="row g-0">
                  <div className="col">
                    <a className="dropdown-icon-item" href="#">
                      <img src="assets/images/brands/slack.png" alt="slack" />
                      <span>Slack</span>
                    </a>
                  </div>
                  <div className="col">
                    <a className="dropdown-icon-item" href="#">
                      <img src="assets/images/brands/github.png" alt="Github" />
                      <span>GitHub</span>
                    </a>
                  </div>
                  <div className="col">
                    <a className="dropdown-icon-item" href="#">
                      <img
                        src="assets/images/brands/dribbble.png"
                        alt="dribbble"
                      />
                      <span>Dribbble</span>
                    </a>
                  </div>
                </div>

                <div className="row g-0">
                  <div className="col">
                    <a className="dropdown-icon-item" href="#">
                      <img
                        src="assets/images/brands/bitbucket.png"
                        alt="bitbucket"
                      />
                      <span>Bitbucket</span>
                    </a>
                  </div>
                  <div className="col">
                    <a className="dropdown-icon-item" href="#">
                      <img
                        src="assets/images/brands/dropbox.png"
                        alt="dropbox"
                      />
                      <span>Dropbox</span>
                    </a>
                  </div>
                  <div className="col">
                    <a className="dropdown-icon-item" href="#">
                      <img
                        src="assets/images/brands/g-suite.png"
                        alt="G Suite"
                      />
                      <span>G Suite</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </li>

          {/* Notification dropdown */}
          <li className="dropdown notification-list">
            <a
              className="nav-link dropdown-toggle waves-effect waves-light arrow-none"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
              aria-haspopup="false"
              aria-expanded="false"
            >
              <i className="fe-bell font-22"></i>
              <span className="badge bg-danger rounded-circle noti-icon-badge">
                9
              </span>
            </a>
            <div className="dropdown-menu dropdown-menu-end dropdown-menu-animated dropdown-lg py-0">
              <div className="p-2 border-top-0 border-start-0 border-end-0 border-dashed border">
                <div className="row align-items-center">
                  <div className="col">
                    <h6 className="m-0 font-16 fw-semibold"> Notification</h6>
                  </div>
                  <div className="col-auto">
                    <a
                      href={void 0}
                      className="text-dark text-decoration-underline"
                    >
                      <small>Clear All</small>
                    </a>
                  </div>
                </div>
              </div>
              <div
                className="px-1"
                style={{ maxHeight: "300px", overflow: "auto" }}
              >
                <h5 className="text-muted font-13 fw-normal mt-2">Today</h5>
                <a
                  href={void 0}
                  className="dropdown-item p-0 notify-item card unread-noti shadow-none mb-1"
                >
                  <div className="card-body">
                    <span className="float-end noti-close-btn text-muted">
                      <i className="mdi mdi-close"></i>
                    </span>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="notify-icon bg-primary">
                          <i className="mdi mdi-comment-account-outline"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 text-truncate ms-2">
                        <h5 className="noti-item-title fw-semibold font-14">
                          Datacorp{" "}
                          <small className="fw-normal text-muted ms-1">
                            1 min ago
                          </small>
                        </h5>
                        <small className="noti-item-subtitle text-muted">
                          Caleb Flakelar commented on Admin
                        </small>
                      </div>
                    </div>
                  </div>
                </a>
                <a
                  href={void 0}
                  className="dropdown-item p-0 notify-item card read-noti shadow-none mb-1"
                >
                  <div className="card-body">
                    <span className="float-end noti-close-btn text-muted">
                      <i className="mdi mdi-close"></i>
                    </span>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="notify-icon bg-info">
                          <i className="mdi mdi-account-plus"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 text-truncate ms-2">
                        <h5 className="noti-item-title fw-semibold font-14">
                          Admin{" "}
                          <small className="fw-normal text-muted ms-1">
                            1 hours ago
                          </small>
                        </h5>
                        <small className="noti-item-subtitle text-muted">
                          New user registered
                        </small>
                      </div>
                    </div>
                  </div>
                </a>
                <h5 className="text-muted font-13 fw-normal mt-0">Yesterday</h5>
                <a
                  href={void 0}
                  className="dropdown-item p-0 notify-item card read-noti shadow-none mb-1"
                >
                  <div className="card-body">
                    <span className="float-end noti-close-btn text-muted">
                      <i className="mdi mdi-close"></i>
                    </span>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="notify-icon">
                          <img
                            src="assets/images/users/avatar-2.jpg"
                            className="img-fluid rounded-circle"
                            alt=""
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1 text-truncate ms-2">
                        <h5 className="noti-item-title fw-semibold font-14">
                          Cristina Pride
                          <small className="fw-normal text-muted ms-1">
                            1 day ago
                          </small>
                        </h5>
                        <small className="noti-item-subtitle text-muted">
                          Hi, How are you? What about our next meeting
                        </small>
                      </div>
                    </div>
                  </div>
                </a>
                <h5 className="text-muted font-13 fw-normal mt-0">
                  30 Dec 2021
                </h5>
                <a
                  href={void 0}
                  className="dropdown-item p-0 notify-item card read-noti shadow-none mb-1"
                >
                  <div className="card-body">
                    <span className="float-end noti-close-btn text-muted">
                      <i className="mdi mdi-close"></i>
                    </span>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="notify-icon bg-primary">
                          <i className="mdi mdi-comment-account-outline"></i>
                        </div>
                      </div>
                      <div className="flex-grow-1 text-truncate ms-2">
                        <h5 className="noti-item-title fw-semibold font-14">
                          Datacorp
                        </h5>
                        <small className="noti-item-subtitle text-muted">
                          Caleb Flakelar commented on Admin
                        </small>
                      </div>
                    </div>
                  </div>
                </a>
                <a
                  href={void 0}
                  className="dropdown-item p-0 notify-item card read-noti shadow-none mb-1"
                >
                  <div className="card-body">
                    <span className="float-end noti-close-btn text-muted">
                      <i className="mdi mdi-close"></i>
                    </span>
                    <div className="d-flex align-items-center">
                      <div className="flex-shrink-0">
                        <div className="notify-icon">
                          <img
                            src="assets/images/users/avatar-4.jpg"
                            className="img-fluid rounded-circle"
                            alt=""
                          />
                        </div>
                      </div>
                      <div className="flex-grow-1 text-truncate ms-2">
                        <h5 className="noti-item-title fw-semibold font-14">
                          Karen Robinson
                        </h5>
                        <small className="noti-item-subtitle text-muted">
                          Wow ! this admin looks good and awesome design
                        </small>
                      </div>
                    </div>
                  </div>
                </a>
                <div className="text-center">
                  <i className="mdi mdi-dots-circle mdi-spin text-muted h3 mt-0"></i>
                </div>
              </div>
              <a
                href={void 0}
                className="dropdown-item text-center text-primary notify-item border-top border-light py-2"
              >
                View All
              </a>
            </div>
          </li>

          <li className="d-none d-sm-inline-block">
            <div
              className="nav-link waves-effect waves-light"
              id="light-dark-mode"
            >
              <i className="ri-moon-line font-22"></i>
            </div>
          </li>

          <li className="dropdown">
            <a
              className="nav-link dropdown-toggle nav-user me-0 waves-effect waves-light"
              data-bs-toggle="dropdown"
              href="#"
              role="button"
              aria-haspopup="false"
              aria-expanded="false"
            >
              <img
                src="assets/images/user.png"
                alt="user-image"
                className="rounded-circle"
              />
              <span className="ms-1 d-none d-md-inline-block">
                {userName}
                <i className="mdi mdi-chevron-down"></i>
              </span>
            </a>
            <div className="dropdown-menu dropdown-menu-end profile-dropdown ">
              <div className="dropdown-header noti-title">
                <h6 className="text-overflow m-0">Welcome {userName} !</h6>
              </div>

              {permissions.includes("Change password") && (
                <a href="changepassword" className="dropdown-item notify-item">
                  <i className="fe-settings"></i>
                  <span>Change Password</span>
                </a>
              )}

              <div className="dropdown-divider"></div>
              <a
                href={void 0}
                onClick={handleLogout}
                className="dropdown-item notify-item"
              >
                <i className="fe-log-out"></i>&nbsp;
                <span>Logout</span>
              </a>
            </div>
          </li>

          <li>
            <a
              className="nav-link waves-effect waves-light"
              data-bs-toggle="offcanvas"
              href="#theme-settings-offcanvas"
            >
              <i className="fe-settings font-22"></i>
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default TopBar;
