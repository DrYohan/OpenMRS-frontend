import React, { useState, useEffect } from "react";
import axios from "axios";
import "../../css/FixedAssetMiddleCategory.css";

const FixedAssetMiddleCategory = () => {
  const [formData, setFormData] = useState({
    id: "",
    mainCategoryId: "",
    itemTypeId: "",
    middleCategoryId: "",
    middleCategoryName: "",
    description: "",
  });

  const [mainCategories, setMainCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [middleCategories, setMiddleCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItemTypes, setIsLoadingItemTypes] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showBrowseModal, setShowBrowseModal] = useState(false);

  // API base URL
  const API_URL = "http://localhost:3000/api";

  // Fetch main categories from API on component mount
  useEffect(() => {
    fetchMainCategories();
  }, []);

  // Fetch item types when main category changes
  useEffect(() => {
    const fetchItemTypes = async () => {
      if (!formData.mainCategoryId) {
        setItemTypes([]);
        return;
      }

      setIsLoadingItemTypes(true);
      try {
        const response = await axios.get(
          `${API_URL}/asset-categories/item-types`
        );
        if (response.data.success) {
          // Filter item types by main category
          const filteredItemTypes = response.data.data.filter(
            (item) => String(item.main_category_id) === String(formData.mainCategoryId)
          );
          setItemTypes(filteredItemTypes);
        }
      } catch (error) {
        console.error("Error fetching item types:", error);
        alert("Error fetching item types. Please try again.");
      } finally {
        setIsLoadingItemTypes(false);
      }
    };

    fetchItemTypes();
  }, [formData.mainCategoryId]);

  // Fetch middle categories when modal opens
  useEffect(() => {
    if (showBrowseModal) {
      fetchMiddleCategories();
    }
  }, [showBrowseModal]);

  const fetchMainCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/asset-categories/main-categories`
      );
      if (response.data.success) {
        setMainCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching main categories:", error);
      alert("Error fetching main categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMiddleCategories = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(
        `${API_URL}/asset-categories/middle-categories`
      );
      if (response.data.success || response.data.data) {
        setMiddleCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching middle categories:", error);
      alert("Error fetching middle categories. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    // If main category is changed, reset item type selection
    if (name === "mainCategoryId") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        itemTypeId: "", // Reset item type when main category changes
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
      !formData.mainCategoryId ||
      !formData.middleCategoryId ||
      !formData.middleCategoryName
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      setIsLoading(true);

      if (isEditing) {
        // Update existing middle category
        const response = await axios.put(
          `${API_URL}/asset-categories/middle-categories/${formData.id}`,
          {
            main_category_id: formData.mainCategoryId,
            item_type_id: formData.itemTypeId || null,
            middle_category_id: formData.middleCategoryId,
            middle_category_name: formData.middleCategoryName,
            description: formData.description,
          }
        );

        if (response.data.success) {
          alert("Middle category updated successfully!");
          handleCancel();
          fetchMiddleCategories();
        } else {
          alert(response.data.error || "Error updating middle category");
        }
      } else {
        // Create new middle category
        const response = await axios.post(
          `${API_URL}/asset-categories/middle-categories`,
          {
            main_category_id: formData.mainCategoryId,
            item_type_id: formData.itemTypeId || null,
            middle_category_id: formData.middleCategoryId,
            middle_category_name: formData.middleCategoryName,
            description: formData.description,
          }
        );

        if (response.data.success) {
          alert("Middle category created successfully!");
          handleCancel();
          fetchMiddleCategories();
        } else {
          alert(response.data.error || "Error creating middle category");
        }
      }
    } catch (error) {
      console.error("Error saving middle category:", error);
      alert(
        error.response?.data?.error || "Error saving middle category. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleLookup = () => {
    setShowBrowseModal(true);
  };

  const handleSelectMiddleCategory = (middleCategory) => {
    setFormData({
      id: middleCategory.id,
      mainCategoryId: middleCategory.main_category_id,
      itemTypeId: middleCategory.item_type_id || "",
      middleCategoryId: middleCategory.middle_category_id,
      middleCategoryName: middleCategory.middle_category_name,
      description: middleCategory.description || "",
    });
    setIsEditing(true);
    setShowBrowseModal(false);
  };

  const handleDeleteMiddleCategory = async (id, middleCategoryName) => {
    if (
      window.confirm(`Are you sure you want to delete middle category: ${middleCategoryName}?`)
    ) {
      try {
        setIsLoading(true);
        const response = await axios.delete(
          `${API_URL}/asset-categories/middle-categories/${id}`
        );

        if (response.data.success) {
          alert("Middle category deleted successfully!");
          fetchMiddleCategories();
          if (isEditing && formData.id === id) {
            handleCancel();
          }
        }
      } catch (error) {
        console.error("Error deleting middle category:", error);
        alert(error.response?.data?.error || "Error deleting middle category");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      id: "",
      mainCategoryId: "",
      itemTypeId: "",
      middleCategoryId: "",
      middleCategoryName: "",
      description: "",
    });
    setIsEditing(false);
  };

  const handleCloseModal = () => {
    setShowBrowseModal(false);
  };

  const isFormValid = () => {
    return (
      formData.mainCategoryId &&
      formData.middleCategoryId &&
      formData.middleCategoryName
    );
  };

  // Get main category name
  const getMainCategoryName = (mainCategoryId) => {
    const mainCategory = mainCategories.find(
      (cat) => String(cat.id) === String(mainCategoryId)
    );
    return mainCategory ? mainCategory.category_name : "Unknown";
  };

  // Get item type name
  const getItemTypeName = (itemTypeId) => {
    if (!itemTypeId) return "N/A";
    const itemType = itemTypes.find((item) => String(item.id) === String(itemTypeId));
    return itemType ? itemType.item_type_name : "Unknown";
  };

  return (
    <div className="fixed-asset-page">
      <div className="fixed-asset-container">
        <h1 className="fixed-asset-title">Fixed Asset - Middle Category</h1>

        <div className="fixed-asset-form">
          <div className="form-section">
            <h2 className="form-section-title">
              {isEditing ? "Edit Middle Category" : "Add New Middle Category"}
            </h2>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  Main Category
                  <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    name="mainCategoryId"
                    value={formData.mainCategoryId}
                    onChange={handleChange}
                    className="form-select"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select Main Category</option>
                    {mainCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow"></div>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Item Type
                  <span className="optional">(Optional)</span>
                </label>
                <div className="select-wrapper">
                  <select
                    name="itemTypeId"
                    value={formData.itemTypeId}
                    onChange={handleChange}
                    className="form-select"
                    disabled={!formData.mainCategoryId || isLoadingItemTypes || isEditing}
                  >
                    <option value="">Select Item Type (Optional)</option>
                    {itemTypes.map((itemType) => (
                      <option key={itemType.id} value={itemType.id}>
                        {itemType.item_type_name}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow"></div>
                  {isLoadingItemTypes && (
                    <div className="loading-indicator">Loading...</div>
                  )}
                  {!formData.mainCategoryId && !isLoadingItemTypes && (
                    <div className="field-hint">
                      Select a main category first
                    </div>
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Middle Category ID
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="middleCategoryId"
                    value={formData.middleCategoryId}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter Middle Category ID (e.g., MC001)"
                    required
                    disabled={isEditing}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">
                  Middle Category Name
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="middleCategoryName"
                    value={formData.middleCategoryName}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter Middle Category Name"
                    required
                  />
                </div>
              </div>

              <div className="form-group full-width">
                <label className="form-label">
                  Description
                  <span className="optional">(Optional)</span>
                </label>
                <div className="textarea-wrapper">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Enter Description"
                    rows="4"
                  />
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
                disabled={!isFormValid() || isLoading || isLoadingItemTypes}
              >
                <span className="btn-icon">
                  {isLoading ? "⏳" : isEditing ? "✓" : "💾"}
                </span>
                {isLoading ? "SAVING..." : isEditing ? "UPDATE" : "SAVE"}
              </button>
              <button
                className="btn-action btn-lookup"
                onClick={handleLookup}
                type="button"
                disabled={isLoading || isLoadingItemTypes}
                style={{ backgroundColor: "#fd9d0a" }}
              >
                <span className="btn-icon">🔍</span>
                LOOKUP
              </button>
              <button
                className="btn-action btn-cancel"
                onClick={handleCancel}
                type="button"
                disabled={isLoading || isLoadingItemTypes}
                style={{ backgroundColor: "#c51717ff" }}
              >
                <span className="btn-icon">✕</span>
                CANCEL
              </button>
            </div>

            <div className="form-info">
              <p className="info-text">
                <span className="required">*</span> Required fields
                <span className="optional"> (Optional)</span> Optional fields
              </p>
              <p className="info-text">
                {isLoading
                  ? "Loading..."
                  : `${mainCategories.length} main categories available`}
              </p>
              <p className="info-text">
                {formData.mainCategoryId
                  ? isLoadingItemTypes
                    ? "Loading item types..."
                    : `${itemTypes.length} item types available`
                  : "Select a main category to see item types"}
              </p>
              {isEditing && (
                <p className="info-text warning">
                  ⚠️ Editing Middle Category ID: {formData.middleCategoryId}
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
                  <h2>Browse Middle Categories</h2>
                  <span className="middle-category-count">
                    Total Middle Categories: {middleCategories.length}
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
                    <p>Loading middle categories...</p>
                  </div>
                ) : middleCategories.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">🗂️</div>
                    <h3>No Middle Categories Found</h3>
                    <p>There are no middle categories in the database yet.</p>
                    <button 
                      className="btn-action btn-add-new"
                      onClick={() => {
                        handleCloseModal();
                        handleCancel();
                      }}
                    >
                      <span className="btn-icon">+</span>
                      Add New Middle Category
                    </button>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="middle-categories-table">
                      <thead>
                        <tr>
                          <th width="10%">ID</th>
                          <th width="20%">Middle Category Name</th>
                          <th width="15%">Main Category</th>
                          <th width="15%">Item Type</th>
                          <th width="25%">Description</th>
                          <th width="15%">Created Date</th>
                          <th width="15%">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {middleCategories.map((middleCategory) => (
                          <tr key={middleCategory.id}>
                            <td>
                              <div className="middle-category-id-cell">
                                <strong>{middleCategory.middle_category_id}</strong>
                              </div>
                            </td>
                            <td>
                              <div className="middle-category-name-cell">
                                {middleCategory.middle_category_name}
                              </div>
                            </td>
                            <td>
                              <div className="main-category-cell">
                                {middleCategory.main_category || getMainCategoryName(middleCategory.main_category_id)}
                              </div>
                            </td>
                            <td>
                              <div className="item-type-cell">
                                {middleCategory.item_type_name || getItemTypeName(middleCategory.item_type_id) || "N/A"}
                              </div>
                            </td>
                            <td>
                              <div className="description-cell">
                                {middleCategory.description || (
                                  <span className="no-description">No description</span>
                                )}
                              </div>
                            </td>
                            <td>
                              {new Date(middleCategory.created_at).toLocaleDateString(
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
                                  onClick={() => handleSelectMiddleCategory(middleCategory)}
                                  title="Select this middle category"
                                >
                                  <span className="btn-icon">✓</span>
                                  Select
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() =>
                                    handleDeleteMiddleCategory(
                                      middleCategory.id,
                                      middleCategory.middle_category_name
                                    )
                                  }
                                  title="Delete this middle category"
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
                    <strong>Instructions:</strong> Click "Select" to edit a middle category, or "Delete" to remove it from the system.
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
          max-width: 1600px;
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
          background: linear-gradient(135deg, #4c51bf 0%, #667eea 100%);
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

        .middle-category-count {
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

        .middle-categories-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .middle-categories-table thead {
          background: #f1f5f9;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .middle-categories-table th {
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #334155;
          border-bottom: 2px solid #e2e8f0;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .middle-categories-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
          font-size: 0.9rem;
          vertical-align: top;
        }

        .middle-categories-table tbody tr {
          transition: all 0.2s;
        }

        .middle-categories-table tbody tr:hover {
          background: #f8fafc;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .middle-category-id-cell {
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          font-weight: 600;
          color: #1e40af;
        }

        .middle-category-name-cell {
          font-weight: 500;
          color: #1e293b;
        }

        .main-category-cell {
          font-weight: 500;
          color: #374151;
        }

        .item-type-cell {
          color: #4b5563;
          font-size: 0.9rem;
        }

        .description-cell {
          color: #6b7280;
          font-size: 0.9rem;
          max-height: 60px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
        }

        .no-description {
          color: #9ca3af;
          font-style: italic;
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
        @media (max-width: 1400px) {
          .fullscreen-modal {
            width: 98vw;
            height: 95vh;
          }
          
          .middle-categories-table {
            font-size: 0.85rem;
          }
          
          .middle-categories-table th,
          .middle-categories-table td {
            padding: 12px 10px;
          }
          
          .btn-select, .btn-delete {
            padding: 5px 8px;
            font-size: 0.75rem;
          }
        }

        @media (max-width: 1024px) {
          .middle-categories-table {
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
          .middle-categories-table th,
          .middle-categories-table td {
            padding: 10px 8px;
            font-size: 0.8rem;
          }
          
          .description-cell {
            -webkit-line-clamp: 2;
            max-height: 40px;
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

export default FixedAssetMiddleCategory;