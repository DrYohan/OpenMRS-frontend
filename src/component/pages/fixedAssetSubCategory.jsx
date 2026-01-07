import React, { useState, useEffect } from "react";
import "../../css/FixedAssetMiddleCategory.css";
import "../../css/pages.css";
import axios from "axios";

const FixedAssetSubCategory = () => {
  const [formData, setFormData] = useState({
    id: "",
    mainCategoryId: "",
    middleCategoryId: "",
    subCategoryId: "",
    subCategory: "",
    shortCode: "",
    descriptionMethod: "",
    percentage: "",
    itemLocatorColor: "",
    description: "",
  });

  const [mainCategories, setMainCategories] = useState([]);
  const [isLoadingMainCategories, setIsLoadingMainCategories] = useState(false);

  const [middleCategories, setMiddleCategories] = useState([]);
  const [filteredMiddleCategories, setFilteredMiddleCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [isLoadingMiddleCategories, setIsLoadingMiddleCategories] = useState(false);
  const [isLoadingSubCategories, setIsLoadingSubCategories] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showBrowseModal, setShowBrowseModal] = useState(false);

  // Fetch main and middle categories from API on component mount
  useEffect(() => {
    fetchMainCategories();
    fetchAllMiddleCategories();
  }, []);

  // Fetch sub-categories when modal opens
  useEffect(() => {
    if (showBrowseModal) {
      fetchSubCategories();
    }
  }, [showBrowseModal]);

  // Filter middle categories when main category changes
  useEffect(() => {
    console.log("Main Category ID changed to:", formData.mainCategoryId);
    console.log("Available middle categories:", middleCategories);

    if (formData.mainCategoryId && middleCategories.length > 0) {
      const filtered = middleCategories.filter(
        (category) =>
          category.main_category_id.toString() === formData.mainCategoryId
      );
      console.log("Filtered middle categories:", filtered);
      setFilteredMiddleCategories(filtered);

      // Reset middle category selection if the current selection is not in filtered list
      if (formData.middleCategoryId) {
        const currentMiddleCategoryExists = filtered.some(
          (category) => category.id.toString() === formData.middleCategoryId
        );
        if (!currentMiddleCategoryExists) {
          setFormData((prev) => ({ ...prev, middleCategoryId: "" }));
        }
      }
    } else {
      console.log(
        "No main category selected or no middle categories available"
      );
      setFilteredMiddleCategories([]);
      if (formData.middleCategoryId) {
        setFormData((prev) => ({ ...prev, middleCategoryId: "" }));
      }
    }
  }, [formData.mainCategoryId, middleCategories]);

  const fetchMainCategories = async () => {
    setIsLoadingMainCategories(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/asset-categories/main-categories"
      );
      if (response.data && response.data.success) {
        setMainCategories(response.data.data);
      } else if (Array.isArray(response.data.data)) {
        setMainCategories(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching main categories:", error);
    } finally {
      setIsLoadingMainCategories(false);
    }
  };

  const fetchAllMiddleCategories = async () => {
    setIsLoadingMiddleCategories(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/asset-categories/middle-categories"
      );

      console.log("Full API Response:", response.data);

      if (
        response.data &&
        response.data.success &&
        Array.isArray(response.data.data)
      ) {
        console.log(
          "Middle categories fetched from API:",
          response.data.data
        );
        setMiddleCategories(response.data.data);

        // If a main category is already selected, filter the middle categories
        if (formData.mainCategoryId) {
          const filtered = response.data.data.filter(
            (category) =>
              category.main_category_id.toString() === formData.mainCategoryId
          );
          console.log("Filtered categories after initial load:", filtered);
          setFilteredMiddleCategories(filtered);
        }
      } else {
        console.error("Invalid API response format:", response.data);
        setMiddleCategories([]);
      }
    } catch (error) {
      console.error("Error fetching middle categories:", error);
      setMiddleCategories([]);
    } finally {
      setIsLoadingMiddleCategories(false);
    }
  };

  const fetchSubCategories = async () => {
    setIsLoadingSubCategories(true);
    try {
      const response = await axios.get(
        "http://localhost:3000/api/asset-categories/sub-categories"
      );

      if (response.data.success || response.data.data) {
        setSubCategories(response.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching sub-categories:", error);
      alert("Error fetching sub-categories. Please try again.");
      setSubCategories([]);
    } finally {
      setIsLoadingSubCategories(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`Field changed: ${name} = ${value}`);

    if (name === "mainCategoryId") {
      // Reset middle category when main category changes
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        middleCategoryId: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleSave = async () => {
    console.log("Save clicked", formData);

    // Validate required fields
    if (
      !formData.mainCategoryId ||
      !formData.middleCategoryId ||
      !formData.subCategoryId ||
      !formData.subCategory ||
      !formData.shortCode ||
      !formData.descriptionMethod ||
      !formData.percentage ||
      !formData.itemLocatorColor
    ) {
      alert("Please fill in all required fields (marked with *)");
      return;
    }

    // Validate that subCategoryId matches expected format
    if (!/^[A-Z0-9]+$/.test(formData.subCategoryId)) {
      alert(
        "Sub Category ID should contain only uppercase letters and numbers"
      );
      return;
    }

    // Validate that shortCode matches expected format
    if (!/^[A-Z0-9]+$/.test(formData.shortCode)) {
      alert("Short Code should contain only uppercase letters and numbers");
      return;
    }

    try {
      if (isEditing) {
        // Update existing sub-category
        const response = await axios.put(
          `http://localhost:3000/api/asset-categories/sub-categories/${formData.id}`,
          {
            main_category_id: parseInt(formData.mainCategoryId),
            middle_category_id: parseInt(formData.middleCategoryId),
            sub_category_id: formData.subCategoryId,
            sub_category_name: formData.subCategory,
            short_code: formData.shortCode,
            description_method: formData.descriptionMethod,
            percentage: parseFloat(formData.percentage),
            item_locator_color: formData.itemLocatorColor,
            description: formData.description || null,
          }
        );

        if (response.data.success) {
          alert("Sub category updated successfully!");
          handleCancel();
          fetchSubCategories();
        } else {
          alert(response.data.error || "Error updating sub category");
        }
      } else {
        // Create new sub-category
        const response = await axios.post(
          "http://localhost:3000/api/asset-categories/sub-categories",
          {
            main_category_id: parseInt(formData.mainCategoryId),
            middle_category_id: parseInt(formData.middleCategoryId),
            sub_category_id: formData.subCategoryId,
            sub_category_name: formData.subCategory,
            short_code: formData.shortCode,
            description_method: formData.descriptionMethod,
            percentage: parseFloat(formData.percentage),
            item_locator_color: formData.itemLocatorColor,
            description: formData.description || null,
          }
        );

        if (response.data.success) {
          alert("Sub category saved successfully!");
          handleCancel();
          fetchSubCategories();
        } else {
          alert(
            "Error saving sub category: " +
              (response.data.error || "Unknown error")
          );
        }
      }
    } catch (error) {
      console.error("Error saving sub category:", error);
      if (error.response?.data?.error) {
        alert("Error saving sub category: " + error.response.data.error);
      } else {
        alert("Error saving sub category. Please try again.");
      }
    }
  };

  const handleLookup = () => {
    setShowBrowseModal(true);
  };

  const handleSelectSubCategory = (subCategory) => {
    setFormData({
      id: subCategory.id,
      mainCategoryId: subCategory.main_category_id.toString(),
      middleCategoryId: subCategory.middle_category_id.toString(),
      subCategoryId: subCategory.sub_category_id,
      subCategory: subCategory.sub_category_name,
      shortCode: subCategory.short_code,
      descriptionMethod: subCategory.description_method,
      percentage: subCategory.percentage,
      itemLocatorColor: subCategory.item_locator_color,
      description: subCategory.description || "",
    });
    setIsEditing(true);
    setShowBrowseModal(false);
  };

  const handleDeleteSubCategory = async (id, subCategoryName) => {
    if (
      window.confirm(`Are you sure you want to delete sub-category: ${subCategoryName}?`)
    ) {
      try {
        setIsLoadingSubCategories(true);
        const response = await axios.delete(
          `http://localhost:3000/api/asset-categories/sub-categories/${id}`
        );

        if (response.data.success) {
          alert("Sub category deleted successfully!");
          fetchSubCategories();
          if (isEditing && formData.id === id) {
            handleCancel();
          }
        }
      } catch (error) {
        console.error("Error deleting sub-category:", error);
        alert(error.response?.data?.error || "Error deleting sub-category");
      } finally {
        setIsLoadingSubCategories(false);
      }
    }
  };

  const handleCancel = () => {
    setFormData({
      id: "",
      mainCategoryId: "",
      middleCategoryId: "",
      subCategoryId: "",
      subCategory: "",
      shortCode: "",
      descriptionMethod: "",
      percentage: "",
      itemLocatorColor: "",
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
      formData.subCategoryId &&
      formData.subCategory &&
      formData.shortCode &&
      formData.descriptionMethod &&
      formData.percentage &&
      formData.itemLocatorColor
    );
  };

  // Get main category name
  const getMainCategoryName = (mainCategoryId) => {
    const mainCategory = mainCategories.find(
      (cat) => cat.id.toString() === mainCategoryId.toString()
    );
    return mainCategory ? mainCategory.category_name : "Unknown";
  };

  // Get middle category name
  const getMiddleCategoryName = (middleCategoryId) => {
    const middleCategory = middleCategories.find(
      (cat) => cat.id.toString() === middleCategoryId.toString()
    );
    return middleCategory ? middleCategory.middle_category_name : "Unknown";
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Fixed Asset - Sub Category Management</h1>

        <div className="form">
          <div className="form-section">
            <h2 className="form-section-title">
              {isEditing ? "Edit Sub Category" : "Add New Sub Category"}
            </h2>

            <div className="form-grid">
              {/* Main Category - From Database */}
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
                    disabled={isLoadingMainCategories}
                  >
                    <option value="">Select Main Category</option>
                    {mainCategories.map((category) => (
                      <option key={category.id} value={category.id.toString()}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow"></div>
                  {isLoadingMainCategories && (
                    <div className="loading-indicator">Loading...</div>
                  )}
                </div>
              </div>

              {/* Middle Category - From Database */}
              <div className="form-group">
                <label className="form-label">
                  Middle Category
                  <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    name="middleCategoryId"
                    value={formData.middleCategoryId}
                    onChange={handleChange}
                    className="form-select"
                    required
                    disabled={
                      !formData.mainCategoryId || isLoadingMiddleCategories || isEditing
                    }
                  >
                    <option value="">Select Middle Category</option>
                    {filteredMiddleCategories.length > 0
                      ? filteredMiddleCategories.map((category) => (
                          <option
                            key={category.id}
                            value={category.id.toString()}
                          >
                            {category.middle_category_name} (
                            {category.middle_category_id})
                          </option>
                        ))
                      : !isLoadingMiddleCategories && (
                          <option value="" disabled>
                            No middle categories available
                          </option>
                        )}
                  </select>
                  <div className="select-arrow"></div>
                  {isLoadingMiddleCategories && (
                    <div className="loading-indicator">Loading...</div>
                  )}
                  {formData.mainCategoryId &&
                    filteredMiddleCategories.length === 0 &&
                    !isLoadingMiddleCategories && (
                      <div className="no-data-message">
                        No middle categories found for selected main category
                      </div>
                    )}
                </div>
              </div>

              {/* Sub Category ID */}
              <div className="form-group">
                <label className="form-label">
                  Sub Category ID
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="subCategoryId"
                    value={formData.subCategoryId}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter Sub Category ID (e.g., SC001)"
                    required
                    disabled={isEditing}
                  />
                </div>
              </div>

              {/* Sub Category Name */}
              <div className="form-group">
                <label className="form-label">
                  Sub Category Name
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter Sub Category Name"
                    required
                  />
                </div>
              </div>

              {/* Short Code */}
              <div className="form-group">
                <label className="form-label">
                  Short Code
                  <span className="required">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="shortCode"
                    value={formData.shortCode}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter Short Code (e.g., SC)"
                    required
                  />
                </div>
              </div>

              {/* Description Method */}
              <div className="form-group">
                <label className="form-label">
                  Description Method
                  <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    name="descriptionMethod"
                    value={formData.descriptionMethod}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Description Method</option>
                    <option value="manual">Manual Description</option>
                    <option value="auto">Automatic Description</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                  <div className="select-arrow"></div>
                </div>
              </div>

              {/* Percentage */}
              <div className="form-group">
                <label className="form-label">
                  Percentage (%)
                  <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    name="percentage"
                    value={formData.percentage}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Percentage</option>
                    <option value="5">5%</option>
                    <option value="10">10%</option>
                    <option value="15">15%</option>
                    <option value="20">20%</option>
                    <option value="25">25%</option>
                    <option value="30">30%</option>
                    <option value="40">40%</option>
                    <option value="50">50%</option>
                  </select>
                  <div className="select-arrow"></div>
                </div>
              </div>

              {/* Item Locator Color */}
              <div className="form-group">
                <label className="form-label">
                  Item Locator Color
                  <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    name="itemLocatorColor"
                    value={formData.itemLocatorColor}
                    onChange={handleChange}
                    className="form-select"
                    required
                  >
                    <option value="">Select Color</option>
                    <option value="red">Red</option>
                    <option value="blue">Blue</option>
                    <option value="green">Green</option>
                    <option value="yellow">Yellow</option>
                    <option value="orange">Orange</option>
                    <option value="purple">Purple</option>
                    <option value="black">Black</option>
                    <option value="white">White</option>
                  </select>
                  <div className="select-arrow"></div>
                </div>
              </div>

              {/* Description */}
              <div className="form-group full-width">
                <label className="form-label">
                  Description
                  <span className="optional"> (Optional)</span>
                </label>
                <div className="input-wrapper">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="form-textarea"
                    placeholder="Enter description (optional)"
                    rows="3"
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
                disabled={!isFormValid() || isLoadingMiddleCategories}
              >
                <span className="btn-icon">
                  {isEditing ? "✓" : "💾"}
                </span>
                {isEditing ? "UPDATE" : "SAVE"}
              </button>
              <button
                className="btn-action btn-lookup"
                onClick={handleLookup}
                type="button"
                disabled={isLoadingMiddleCategories}
                style={{ backgroundColor: "#fd9d0a" }}
              >
                <span className="btn-icon">🔍</span>
                LOOKUP
              </button>
              <button
                className="btn-action btn-cancel"
                onClick={handleCancel}
                type="button"
                disabled={isLoadingMiddleCategories}
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
                {mainCategories.length} main categories available
              </p>
              <p className="info-text">
                {formData.mainCategoryId
                  ? isLoadingMiddleCategories
                    ? "Loading middle categories..."
                    : `${filteredMiddleCategories.length} middle categories available for selected main category`
                  : "Select a main category to see middle categories"}
              </p>
              {isEditing && (
                <p className="info-text warning">
                  ⚠️ Editing Sub Category ID: {formData.subCategoryId}
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
                  <h2>Browse Sub Categories</h2>
                  <span className="sub-category-count">
                    Total Sub Categories: {subCategories.length}
                  </span>
                </div>
                <button className="modal-close-btn" onClick={handleCloseModal}>
                  <span className="close-icon">×</span>
                  <span className="close-text">Close</span>
                </button>
              </div>
              
              <div className="fullscreen-modal-content">
                {isLoadingSubCategories ? (
                  <div className="loading-state">
                    <div className="spinner"></div>
                    <p>Loading sub categories...</p>
                  </div>
                ) : subCategories.length === 0 ? (
                  <div className="empty-state">
                    <div className="empty-icon">📋</div>
                    <h3>No Sub Categories Found</h3>
                    <p>There are no sub categories in the database yet.</p>
                    <button 
                      className="btn-action btn-add-new"
                      onClick={() => {
                        handleCloseModal();
                        handleCancel();
                      }}
                    >
                      <span className="btn-icon">+</span>
                      Add New Sub Category
                    </button>
                  </div>
                ) : (
                  <div className="table-wrapper">
                    <table className="sub-categories-table">
                      <thead>
                        <tr>
                          <th width="8%">Sub ID</th>
                          <th width="15%">Sub Category</th>
                          <th width="10%">Short Code</th>
                          <th width="12%">Main Category</th>
                          <th width="12%">Middle Category</th>
                          <th width="10%">Description Method</th>
                          <th width="8%">Percentage</th>
                          <th width="10%">Color</th>
                          <th width="15%">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {subCategories.map((subCategory) => (
                          <tr key={subCategory.id}>
                            <td>
                              <div className="sub-category-id-cell">
                                <strong>{subCategory.sub_category_id}</strong>
                              </div>
                            </td>
                            <td>
                              <div className="sub-category-name-cell">
                                {subCategory.sub_category_name}
                              </div>
                            </td>
                            <td>
                              <div className="short-code-cell">
                                <code>{subCategory.short_code}</code>
                              </div>
                            </td>
                            <td>
                              <div className="main-category-cell">
                                {subCategory.main_category_name || getMainCategoryName(subCategory.main_category_id)}
                              </div>
                            </td>
                            <td>
                              <div className="middle-category-cell">
                                {subCategory.middle_category_name || getMiddleCategoryName(subCategory.middle_category_id)}
                              </div>
                            </td>
                            <td>
                              <div className="description-method-cell">
                                <span className={`method-badge method-${subCategory.description_method}`}>
                                  {subCategory.description_method}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="percentage-cell">
                                <strong>{subCategory.percentage}%</strong>
                              </div>
                            </td>
                            <td>
                              <div className="color-cell">
                                <span 
                                  className="color-indicator" 
                                  style={{ 
                                    backgroundColor: subCategory.item_locator_color,
                                    display: 'inline-block',
                                    width: '20px',
                                    height: '20px',
                                    borderRadius: '4px',
                                    border: '1px solid #ddd'
                                  }}
                                  title={subCategory.item_locator_color}
                                ></span>
                                <span className="color-name">
                                  {subCategory.item_locator_color}
                                </span>
                              </div>
                            </td>
                            <td>
                              <div className="action-buttons-cell">
                                <button
                                  className="btn-select"
                                  onClick={() => handleSelectSubCategory(subCategory)}
                                  title="Select this sub category"
                                >
                                  <span className="btn-icon">✓</span>
                                  Select
                                </button>
                                <button
                                  className="btn-delete"
                                  onClick={() =>
                                    handleDeleteSubCategory(
                                      subCategory.id,
                                      subCategory.sub_category_name
                                    )
                                  }
                                  title="Delete this sub category"
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
                    <strong>Instructions:</strong> Click "Select" to edit a sub category, or "Delete" to remove it from the system.
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
          background: linear-gradient(135deg, #553c9a 0%, #6b46c1 100%);
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

        .sub-category-count {
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

        .sub-categories-table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
        }

        .sub-categories-table thead {
          background: #f1f5f9;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .sub-categories-table th {
          padding: 16px 12px;
          text-align: left;
          font-weight: 600;
          color: #334155;
          border-bottom: 2px solid #e2e8f0;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .sub-categories-table td {
          padding: 14px 12px;
          border-bottom: 1px solid #f1f5f9;
          color: #475569;
          font-size: 0.9rem;
          vertical-align: middle;
        }

        .sub-categories-table tbody tr {
          transition: all 0.2s;
        }

        .sub-categories-table tbody tr:hover {
          background: #f8fafc;
          transform: translateY(-1px);
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        .sub-category-id-cell {
          font-family: 'Courier New', monospace;
          font-size: 1rem;
          font-weight: 600;
          color: #1e40af;
        }

        .sub-category-name-cell {
          font-weight: 500;
          color: #1e293b;
        }

        .short-code-cell {
          font-family: 'Courier New', monospace;
          background: #f3f4f6;
          padding: 4px 8px;
          border-radius: 4px;
          display: inline-block;
        }

        .main-category-cell,
        .middle-category-cell {
          color: #374151;
          font-size: 0.9rem;
        }

        .method-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: capitalize;
        }

        .method-manual {
          background: #fef3c7;
          color: #92400e;
        }

        .method-auto {
          background: #dbeafe;
          color: #1e40af;
        }

        .method-hybrid {
          background: #f3e8ff;
          color: #5b21b6;
        }

        .percentage-cell {
          font-weight: 600;
          color: #059669;
        }

        .color-cell {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .color-name {
          font-size: 0.85rem;
          color: #6b7280;
          text-transform: capitalize;
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
          
          .sub-categories-table {
            font-size: 0.85rem;
          }
          
          .sub-categories-table th,
          .sub-categories-table td {
            padding: 12px 10px;
          }
          
          .btn-select, .btn-delete {
            padding: 5px 8px;
            font-size: 0.75rem;
          }
        }

        @media (max-width: 1200px) {
          .sub-categories-table {
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
          .sub-categories-table th,
          .sub-categories-table td {
            padding: 10px 8px;
            font-size: 0.8rem;
          }
          
          .btn-select, .btn-delete {
            padding: 4px 6px;
            font-size: 0.7rem;
          }
          
          .color-cell {
            flex-direction: column;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default FixedAssetSubCategory;