import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/Center.css";

const Center = () => {
  const [formData, setFormData] = useState({
    id: "",
    centerId: "",
    centerName: "",
    status: "Active",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [centers, setCenters] = useState([]);
  const [showBrowseModal, setShowBrowseModal] = useState(false);

  // API base URL - adjust based on your backend
  const API_URL = "http://localhost:3000/api/centers";

  // Fetch all centers on component mount
  useEffect(() => {
    fetchCenters();
  }, []);

  const fetchCenters = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(API_URL);
      if (response.data.success) {
        setCenters(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching centers:", error);
      alert("Error fetching centers. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    // Validate required fields
    if (!formData.centerId || !formData.centerName) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);

      if (isEditing) {
        // Update existing center
        const response = await axios.put(`${API_URL}/${formData.id}`, {
          center_id: formData.centerId,
          center_name: formData.centerName,
          status: formData.status,
        });

        if (response.data.success) {
          alert("Center updated successfully!");
          handleCancel();
          fetchCenters();
        } else {
          alert(response.data.error || "Error updating center");
        }
      } else {
        // Create new center
        const response = await axios.post(API_URL, {
          center_id: formData.centerId,
          center_name: formData.centerName,
          status: formData.status,
        });

        if (response.data.success) {
          alert("Center created successfully!");
          handleCancel();
          fetchCenters();
        } else {
          alert(response.data.error || "Error creating center");
        }
      }
    } catch (error) {
      console.error("Error saving center:", error);
      alert(
        error.response?.data?.error || "Error saving center. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowse = () => {
    setShowBrowseModal(true);
    fetchCenters();
  };

  const handleSelectCenter = (center) => {
    setFormData({
      id: center.id,
      centerId: center.center_id,
      centerName: center.center_name,
      status: center.status,
    });
    setIsEditing(true);
    setShowBrowseModal(false);
  };

  const handleDeleteCenter = async (id, centerName) => {
    if (
      window.confirm(`Are you sure you want to delete center: ${centerName}?`)
    ) {
      try {
        setIsLoading(true);
        const response = await axios.delete(`${API_URL}/${id}`);

        if (response.data.success) {
          alert("Center deleted successfully!");
          fetchCenters();
          if (isEditing && formData.id === id) {
            handleCancel();
          }
        }
      } catch (error) {
        console.error("Error deleting center:", error);
        alert(error.response?.data?.error || "Error deleting center");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      id: "",
      centerId: "",
      centerName: "",
      status: "Active",
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setShowBrowseModal(false);
  };

  return (
    <div className="center-page">
      <div className="center-container">
        <h1 className="center-title">Center Management</h1>

        <div className="center-form">
          <div className="form-section">
            <h2 className="form-section-title">
              {isEditing ? "Edit Center" : "Add New Center"}
            </h2>

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
                    disabled={isEditing}
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
                    disabled={isLoading}
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
                disabled={isLoading}
              >
                <span className="btn-icon">
                  {isLoading ? "⏳" : isEditing ? "✓" : "+"}
                </span>
                {isLoading ? "SAVING..." : isEditing ? "UPDATE" : "SAVE"}
              </button>
              <button
                className="btn-action btn-browse"
                onClick={handleBrowse}
                type="button"
                style={{ backgroundColor: "#fd9d0a" }}
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
                  ? "Loading..."
                  : `${centers.length} centers in database`}
              </p>
              {isEditing && (
                <p className="info-text warning">
                  ⚠️ Editing Center ID: {formData.centerId}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Browse Modal */}
        {showBrowseModal && (
          <div className="modal-overlay">
            <div className="modal">
              <div className="modal-header">
                <h3>Browse Centers</h3>
                <button className="modal-close" onClick={handleCloseModal}>
                  ✕
                </button>
              </div>
              <div className="modal-content">
                {isLoading ? (
                  <div className="loading">Loading centers...</div>
                ) : centers.length === 0 ? (
                  <div className="no-data">No centers found</div>
                ) : (
                  <div className="table-container">
                    <table className="centers-table">
                      <thead>
                        <tr>
                          <th>Center ID</th>
                          <th>Center Name</th>
                          <th>Status</th>
                          <th>Created Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {centers.map((center) => (
                          <tr key={center.id}>
                            <td>{center.center_id}</td>
                            <td>{center.center_name}</td>
                            <td>
                              <span
                                className={`status-badge status-${center.status.toLowerCase()}`}
                              >
                                {center.status}
                              </span>
                            </td>
                            <td>
                              {new Date(center.created_at).toLocaleDateString()}
                            </td>
                            <td className="actions-cell">
                              <button
                                className="action-btn select-btn"
                                onClick={() => handleSelectCenter(center)}
                              >
                                Select
                              </button>
                              <button
                                className="action-btn delete-btn"
                                onClick={() =>
                                  handleDeleteCenter(
                                    center.id,
                                    center.center_name
                                  )
                                }
                              >
                                Delete
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button className="btn-action" onClick={handleCloseModal}>
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Center;
