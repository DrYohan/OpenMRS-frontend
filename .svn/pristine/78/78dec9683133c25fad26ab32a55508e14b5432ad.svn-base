import React, { useEffect, useState } from "react";
import "../../css/pages.css";
import "../../css/supplierDetails.css";
import axios from "axios";
import Swal from "sweetalert2";

const SupplierDetails = () => {
  const [formData, setFormData] = useState({
    stationId: "",
    supplierCode: "",
    supplierName: "",
    contactPerson: "",
    address: "",
    categories: [],
    telephone: "",
    fax: "",
    email: "",
    tinNo: "",
    status: "true",
  });

  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStations, setIsLoadingStations] = useState(false);

  /* ---------------- Dummy API ---------------- */
  useEffect(() => {
    setIsLoadingStations(true);
    setTimeout(() => {
      setStations([
        { id: 1, name: "Colombo Station" },
        { id: 2, name: "Kandy Station" },
        { id: 3, name: "Jaffna Station" },
      ]);
      setIsLoadingStations(false);
    }, 800);
  }, []);

  const clearForm = () => {
    setFormData({
      stationId: "",
      supplierCode: "",
      supplierName: "",
      contactPerson: "",
      address: "",
      categories: [],
      telephone: "",
      fax: "",
      email: "",
      tinNo: "",
      status: "true",
    })
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleCategory = (value) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(value)
        ? prev.categories.filter((v) => v !== value)
        : [...prev.categories, value],
    }));
  };


  /* for email and telephone */
  const regexValidate = (email, telephone) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    const phoneRegex = /^\d{10}$/;
    if (email && !emailRegex.test(email)) {
      return {
        isValid: false,
        message: "Please enter a valid email address.",
      };
    }
    if (telephone && !phoneRegex.test(telephone)) {
      return {
        isValid: false,
        message: "Telephone number must contain exactly 10 digits.",
      };
    }
    return { isValid: true };
  };


  const handleSave = async () => {
    if (!formData.stationId || !formData.supplierCode || !formData.supplierName) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: 'Please fill all required fields marked with *.',
      });
      return;
    }

    const validation = regexValidate( formData.email, formData.telephone );
    if (!validation.isValid) {
      Swal.fire({
        icon: 'warning',
        title: 'Validation Error',
        text: validation.message,
      });
      return;
    }
    console.log("Supplier Data:", formData);
    try {
      await axios.post('http://localhost:3000/api/supplier', formData);
      setIsLoading(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Supplier details saved successfully!',
      });
      clearForm();
    } catch (error) {
      console.error("Error saving supplier details:", error);  
      setIsLoading(false);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save supplier details. Please try again.',
      });    
    }
  };

  const handleLookup = () => {
    console.log("Lookup clicked");
  };

  const handleCancel = () => {
    clearForm();
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Supplier Details</h1>

        <div className="fixed-asset-form">
          <div className="form-section">
            <h2 className="form-section-title">Supplier Information</h2>

            <div className="form-grid">
              {/* Station Name */}
              <div className="form-group">
                <label className="form-label">
                  Station Name <span className="required">*</span>
                </label>
                <div className="select-wrapper">
                  <select
                    className="form-select"
                    name="stationId"
                    value={formData.stationId}
                    onChange={handleChange}
                    disabled={isLoadingStations}
                  >
                    <option value="">Select Station</option>
                    {stations.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                  <div className="select-arrow"></div>
                </div>
              </div>

              {/* Supplier Code */}
              <div className="form-group">
                <label className="form-label">
                  Supplier Code <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  name="supplierCode"
                  value={formData.supplierCode}
                  onChange={handleChange}
                />
              </div>

              {/* Supplier Name */}
              <div className="form-group">
                <label className="form-label">
                  Supplier Name <span className="required">*</span>
                </label>
                <input
                  className="form-input"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleChange}
                />
              </div>

              {/* Contact Person */}
              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input
                  className="form-input"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleChange}
                />
              </div>

              {/* Address + Category */}
              <div className="form-group full-width">
                <div className="two-column-row">
                  {/* Address */}
                  <div className="form-group">
                    <label className="form-label">Address</label>
                    <textarea
                      className="form-textarea"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Category */}
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <div className="category-hierarchy-a">
                      {["Services", "Fixed Asset", "Consumable Asset"].map(
                        (c) => (
                          <label key={c} className="hierarchy-item-a">
                            <input
                              type="checkbox"
                              checked={formData.categories.includes(c)}
                              onChange={() => toggleCategory(c)}
                            />
                            {c}
                          </label>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Telephone */}
              <div className="form-group">
                <label className="form-label">Telephone</label>
                <input
                  className="form-input"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>

              {/* Fax */}
              <div className="form-group">
                <label className="form-label">Fax</label>
                <input
                  className="form-input"
                  name="fax"
                  value={formData.fax}
                  onChange={handleChange}
                />
              </div>

              {/* Email */}
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  className="form-input"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>

              {/* TIN */}
              <div className="form-group">
                <label className="form-label">TIN No</label>
                <input
                  type="number"
                  className="form-input"
                  name="tinNo"
                  value={formData.tinNo}
                  onChange={handleChange}
                />
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">Status</label>
                <div className="select-wrapper">
                  <select
                    className="form-select"
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                  <div className="select-arrow"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="form-actions-section">
            <div className="action-buttons">
              <button
                className="btn-action btn-save"
                type="button"
                style={{ backgroundColor: "#4bc517ff" }}
                onClick={handleSave}
                disabled={ isLoading }
              >
                <span className="btn-icon">💾</span>
                SAVE
              </button>

              <button className="btn-action btn-lookup" 
                type="button"
                onClick={handleLookup}
                disabled={isLoading}
              >
                <span className="btn-icon">🔍</span>
                LOOKUP
              </button>

              <button className="btn-action btn-cancel" 
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <span className="btn-icon">✕</span>
                CANCEL
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SupplierDetails;
