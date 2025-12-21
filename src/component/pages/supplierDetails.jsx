import React, { use, useEffect, useState } from "react";
import "../../css/pages.css";
import "../../css/supplierDetails.css";
import axios from "axios";
import Swal from "sweetalert2";
import Select from "react-select";
import { set } from "rsuite/esm/internals/utils/date";

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
    status: true,
  });

  const [stations, setStations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingStations, setIsLoadingStations] = useState(false);
  const [updateState, setUpdateState] = useState(false);
  const [supplierCodeOptions, setSupplierCodeOptions] = useState([]);


  /* ---------------- Dummy API ---------------- */
  useEffect(() => {
    setIsLoadingStations(true);
    setTimeout(() => {
      setStations([
        { id: 1, name: "National Hospital (Teaching), Kandy" },
        { id: 2, name: "Sirimavo Bandaranayake Specialized Children Hospital (Teaching), Peradeniya" },
        { id: 3, name: "General Hospital (Teaching), Peradeniya" },
      ]);
      setIsLoadingStations(false);
    }, 800);
  }, []);

  const statusOptions = [
    { value: true, label: "Active" },
    { value: false, label: "Inactive" },
  ];


  const fetchAllSupplierCode = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/supplier/codes');
      console.log("Supplier Codes:", response.data.data);
      const options = response.data.data.map(code => ({
        value: code,
        label: code,
      }));
      setSupplierCodeOptions(options);
    } catch (error) {
      console.error("Error fetching supplier codes:", error);
    }
  }

  const fetchSupplierByCode = async (code) => {
    try {
      setIsLoading(true);
      const response = await axios.get(`http://localhost:3000/api/supplier/${code}`);
      const data = response.data.data;
      console.log("Fetched Supplier Data:", data);
      setFormData({
        stationId: parseInt(data.station_id) || "",
        supplierCode: data.supplier_code,
        supplierName: data.supplier_name,
        contactPerson: data.contact_person,
        address: data.address,
        categories: data.categories || [],
        telephone: parseInt(data.telephone) || "",
        fax: data.fax,
        email: data.email,
        tinNo: parseInt(data.tin_no) || "",
        status: data.status === 1, // convert 1/0 to string for your select
      });
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching supplier details:", error);
      setIsLoading(false);
    }
  };

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
      status: true,
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
      setIsLoading(true);
      if(updateState){
        await axios.put(`http://localhost:3000/api/supplier/${formData.supplierCode}`, formData);
      }else {
        await axios.post('http://localhost:3000/api/supplier', formData);
      }
      
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: `Supplier details ${updateState ? "update" :"saved"} successfully!`,
      });
      setIsLoading(false);
      clearForm();
    } catch (error) {
      console.error("Error saving supplier details:", error);  
      setIsLoading(false);
      if ( error.response && error.response.status === 400 && error.response.data?.message === "Email already exists"){
        Swal.fire({
          icon: 'warning',
          title: 'Duplicate Email',
          text: 'This email address already exists. Please use a different email.',
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'An error occurred while saving supplier details. Please try again.',
        });
      }  
    }
  };

  const handleLookup = () => {
    console.log("Lookup clicked");
    setUpdateState(true);
    clearForm();
    fetchAllSupplierCode();
  };


  const handleCancel = () => {
    clearForm();
    setUpdateState(false);
    
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
                <Select
                  name="stationId"
                  value={
                    stations
                      .map(s => ({ value: s.id, label: s.name }))
                      .find(option => option.value === formData.stationId) || null
                  }
                  onChange={(selected) =>
                    setFormData(prev => ({
                      ...prev,
                      stationId: selected ? selected.value : "",
                    }))
                  }
                  options={stations.map(s => ({ value: s.id, label: s.name }))}
                  isDisabled={isLoadingStations}
                  placeholder="Select Station"
                />
              </div>

              {/* Supplier Code */}
              <div className="form-group">
                <label className="form-label">
                  Supplier Code <span className="required">*</span>
                </label>
                {updateState ? (
                <Select
                  options={supplierCodeOptions}
                  value={
                    supplierCodeOptions.find(opt => opt.value === formData.supplierCode) || null
                  } // use null if not found
                  onChange={selected => {
                    setFormData(prev => ({
                      ...prev,
                      supplierCode: selected ? selected.value : "", 
                    }))
                    fetchSupplierByCode(selected.value);
                  }
                  }
                />

                  ) : (
                    <input
                      className="form-control"
                      id="supplierCode"
                      name="supplierCode"
                      value={formData.supplierCode || ""}
                      onChange={handleChange}
                    />
                  )}
              </div>

              {/* Supplier Name */}
              <div className="form-group">
                <label className="form-label">
                  Supplier Name <span className="required">*</span>
                </label>
                <input
                  className="form-control"
                  name="supplierName"
                  value={formData.supplierName}
                  onChange={handleChange}
                />
              </div>

              {/* Contact Person */}
              <div className="form-group">
                <label className="form-label">Contact Person</label>
                <input
                  className="form-control"
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
                      className="form-control"
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
                  className="form-control"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleChange}
                />
              </div>

              {/* Fax */}
              <div className="form-group">
                <label className="form-label">Fax</label>
                <input
                  className="form-control"
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
                  className="form-control"
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
                  className="form-control"
                  name="tinNo"
                  value={formData.tinNo}
                  onChange={handleChange}
                />
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">Status</label>

                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={statusOptions}
                  isSearchable={false}
                  placeholder="Select status"
                  value={statusOptions.find(
                    opt => opt.value === formData.status
                  )}
                  onChange={(selected) =>
                    setFormData(prev => ({
                      ...prev,
                      status: selected.value,
                    }))
                  }
                />
              </div>

            </div>
          </div>

          {/* Actions */}
          <div className="form-actions-section">
            <div className="action-buttons">
              <button
                className="button button-submit"
                type="button"
                onClick={handleSave}
                disabled={ isLoading }
              >
                {updateState ? "Update" : "Submit"}
              </button>

              <button className="button button-lookup" 
                type="button"
                onClick={handleLookup}
                disabled={isLoading}
              >
                Look up
              </button>

              <button className="button button-cancel" 
                type="button"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SupplierDetails;

