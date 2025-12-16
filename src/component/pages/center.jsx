import React, { useState } from "react";
import "../../css/Center.css";

const Center = () => {
  const [formData, setFormData] = useState({
    centerId: "",
    centerName: "",
    status: "Active",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAdd = () => {
    console.log("Add clicked", formData);
    // Add your add logic here
  };

  const handleSave = () => {
    console.log("Save clicked", formData);
    // Add your save logic here
  };

  const handleBrowse = () => {
    console.log("Browse clicked");
    // Add your browse logic here
  };

  const handleCancel = () => {
    setFormData({
      centerId: "",
      centerName: "",
      status: "Active",
    });
  };

  return (
    <div className="center-page">
      <div className="center-container">
        <h1 className="center-title">Center Management</h1>

        <div className="center-form">
          <div className="form-section">
            <h2 className="form-section-title">Center Information</h2>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Center ID
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="centerId"
                    value={formData.centerId}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter Center ID (e.g., C001)"
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Center Name
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="centerName"
                    value={formData.centerName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter Center Name"
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
              >
                <span className="btn-icon">✓</span>
                SAVE
              </button>
              <button
                className="btn-action btn-browse"
                onClick={handleBrowse}
                type="button"
              >
                <span className="btn-icon">🔍</span>
                BROWSE
              </button>
              <button
                className="btn-action btn-cancel"
                onClick={handleCancel}
                type="button"
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Center;
