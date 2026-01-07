import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/Department.css";

const Department = () => {
  const [formData, setFormData] = useState({
    id: "",
    centerId: "",
    locationId: "",
    departmentId: "",
    departmentName: "",
    status: "Active",
  });

  const [centers, setCenters] = useState([]);
  const [locations, setLocations] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLocations, setIsLoadingLocations] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showBrowseModal, setShowBrowseModal] = useState(false);

  // API base URL
  const API_URL = "http://localhost:3000/api";

  // Fetch centers from API on component mount
  useEffect(() => {
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
        const response = await axios.get(
          `${API_URL}/locations/center/${formData.centerId}`
        );
        if (response.data.success) {
          setLocations(response.data.data);
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        alert("Error fetching locations for selected center.");
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
  }, [formData.centerId]);

  // Fetch departments when modal opens
  useEffect(() => {
    if (showBrowseModal) {
      fetchDepartments();
    }
  }, [showBrowseModal]);

  const fetchCenters = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/centers`);
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

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_URL}/departments`);
      if (response.data.success || response.data.data) {
        setDepartments(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
      alert("Error fetching departments. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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

  const handleSave = async () => {
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
      setIsLoading(true);

      if (isEditing) {
        // Update existing department
        const response = await axios.put(
          `${API_URL}/departments/${formData.id}`,
          {
            center_id: formData.centerId,
            location_id: formData.locationId,
            department_id: formData.departmentId,
            department_name: formData.departmentName,
            status: formData.status,
          }
        );

        if (response.data.success) {
          alert("Department updated successfully!");
          handleCancel();
          fetchDepartments();
        } else {
          alert(response.data.error || "Error updating department");
        }
      } else {
        // Create new department
        const response = await axios.post(`${API_URL}/departments`, {
          center_id: formData.centerId,
          location_id: formData.locationId,
          department_id: formData.departmentId,
          department_name: formData.departmentName,
          status: formData.status,
        });

        if (response.data.success) {
          alert("Department created successfully!");
          handleCancel();
          fetchDepartments();
        } else {
          alert(response.data.error || "Error creating department");
        }
      }
    } catch (error) {
      console.error("Error saving department:", error);
      alert(
        error.response?.data?.error || "Error saving department. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowse = () => {
    setShowBrowseModal(true);
  };

  const handleSelectDepartment = (department) => {
    setFormData({
      id: department.id,
      centerId: department.center_id,
      locationId: department.location_id,
      departmentId: department.department_id,
      departmentName: department.department_name,
      status: department.status,
    });
    setIsEditing(true);
    setShowBrowseModal(false);
  };

  const handleDeleteDepartment = async (id, departmentName) => {
    if (
      window.confirm(`Are you sure you want to delete department: ${departmentName}?`)
    ) {
      try {
        setIsLoading(true);
        const response = await axios.delete(`${API_URL}/departments/${id}`);

        if (response.data.success) {
          alert("Department deleted successfully!");
          fetchDepartments();
          if (isEditing && formData.id === id) {
            handleCancel();
          }
        }
      } catch (error) {
        console.error("Error deleting department:", error);
        alert(error.response?.data?.error || "Error deleting department");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      id: "",
      centerId: "",
      locationId: "",
      departmentId: "",
      departmentName: "",
      status: "Active",
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setShowBrowseModal(false);
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
            <h2 className="form-section-title">
              {isEditing ? "Edit Department" : "Add New Department"}
            </h2>

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
                    disabled={!formData.centerId || isLoadingLocations || isEditing}
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
                    disabled={isEditing}
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
                disabled={!isFormValid() || isLoading || isLoadingLocations}
                style={{ backgroundColor: "#4bc517ff" }}
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
                disabled={isLoading || isLoadingLocations}
                style={{ backgroundColor: "#fd9d0a" }}
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
                  ? "Loading..."
                  : `${centers.length} centers available`}
              </p>
              <p className="info-text">
                {formData.centerId
                  ? isLoadingLocations
                    ? "Loading locations..."
                    : `${locations.length} locations available`
                  : "Select a center to see locations"}
              </p>
              {isEditing && (
                <p className="info-text warning">
                  ⚠️ Editing Department ID: {formData.departmentId}
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
                  <h2>Browse Departments</h2>
                  <span className="department-count">
                    Total Departments: {departments.length}
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
                    <p>Loading departments...</p>
                  </div>
                ) : departments.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🏥</div>
                    <h3>No Departments Found</h3>
                    <p>There are no departments in the database yet.</p>
                    <button 
                      className="btn-action btn-add-new"
                      onClick={() => {
                        handleCloseModal();
                        handleCancel();
                      }}
                    >
                      <span className="btn-icon">+</span>
                      Add New Department
                    </button>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="departments-table">
                      <thead>
                        <tr>
                          <th width="10%">Dept ID</th>
                          <th width="20%">Department Name</th>
                          <th width="12%">Center ID</th>
                          <th width="15%">Center Name</th>
                          <th width="12%">Location ID</th>
                          <th width="15%">Location Name</th>
                          <th width="10%">Status</th>
                          <th width="16%">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {departments.map((department) => (
                          <tr key={department.id}>
                            <td>
                              <div className="dept-id-cell">
                                <strong>{department.department_id}</strong>
                              </div>
                            </td>
                            <td>
                              <div className="dept-name-cell">
                                {department.department_name}
                              </div>
                            </td>
                            <td>
                              <div className="center-id-cell">
                                {department.center_id}
                              </div>
                            </td>
                            <td>
                              <div className="center-name-cell">
                                {department.center_name || "N/A"}
                              </div>
                            </td>
                            <td>
                              <div className="location-id-cell">
                                {department.location_id}
                              </div>
                            </td>
                            <td>
                              <div className="location-name-cell">
                                {department.location_name || "N/A"}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`status-badge ${
                                  department.status === "Active"
                                    ? "status-active"
                                    : "status-inactive"
                                }`}
                              >
                                {department.status}
                              </span>
                            </td>
                            <td>
                              <div className="action-buttons-cell">
                                <button
                                  className="btn-select"
                                  onClick={() => handleSelectDepartment(department)}
                                  title="Select this department"
                                >
                                  <span className="btn-icon">✓</span>
                                  Select
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() =>
                                    handleDeleteDepartment(
                                      department.id,
                                      department.department_name
                                    )
                                  }
                                  title="Delete this department"
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
                    <strong>Instructions:</strong> Click "Select" to edit a department, or "Delete" to remove it from the system.
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
          max-width: 1800px;
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
          background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
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

        .department-count {
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

        .departments-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .departments-table thead {
          background: #f1f5f9;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .departments-table th {
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #334155;
          border-bottom: 2px solid #e2e8f0;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .departments-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
          font-size: 0.9rem;
        }

        .departments-table tbody tr {
          transition: all 0.2s;
        }

        .departments-table tbody tr:hover {
          background: #f8fafc;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .dept-id-cell {
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          font-weight: 600;
          color: #1e40af;
        }

        .dept-name-cell {
          font-weight: 500;
          color: #1e293b;
        }

        .center-id-cell,
        .location-id-cell {
          font-family: 'Courier New', monospace;
          color: #4b5563;
          font-size: 0.9rem;
        }

        .center-name-cell,
        .location-name-cell {
          color: #374151;
          font-size: 0.9rem;
        }

        .status-badge {
          display: inline-block;
          padding: 5px 10px;
          border-radius: 20px;
          font-size: 0.8rem;
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
          gap: 8px;
        }

        .btn-select {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-select:hover {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .btn-delete {
          background: #ef4444;
          color: white;
          border: none;
          padding: 6px 10px;
          border-radius: 6px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          font-weight: 500;
          transition: all 0.2s;
          white-space: nowrap;
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
        @media (max-width: 1600px) {
          .fullscreen-modal {
            width: 98vw;
            height: 95vh;
          }
          
          .departments-table {
            font-size: 0.85rem;
          }
          
          .departments-table th,
          .departments-table td {
            padding: 12px 10px;
          }
          
          .btn-select, .btn-delete {
            padding: 5px 8px;
            font-size: 0.75rem;
          }
        }

        @media (max-width: 1200px) {
          .departments-table {
            display: block;
            overflow-x: auto;
          }
          
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
          
          .action-buttons-cell {
            flex-direction: column;
            gap: 5px;
          }
          
          .fullscreen-modal-footer {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
        }

        @media (max-width: 768px) {
          .departments-table th,
          .departments-table td {
            padding: 10px 8px;
            font-size: 0.8rem;
          }
          
          .btn-select, .btn-delete {
            padding: 4px 6px;
            font-size: 0.7rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Department;