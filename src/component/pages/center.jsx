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

        {/* Full Screen Browse Modal */}
        {showBrowseModal && (
          <div className="fullscreen-modal-overlay">
            <div className="fullscreen-modal">
              <div className="fullscreen-modal-header">
                <div className="header-left">
                  <h2>Browse Centers</h2>
                  <span className="center-count">
                    Total Centers: {centers.length}
                  </span>
                </div>
                <button className="modal-close-btn" onClick={handleCloseModal}>
                  <span className="close-icon">×</span>
                  <span className="close-text">Close</span>
                </button>
              </div>
              
              <div className="fullscreen-modal-content">
                {isLoading ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading centers...</p>
                  </div>
                ) : centers.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📂</div>
                    <h3>No Centers Found</h3>
                    <p>There are no centers in the database yet.</p>
                    <button 
                      className="btn-action btn-add-new"
                      onClick={() => {
                        handleCloseModal();
                        handleCancel();
                      }}
                    >
                      <span className="btn-icon">+</span>
                      Add New Center
                    </button>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="centers-table">
                      <thead>
                        <tr>
                          <th width="15%">Center ID</th>
                          <th width="35%">Center Name</th>
                          <th width="15%">Status</th>
                          <th width="20%">Created Date</th>
                          <th width="15%">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {centers.map((center) => (
                          <tr key={center.id}>
                            <td>
                              <div className="center-id-cell">
                                <strong>{center.center_id}</strong>
                              </div>
                            </td>
                            <td>
                              <div className="center-name-cell">
                                {center.center_name}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  center.status === "Active"
                                    ? "status-active"
                                    : "status-inactive"
                                }`}
                              >
                                {center.status}
                              </span>
                            </td>
                            <td>
                              {new Date(center.created_at).toLocaleDateString(
                                "en-US",
                                {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                }
                              )}
                            </td>
                            <td>
                              <div className="action-buttons-cell">
                                <button
                                  className="btn-select"
                                  onClick={() => handleSelectCenter(center)}
                                  title="Select this center"
                                >
                                  <span className="btn-icon">✓</span>
                                  Select
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() =>
                                    handleDeleteCenter(
                                      center.id,
                                      center.center_name
                                    )
                                  }
                                  title="Delete this center"
                                >
                                  <span className="btn-icon">🗑️</span>
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
              
              <div className="fullscreen-modal-footer">
                <div className="footer-info">
                  <p>
                    <strong>Instructions:</strong> Click "Select" to edit a center, or "Delete" to remove it from the system.
                  </p>
                </div>
                <div className="footer-actions">
                  <button
                    className="btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Close Window
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add CSS styles for the full-screen modal */}
      <style jsx>{`
        .fullscreen-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
          backdrop-filter: blur(5px);
        }

        .fullscreen-modal {
          background: white;
          border-radius: 12px;
          width: 95vw;
          height: 90vh;
          max-width: 1400px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .fullscreen-modal-header {
          background: linear-gradient(135deg, #2c3e50 0%, #4a6491 100%);
          color: white;
          padding: 20px 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 20px;
        }

        .fullscreen-modal-header h2 {
          margin: 0;
          font-size: 1.8rem;
          font-weight: 600;
        }

        .center-count {
          background: rgba(255, 255, 255, 0.2);
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 0.9rem;
        }

        .modal-close-btn {
          background: rgba(255, 255, 255, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: white;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          font-size: 1rem;
        }

        .modal-close-btn:hover {
          background: rgba(255, 255, 255, 0.2);
          transform: translateY(-2px);
        }

        .close-icon {
          font-size: 1.5rem;
          line-height: 1;
        }

        .close-text {
          font-weight: 500;
        }

        .fullscreen-modal-content {
          flex: 1;
          overflow-y: auto;
          padding: 0;
          background: #f8f9fa;
        }

        .table-wrapper {
          height: 100%;
          overflow-y: auto;
          padding: 20px;
        }

        .centers-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .centers-table thead {
          background: #f1f5f9;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .centers-table th {
          padding: 18px 20px;
          text-align: left;
          font-weight: 600;
          color: #334155;
          border-bottom: 2px solid #e2e8f0;
          font-size: 0.95rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .centers-table td {
          padding: 16px 20px;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
          font-size: 0.95rem;
        }

        .centers-table tbody tr {
          transition: all 0.2s;
        }

        .centers-table tbody tr:hover {
          background: #f8fafc;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .center-id-cell {
          font-family: 'Courier New', monospace;
          font-size: 1.1rem;
        }

        .center-name-cell {
          font-weight: 500;
          color: #1e293b;
        }

        .status-badge {
          display: inline-block;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .status-active {
          background: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }

        .status-inactive {
          background: #fee2e2;
          color: #991b1b;
          border: 1px solid #fecaca;
        }

        .action-buttons-cell {
          display: flex;
          gap: 10px;
        }

        .btn-select {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-select:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .btn-delete {
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-delete:hover {
          background: #dc2626;
          transform: translateY(-1px);
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          color: #64748b;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 4px solid #e2e8f0;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100%;
          padding: 40px;
          text-align: center;
          color: #64748b;
        }

        .empty-icon {
          font-size: 4rem;
          margin-bottom: 20px;
          opacity: 0.5;
        }

        .empty-state h3 {
          margin: 0 0 10px 0;
          color: #334155;
          font-size: 1.5rem;
        }

        .empty-state p {
          margin: 0 0 30px 0;
          font-size: 1.1rem;
        }

        .btn-add-new {
          background: #10b981;
          color: white;
          border: none;
          padding: 12px 24px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 1rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-add-new:hover {
          background: #059669;
          transform: translateY(-2px);
        }

        .fullscreen-modal-footer {
          background: #f8fafc;
          padding: 20px 30px;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .footer-info {
          color: #64748b;
          font-size: 0.9rem;
        }

        .footer-info strong {
          color: #334155;
        }

        .btn-secondary {
          background: white;
          color: #64748b;
          border: 1px solid #cbd5e1;
          padding: 10px 20px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 0.95rem;
          font-weight: 500;
          transition: all 0.2s;
        }

        .btn-secondary:hover {
          background: #f1f5f9;
          border-color: #94a3b8;
        }

        /* Responsive adjustments */
        @media (max-width: 1200px) {
          .fullscreen-modal {
            width: 98vw;
            height: 95vh;
          }
          
          .centers-table {
            font-size: 0.9rem;
          }
          
          .centers-table th,
          .centers-table td {
            padding: 14px 16px;
          }
        }

        @media (max-width: 768px) {
          .fullscreen-modal-header {
            flex-direction: column;
            gap: 15px;
            text-align: center;
            padding: 15px;
          }
          
          .header-left {
            flex-direction: column;
            gap: 10px;
          }
          
          .centers-table {
            display: block;
            overflow-x: auto;
          }
          
          .action-buttons-cell {
            flex-direction: column;
            gap: 8px;
          }
          
          .fullscreen-modal-footer {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
};

export default Center;