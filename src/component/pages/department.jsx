import React, { useState, useEffect } from "react";
import "../../css/Department.css";

const Department = () => {
  const [formData, setFormData] = useState({
    centerId: "",
    locationId: "",
    departmentId: "",
    departmentName: "",
    status: "Active",
  });

  const [centers, setCenters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);

  // Fetch centers from API on component mount
  useEffect(() => {
    const fetchCenters = async () => {
      setIsLoading(true);
      try {
        const response = await fetch("http://localhost:3000/api/centers");
        const data = await response.json();
        if (data.success) {
          setCenters(data.data);
        }
      } catch (error) {
        console.error("Error fetching centers:", error);
        // Fallback dummy data for demo
        setCenters([
          { id: 1, center_id: "C001", center_name: "Main Hospital" },
          { id: 2, center_id: "C002", center_name: "Branch Clinic" },
          { id: 3, center_id: "C003", center_name: "Emergency Center" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCenters();
  }, []);

  // Fetch locations when centerId changes
  useEffect(() => {
    const fetchLocations = async () => {
      if (!formData.centerId) {
        setLocations([]);
        return;
      }

      setIsLoadingLocations(true);
      try {
        const response = await fetch(
          `http://localhost:3000/api/locations/center/${formData.centerId}`
        );
        const data = await response.json();
        if (data.success) {
          setLocations(data.data);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        // Fallback dummy data for demo
        setLocations([
          {
            id: 1,
            location_id: "L001",
            location_name: "Building A - Ground Floor",
          },
          {
            id: 2,
            location_id: "L002",
            location_name: "Building B - First Floor",
          },
          { id: 3, location_id: "L003", location_name: "Emergency Wing" },
        ]);
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [formData.centerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If center is changed, reset location selection
    if (name === "centerId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        locationId: "", // Reset location when center changes
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleAdd = () => {
    console.log("Add clicked", formData);
    // Reset form for new entry
    setFormData({
      centerId: "",
      locationId: "",
      departmentId: "",
      departmentName: "",
      status: "Active",
    });
  };

  const handleSave = async () => {
    console.log("Save clicked", formData);

    // Validate required fields
    if (
      !formData.centerId ||
      !formData.locationId ||
      !formData.departmentId ||
      !formData.departmentName
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/api/departments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          center_id: formData.centerId,
          location_id: formData.locationId,
          department_id: formData.departmentId,
          department_name: formData.departmentName,
          status: formData.status,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Department saved successfully!");
        // Reset form
        setFormData({
          centerId: "",
          locationId: "",
          departmentId: "",
          departmentName: "",
          status: "Active",
        });
      } else {
        alert("Error saving department: " + data.error);
      }
    } catch (error) {
      console.error("Error saving department:", error);
      alert("Error saving department. Please try again.");
    }
  };

  const handleBrowse = () => {
    console.log("Browse clicked");
    // Navigate to departments list or open modal
    window.open("/departments-list", "_blank");
  };

  const handleCancel = () => {
    setFormData({
      centerId: "",
      locationId: "",
      departmentId: "",
      departmentName: "",
      status: "Active",
    });
  };

  const isFormValid = () => {
    return (
      formData.centerId &&
      formData.locationId &&
      formData.departmentId &&
      formData.departmentName
    );
  };

  return (
    <div className="department-page">
      <div className="department-container">
        <h1 className="department-title">Department Management</h1>

        <div className="department-form">
          <div className="form-section">
            <h2 className="form-section-title">Department Information</h2>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Center
                  <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    name="centerId"
                    value={formData.centerId}
                    onChange={handleChange}
                    className="form-select"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select a Center</option>
                    {centers.map((center) => (
                      <option key={center.id} value={center.center_id}>
                        {center.center_name} ({center.center_id})
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow"></div>
                  {isLoading && (
                    <div className="loading-indicator">Loading...</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Location
                  <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    name="locationId"
                    value={formData.locationId}
                    onChange={handleChange}
                    className="form-select"
                    required
                    disabled={!formData.centerId || isLoadingLocations}
                  >
                    <option value="">Select a Location</option>
                    {locations.map((location) => (
                      <option key={location.id} value={location.location_id}>
                        {location.location_name} ({location.location_id})
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow"></div>
                  {isLoadingLocations && (
                    <div className="loading-indicator">Loading...</div>
                  )}
                  {!formData.centerId && !isLoadingLocations && (
                    <div className="field-hint">Select a center first</div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Department ID
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="departmentId"
                    value={formData.departmentId}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter Department ID (e.g., D001)"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Department Name
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="departmentName"
                    value={formData.departmentName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter Department Name"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Status
                  <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                  <div className="select-arrow"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions-section">
            <div className="action-buttons">
              <button
                className="btn-action btn-save"
                onClick={handleSave}
                type="button"
                disabled={!isFormValid() || isLoading || isLoadingLocations}
                style={{ backgroundColor: "#4bc517ff" }}
              >
                <span className="btn-icon">✓</span>
                SAVE
              </button>
              <button
                className="btn-action btn-browse"
                onClick={handleBrowse}
                type="button"
                disabled={isLoading || isLoadingLocations}
              >
                <span className="btn-icon">🔍</span>
                BROWSE
              </button>
              <button
                className="btn-action btn-cancel"
                onClick={handleCancel}
                type="button"
                disabled={isLoading || isLoadingLocations}
                style={{ backgroundColor: "#c51717ff" }}
              >
                <span className="btn-icon">✕</span>
                CANCEL
              </button>
            </div>

            <div className="form-info">
              <p className="info-text">
                <span className="required">*</span> Required fields
              </p>
              <p className="info-text">
                {isLoading
                  ? "Loading centers..."
                  : `${centers.length} centers available`}
              </p>
              <p className="info-text">
                {formData.centerId
                  ? isLoadingLocations
                    ? "Loading locations..."
                    : `${locations.length} locations available`
                  : "Select a center to see locations"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Department;
