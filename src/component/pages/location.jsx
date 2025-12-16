import React, { useState, useEffect } from "react";
import "../../css/Location.css";

const Location = () => {
  const [formData, setFormData] = useState({
    centerId: "",
    locationId: "",
    locationName: "",
    status: "Active",
  });

  const [centers, setCenters] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch centers from API on component mount
  useEffect(() => {
    const fetchCenters = async () => {
      setIsLoading(true);
      try {
        // Replace with your actual API endpoint
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    console.log("Add clicked", formData);
    // Reset form for new entry
    setFormData({
      centerId: "",
      locationId: "",
      locationName: "",
      status: "Active",
    });
    // Add your add logic here
  };

  const handleSave = async () => {
    console.log("Save clicked", formData);
    // Add your save logic here
    try {
      const response = await fetch("http://localhost:3000/api/locations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          center_id: formData.centerId,
          location_id: formData.locationId,
          location_name: formData.locationName,
          status: formData.status,
        }),
      });

      const data = await response.json();
      if (data.success) {
        alert("Location saved successfully!");
        // Reset form
        setFormData({
          centerId: "",
          locationId: "",
          locationName: "",
          status: "Active",
        });
      } else {
        alert("Error saving location: " + data.error);
      }
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Error saving location. Please try again.");
    }
  };

  const handleBrowse = () => {
    console.log("Browse clicked");
    // Add your browse logic here - could open a modal or navigate
    window.open("/locations-list", "_blank");
  };

  const handleCancel = () => {
    setFormData({
      centerId: "",
      locationId: "",
      locationName: "",
      status: "Active",
    });
  };

  return (
    <div className="location-page">
      <div className="location-container">
        <h1 className="location-title">Location Management</h1>

        <div className="location-form">
          <div className="form-section">
            <h2 className="form-section-title">Location Information</h2>

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
                  Location ID
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="locationId"
                    value={formData.locationId}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter Location ID (e.g., L001)"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Location Name
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="locationName"
                    value={formData.locationName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter Location Name"
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
                style={{ backgroundColor: "#4bc517ff" }}
                disabled={
                  !formData.centerId ||
                  !formData.locationId ||
                  !formData.locationName ||
                  isLoading
                }
              >
                <span className="btn-icon">✓</span>
                SAVE
              </button>
              <button
                className="btn-action btn-browse"
                onClick={handleBrowse}
                type="button"
                disabled={isLoading}
              >
                <span className="btn-icon">🔍</span>
                BROWSE
              </button>
              <button
                className="btn-action btn-cancel"
                onClick={handleCancel}
                type="button"
                style={{ backgroundColor: "#c51717ff" }}
                disabled={isLoading}
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Location;
