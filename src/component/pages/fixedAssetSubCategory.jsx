import React, { useState, useEffect } from "react";
import "../../css/FixedAssetMiddleCategory.css";
import "../../css/pages.css";
import axios from "axios";

const FixedAssetSubCategory = () => {
  const [formData, setFormData] = useState({
    mainCategoryId: "",
    itemTypeId: "",
    middleCategoryId: "",
    middleCategoryName: "",
    description: "",
  });

  const [mainCategories, setMainCategories] = useState([]);
  const [middleCategories, setMiddleCategories] = useState([]);
  const [itemTypes, setItemTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingItemTypes, setIsLoadingItemTypes] = useState(false);

  // Fetch main categories from API on component mount
  useEffect(() => {
    const fetchMainCategories = async () => {
      setIsLoading(true);
      try {
        const respionse = await axios.get("http://localhost:3000/api/asset-categories/main-categories");
        setMainCategories(respionse.data)
      } catch (error) {
        console.error("Error fetching main categories:", error);
        // Fallback dummy data for demo
        setMainCategories([
          { id: 1, category_name: "Land/ Building/ Item / Vehicle" },
          { id: 2, category_name: "Equipment" },
          { id: 3, category_name: "Furniture" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMainCategories();
  }, []);

  useEffect(() => {
    const fetchMiddleCategories = async () => {
      setIsLoading(true);
      try {
        const respionse = await axios.get("http://localhost:3000/api/asset-categories/middle-categories");
        setMiddleCategories(respionse.data)
      } catch (error) {
        console.error("Error fetching middle categories:", error);
        // Fallback dummy data for demo
        setMainCategories([
          { id: 1, category_name: "middle category 1" },
          { id: 2, category_name: "middle category 2" },
          { id: 3, category_name: "middle category 3" },
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMiddleCategories();
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
        const response = await fetch(
          "http://localhost:3000/api/asset-categories/item-types"
        );
        const data = await response.json();
        if (data.success) {
          // Filter item types by main category
          const filteredItemTypes = data.data.filter(
            (item) => item.main_category_id == formData.mainCategoryId
          );
          setItemTypes(filteredItemTypes);
        }
      } catch (error) {
        console.error("Error fetching item types:", error);
        // Fallback dummy data for demo
        setItemTypes([
          { id: 1, item_type_name: "Type 1" },
          { id: 2, item_type_name: "Type 2" },
          { id: 3, item_type_name: "Type 3" },
        ]);
      } finally {
        setIsLoadingItemTypes(false);
      }
    };

    fetchItemTypes();
  }, [formData.mainCategoryId]);

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

  const handleNew = () => {
    setFormData({
      mainCategoryId: "",
      itemTypeId: "",
      middleCategoryId: "",
      middleCategoryName: "",
      description: "",
    });
  };

  const handleSave = async () => {
    console.log("Save clicked", formData);

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
      const response = await fetch(
        "http://localhost:3000/api/asset-categories/middle-categories",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            main_category_id: formData.mainCategoryId,
            item_type_id: formData.itemTypeId || null,
            middle_category_id: formData.middleCategoryId,
            middle_category_name: formData.middleCategoryName,
            description: formData.description,
          }),
        }
      );

      const data = await response.json();
      if (data.success) {
        alert("Middle category saved successfully!");
        // Reset form
        handleNew();
      } else {
        alert("Error saving middle category: " + data.error);
      }
    } catch (error) {
      console.error("Error saving middle category:", error);
      alert("Error saving middle category. Please try again.");
    }
  };

  const handleLookup = () => {
    console.log("Lookup clicked");
    // Navigate to middle categories list or open modal
    window.open("/middle-categories-list", "_blank");
  };

  const handleCancel = () => {
    handleNew();
  };

  const isFormValid = () => {
    return (
      formData.mainCategoryId &&
      formData.middleCategoryId &&
      formData.middleCategoryName
    );
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">
          Fixed Asset - Sub Category Management
        </h1>

        <div className="form">
          <div className="form-section">
            <h2 className="form-section-title">Middle Category Information</h2>

            <div className="form-grid">
               {/* Main Category */}
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
                  {isLoading && (
                    <div className="loading-indicator">Loading...</div>
                  )}
                </div>
              </div>

               {/* Middle Category */}
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
                    disabled={isLoading}
                  >
                    <option value="">Select Middle Category</option>
                    {middleCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.category_name}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow"></div>
                  {isLoading && (
                    <div className="loading-indicator">Loading...</div>
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
                    placeholder="Enter Sub Category ID (e.g., MC001)"
                    required
                  />
                </div>
              </div>

               {/* Sub Category */}
              <div className="form-group">
                <label className="form-label">
                  Sub Category
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
                    placeholder="Enter Short Code"
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
                    disabled={isLoading}
                  >
                    <option value="">Select Description Method</option>
                    <option value="option1">option1</option>
                    <option value="option2">option2</option>
                  </select>
                  <div className="select-arrow"></div>
                  {isLoading && (
                    <div className="loading-indicator">Loading...</div>
                  )}
                </div>
              </div>

               {/* Percentage */}
              <div className="form-group">
                <label className="form-label">
                  Percentage
                  <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    name="percentage"
                    value={formData.percentage}
                    onChange={handleChange}
                    className="form-select"
                    required
                    disabled={isLoading}
                  >
                    <option value="">Select Percentage</option>
                    <option value="option1">option1</option>
                    <option value="option2">option2</option>
                  </select>
                  <div className="select-arrow"></div>
                  {isLoading && (
                    <div className="loading-indicator">Loading...</div>
                  )}
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
                    disabled={isLoading}
                  >
                    <option value="">Select Item Locator Color</option>
                    <option value="option1">option1</option>
                    <option value="option2">option2</option>
                  </select>
                  <div className="select-arrow"></div>
                  {isLoading && (
                    <div className="loading-indicator">Loading...</div>
                  )}
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
                <span className="btn-icon">💾</span>
                SAVE
              </button>
              <button
                className="btn-action btn-lookup"
                onClick={handleLookup}
                type="button"
                disabled={isLoading || isLoadingItemTypes}
              >
                <span className="btn-icon">🔍</span>
                LOOKUP
              </button>
              <button
                className="btn-action btn-cancel"
                onClick={handleCancel}
                type="button"
                disabled={isLoading || isLoadingItemTypes}
              >
                <span className="btn-icon">✕</span>
                CANCEL
              </button>
            </div>

            <div className="form-info">
{/*               <p className="info-text">
                <span className="required">*</span> Required fields
                <span className="optional"> (Optional)</span> Optional fields
              </p>
              <p className="info-text">
                {isLoading
                  ? "Loading categories..."
                  : `${mainCategories.length} main categories available`}
              </p>
              <p className="info-text">
                {formData.mainCategoryId
                  ? isLoadingItemTypes
                    ? "Loading item types..."
                    : `${itemTypes.length} item types available`
                  : "Select a main category to see item types"}
              </p> */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FixedAssetSubCategory;
