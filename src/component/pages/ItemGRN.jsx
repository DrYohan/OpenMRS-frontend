import React, { useState, useEffect } from "react";
import "../../css/ItemGRN.css";

const ItemGRN = () => {
  // Main form data
  const [formData, setFormData] = useState({
    // Left Column - Section 1
    middleCategory: "",
    subCategory: "",
    itemName: "",
    p0No: "",
    brand: "",
    model: "",

    // Right Column - Section 1
    supplier: "",
    qty: "",
    date: "",
    invoiceNo: "",
    unitPrice: "",
    invTotal: "",

    // Left Column - Section 3
    manufacturer: "",
    type: "",
    source: "",
    receiveType: "",
    remarks: "",

    // Right Column - Section 3
    grnDate: "",
    grnNo: "",
    warrantyExp: "",
    serviceStart: "",
    serviceEnd: "",
    salvageValue: "",

    replicate: false,
  });

  // Dynamic file uploads array
  const [files, setFiles] = useState([
    { id: 1, name: "", file: null, fileName: "No file chosen" },
  ]);

  // Asset allocation rows
  const [assetRows, setAssetRows] = useState([
    {
      id: 1,
      center: "",
      location: "",
      department: "",
      employee: "",
      serialNo: "",
      bookNoLocalId: "",
      barcodeNo: "",
    },
  ]);

  // Dropdown options data
  const [dropdownOptions, setDropdownOptions] = useState({
    middleCategories: [
      { id: 1, name: "Electronics" },
      { id: 2, name: "Furniture" },
      { id: 3, name: "Vehicles" },
      { id: 4, name: "Office Equipment" },
      { id: 5, name: "IT Equipment" },
    ],
    subCategories: [
      { id: 1, name: "Laptops", middleCategoryId: 5 },
      { id: 2, name: "Desktops", middleCategoryId: 5 },
      { id: 3, name: "Printers", middleCategoryId: 5 },
      { id: 4, name: "Chairs", middleCategoryId: 2 },
      { id: 5, name: "Tables", middleCategoryId: 2 },
      { id: 6, name: "Mobiles", middleCategoryId: 1 },
      { id: 7, name: "TVs", middleCategoryId: 1 },
    ],
    receiveTypes: [
      { id: 1, name: "Purchase" },
      { id: 2, name: "Donation" },
      { id: 3, name: "Transfer" },
      { id: 4, name: "Lease" },
      { id: 5, name: "Gift" },
    ],
    centers: [
      { id: 1, name: "Main Center" },
      { id: 2, name: "Branch Office A" },
      { id: 3, name: "Branch Office B" },
      { id: 4, name: "Warehouse" },
    ],
    locations: [
      { id: 1, name: "Floor 1", centerId: 1 },
      { id: 2, name: "Floor 2", centerId: 1 },
      { id: 3, name: "Floor 1", centerId: 2 },
      { id: 4, name: "Floor 2", centerId: 2 },
      { id: 5, name: "Storage Area", centerId: 4 },
    ],
    departments: [
      { id: 1, name: "IT Department" },
      { id: 2, name: "HR Department" },
      { id: 3, name: "Finance Department" },
      { id: 4, name: "Operations Department" },
      { id: 5, name: "Marketing Department" },
    ],
    employees: [
      { id: 1, name: "John Smith", departmentId: 1 },
      { id: 2, name: "Jane Doe", departmentId: 1 },
      { id: 3, name: "Robert Johnson", departmentId: 2 },
      { id: 4, name: "Sarah Williams", departmentId: 2 },
      { id: 5, name: "Michael Brown", departmentId: 3 },
      { id: 6, name: "Emily Davis", departmentId: 4 },
      { id: 7, name: "David Wilson", departmentId: 5 },
    ],
  });

  // Filtered dropdowns
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);

  // Filter locations based on selected center
  const getFilteredLocations = (centerId) => {
    return dropdownOptions.locations.filter((loc) => loc.centerId == centerId);
  };

  // Filter employees based on selected department
  const getFilteredEmployees = (departmentId) => {
    return dropdownOptions.employees.filter(
      (emp) => emp.departmentId == departmentId
    );
  };

  // Update filtered subcategories when middle category changes
  useEffect(() => {
    if (formData.middleCategory) {
      const filtered = dropdownOptions.subCategories.filter(
        (subCat) => subCat.middleCategoryId == formData.middleCategory
      );
      setFilteredSubCategories(filtered);
    } else {
      setFilteredSubCategories([]);
      setFormData((prev) => ({ ...prev, subCategory: "" }));
    }
  }, [formData.middleCategory]);

  // Handle main form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "middleCategory") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        subCategory: "",
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle file upload
  const handleFileChange = (e, fileId) => {
    const file = e.target.files[0];
    if (file) {
      setFiles(
        files.map((f) =>
          f.id === fileId ? { ...f, file: file, fileName: file.name } : f
        )
      );
    }
  };

  // Add new file upload field
  const addFileUpload = () => {
    const newId =
      files.length > 0 ? Math.max(...files.map((f) => f.id)) + 1 : 1;
    setFiles([
      ...files,
      {
        id: newId,
        name: "",
        file: null,
        fileName: "No file chosen",
      },
    ]);
  };

  // Remove file upload field
  const removeFileUpload = (fileId) => {
    if (files.length > 1) {
      setFiles(files.filter((f) => f.id !== fileId));
    }
  };

  // Handle asset row field changes
  const handleAssetChange = (rowId, fieldName, value) => {
    setAssetRows((rows) =>
      rows.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [fieldName]: value };

          // If center changes, reset location
          if (fieldName === "center") {
            updatedRow.location = "";
          }
          // If department changes, reset employee
          else if (fieldName === "department") {
            updatedRow.employee = "";
          }

          return updatedRow;
        }
        return row;
      })
    );
  };

  // Add new asset row
  const addAssetRow = () => {
    const newId =
      assetRows.length > 0 ? Math.max(...assetRows.map((r) => r.id)) + 1 : 1;
    setAssetRows([
      ...assetRows,
      {
        id: newId,
        center: "",
        location: "",
        department: "",
        employee: "",
        serialNo: "",
        bookNoLocalId: "",
        barcodeNo: "",
      },
    ]);
  };

  // Remove asset row
  const removeAssetRow = (rowId) => {
    if (assetRows.length > 1) {
      setAssetRows(assetRows.filter((row) => row.id !== rowId));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.middleCategory ||
      !formData.subCategory ||
      !formData.itemName ||
      !formData.p0No ||
      !formData.supplier ||
      !formData.qty ||
      !formData.date ||
      !formData.invoiceNo ||
      !formData.grnDate ||
      !formData.grnNo
    ) {
      alert("Please fill in all required fields");
      return;
    }

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Map frontend field names to backend field names (NO TRAILING SPACES!)
      const fieldMapping = {
        middleCategory: "middle_category",
        subCategory: "sub_category",
        itemName: "item_name",
        p0No: "po_no",
        brand: "brand",
        model: "model",
        supplier: "supplier",
        qty: "qty",
        date: "date",
        invoiceNo: "invoice_no",
        unitPrice: "unit_price",
        invTotal: "inv_total",
        manufacturer: "manufacturer",
        type: "type",
        source: "source",
        receiveType: "receive_type",
        remarks: "remarks",
        grnDate: "grn_date",
        grnNo: "grn_no",
        warrantyExp: "warranty_expiry",
        serviceStart: "service_start",
        serviceEnd: "service_end",
        salvageValue: "salvage_value",
        replicate: "replicate",
      };

      // Debug: Log what we're about to send
      console.log("=== Preparing FormData ===");
      console.log("Form data from state:", formData);

      // Append main form data
      Object.keys(fieldMapping).forEach((frontendKey) => {
        const backendKey = fieldMapping[frontendKey];
        const value = formData[frontendKey];

        console.log(`Mapping ${frontendKey} -> ${backendKey}: ${value}`);

        if (value !== undefined && value !== null && value !== "") {
          // Special handling for boolean field
          if (frontendKey === "replicate") {
            formDataToSend.append(backendKey, value ? "true" : "false");
          } else {
            formDataToSend.append(backendKey, value.toString());
          }
        } else {
          // For debugging, you can uncomment this to see which fields are empty
          // console.log(`Skipping ${frontendKey}: ${value}`);
        }
      });

      // Append files - Use 'files' as field name
      files.forEach((file) => {
        if (file.file) {
          formDataToSend.append("files", file.file);
        }
      });

      // Append asset allocations
      if (assetRows.length > 0) {
        formDataToSend.append("assetAllocations", JSON.stringify(assetRows));
      }

      // Debug: Log FormData contents
      console.log("=== FormData being sent ===");
      for (let [key, value] of formDataToSend.entries()) {
        if (key === "files") {
          console.log(key, "File:", value.name, "Type:", value.type);
        } else if (key === "assetAllocations") {
          console.log(key, "JSON:", value);
        } else {
          // Log key length to check for spaces
          console.log(`Key: "${key}" (length: ${key.length})`, "Value:", value);
        }
      }

      // Send to backend
      const response = await fetch("http://localhost:3000/api/item-grn", {
        method: "POST",
        body: formDataToSend,
        // Note: Don't set Content-Type header for FormData
      });

      const result = await response.json();
      console.log("Backend response:", result);

      if (result.success) {
        alert(`Item GRN saved successfully! ID: ${result.data.id}`);
        handleReset();
      } else {
        alert("Error: " + result.message);
        if (result.errors) {
          console.log("Validation errors:", result.errors);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Error submitting form. Please try again.");
    }
  };

  // Reset all form data
  const handleReset = () => {
    setFormData({
      middleCategory: "",
      subCategory: "",
      itemName: "",
      p0No: "",
      brand: "",
      model: "",
      supplier: "",
      qty: "",
      date: "",
      invoiceNo: "",
      unitPrice: "",
      invTotal: "",
      manufacturer: "",
      type: "",
      source: "",
      receiveType: "",
      remarks: "",
      grnDate: "",
      grnNo: "",
      warrantyExp: "",
      serviceStart: "",
      serviceEnd: "",
      salvageValue: "",
      replicate: false,
    });

    setFiles([{ id: 1, name: "", file: null, fileName: "No file chosen" }]);
    setAssetRows([
      {
        id: 1,
        center: "",
        location: "",
        department: "",
        employee: "",
        serialNo: "",
        bookNoLocalId: "",
        barcodeNo: "",
      },
    ]);
  };

  return (
    <div className="item-grn-page">
      <div className="item-grn-container">
        <h1 className="item-grn-title">Items - GRN </h1>

        <form className="item-grn-form" onSubmit={handleSubmit}>
          {/* Section 1: Paired rows - 2 columns */}
          <div className="form-section">
            <div className="paired-section">
              <div className="paired-column">
                <div className="form-group">
                  <label className="form-label">
                    Middle Category<span className="required">*</span>
                  </label>
                  <div className="select-wrapper">
                    <select
                      name="middleCategory"
                      value={formData.middleCategory}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Middle Category</option>
                      {dropdownOptions.middleCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    <div className="select-arrow"></div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Sub Category<span className="required">*</span>
                  </label>
                  <div className="select-wrapper">
                    <select
                      name="subCategory"
                      value={formData.subCategory}
                      onChange={handleChange}
                      className="form-select"
                      required
                      disabled={!formData.middleCategory}
                    >
                      <option value="">Select Sub Category</option>
                      {filteredSubCategories.map((subCategory) => (
                        <option key={subCategory.id} value={subCategory.id}>
                          {subCategory.name}
                        </option>
                      ))}
                    </select>
                    <div className="select-arrow"></div>
                  </div>
                </div>
                <br />
                <br />
                <div className="form-group">
                  <label className="form-label">
                    Item Name<span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter item name"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    PO No<span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="p0No"
                      value={formData.p0No}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter PO number"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="brand"
                      value={formData.brand}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter brand"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Model</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="model"
                      value={formData.model}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter model"
                    />
                  </div>
                </div>
              </div>

              <div className="paired-column">
                <div className="form-group">
                  <label className="form-label">
                    Supplier<span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter supplier"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Qty<span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="qty"
                      value={formData.qty}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter quantity"
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="replicate"
                      checked={formData.replicate}
                      onChange={handleChange}
                      className="form-checkbox"
                    />
                    <span>Replicate</span>
                  </label>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Date<span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Invoice No<span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="invoiceNo"
                      value={formData.invoiceNo}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter invoice number"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="unitPrice"
                      value={formData.unitPrice}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter unit price"
                      step="0.01"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Inv Total</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="invTotal"
                      value={formData.invTotal}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter invoice total"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>

            <h2 className="form-section-title">Document Uploads</h2>
            <div className="file-uploads-section">
              {files.map((file, index) => (
                <div key={file.id} className="form-group file-upload-group">
                  <label className="form-label">Document {index + 1}</label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id={`file-${file.id}`}
                      onChange={(e) => handleFileChange(e, file.id)}
                      style={{ display: "none" }}
                    />
                    <button
                      type="button"
                      className="file-choose-btn"
                      onClick={() =>
                        document.getElementById(`file-${file.id}`).click()
                      }
                    >
                      Choose file
                    </button>
                    <span className="file-name">{file.fileName}</span>
                    {files.length > 1 && (
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => removeFileUpload(file.id)}
                        title="Remove file"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
              <div className="add-file-btn-container">
                <button
                  type="button"
                  className="btn-action btn-add-small"
                  onClick={addFileUpload}
                >
                  <span className="btn-icon">+</span> Add More Files
                </button>
              </div>
            </div>

            <div className="paired-section">
              <div className="paired-column">
                <div className="form-group">
                  <label className="form-label">Manufacturer</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="manufacturer"
                      value={formData.manufacturer}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter manufacturer"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="type"
                      value={formData.type}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter type"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Source</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter source"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Receive Type</label>
                  <div className="select-wrapper">
                    <select
                      name="receiveType"
                      value={formData.receiveType}
                      onChange={handleChange}
                      className="form-select"
                    >
                      <option value="">Select Receive Type</option>
                      {dropdownOptions.receiveTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                    <div className="select-arrow"></div>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <div className="textarea-wrapper">
                    <textarea
                      name="remarks"
                      value={formData.remarks}
                      onChange={handleChange}
                      className="form-textarea"
                      placeholder="Enter remarks"
                      rows="4"
                    />
                  </div>
                </div>
              </div>

              <div className="paired-column">
                <div className="form-group">
                  <label className="form-label">
                    GRN Date<span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      name="grnDate"
                      value={formData.grnDate}
                      onChange={handleChange}
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    GRN No<span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="grnNo"
                      value={formData.grnNo}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter GRN number"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Warranty Expiry</label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      name="warrantyExp"
                      value={formData.warrantyExp}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Service Start</label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      name="serviceStart"
                      value={formData.serviceStart}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Service End</label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      name="serviceEnd"
                      value={formData.serviceEnd}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Salvage Value</label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="salvageValue"
                      value={formData.salvageValue}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter salvage value"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Asset Allocation Table */}
          <div className="form-section asset-allocation-section">
            <h2 className="form-section-title">Asset Allocation</h2>

            <div className="asset-table-container">
              <table className="asset-allocation-table">
                <thead>
                  <tr>
                    <th>Center</th>
                    <th>Location</th>
                    <th>Department</th>
                    <th>Employee</th>
                    <th>Serial No</th>
                    <th>Book No/Local ID</th>
                    <th>Barcode No</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assetRows.map((row, index) => (
                    <tr key={row.id}>
                      <td>
                        <div className="select-wrapper">
                          <select
                            value={row.center}
                            onChange={(e) =>
                              handleAssetChange(
                                row.id,
                                "center",
                                e.target.value
                              )
                            }
                            className="form-select table-select"
                          >
                            <option value="">Select Center</option>
                            {dropdownOptions.centers.map((center) => (
                              <option key={center.id} value={center.id}>
                                {center.name}
                              </option>
                            ))}
                          </select>
                          <div className="select-arrow"></div>
                        </div>
                      </td>
                      <td>
                        <div className="select-wrapper">
                          <select
                            value={row.location}
                            onChange={(e) =>
                              handleAssetChange(
                                row.id,
                                "location",
                                e.target.value
                              )
                            }
                            className="form-select table-select"
                            disabled={!row.center}
                          >
                            <option value="">Select Location</option>
                            {getFilteredLocations(row.center).map(
                              (location) => (
                                <option key={location.id} value={location.id}>
                                  {location.name}
                                </option>
                              )
                            )}
                          </select>
                          <div className="select-arrow"></div>
                        </div>
                      </td>
                      <td>
                        <div className="select-wrapper">
                          <select
                            value={row.department}
                            onChange={(e) =>
                              handleAssetChange(
                                row.id,
                                "department",
                                e.target.value
                              )
                            }
                            className="form-select table-select"
                          >
                            <option value="">Select Department</option>
                            {dropdownOptions.departments.map((dept) => (
                              <option key={dept.id} value={dept.id}>
                                {dept.name}
                              </option>
                            ))}
                          </select>
                          <div className="select-arrow"></div>
                        </div>
                      </td>
                      <td>
                        <div className="select-wrapper">
                          <select
                            value={row.employee}
                            onChange={(e) =>
                              handleAssetChange(
                                row.id,
                                "employee",
                                e.target.value
                              )
                            }
                            className="form-select table-select"
                            disabled={!row.department}
                          >
                            <option value="">Select Employee</option>
                            {getFilteredEmployees(row.department).map(
                              (employee) => (
                                <option key={employee.id} value={employee.id}>
                                  {employee.name}
                                </option>
                              )
                            )}
                          </select>
                          <div className="select-arrow"></div>
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.serialNo}
                          onChange={(e) =>
                            handleAssetChange(
                              row.id,
                              "serialNo",
                              e.target.value
                            )
                          }
                          className="form-input table-input"
                          placeholder="Serial No"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.bookNoLocalId}
                          onChange={(e) =>
                            handleAssetChange(
                              row.id,
                              "bookNoLocalId",
                              e.target.value
                            )
                          }
                          className="form-input table-input"
                          placeholder="Book No/Local ID"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={row.barcodeNo}
                          onChange={(e) =>
                            handleAssetChange(
                              row.id,
                              "barcodeNo",
                              e.target.value
                            )
                          }
                          className="form-input table-input"
                          placeholder="Barcode No"
                        />
                      </td>
                      <td>
                        <div className="table-actions">
                          {index === assetRows.length - 1 && (
                            <button
                              type="button"
                              className="btn-action btn-add-small"
                              onClick={addAssetRow}
                            >
                              <span className="btn-icon">+</span>
                            </button>
                          )}
                          {assetRows.length > 1 && (
                            <button
                              type="button"
                              className="btn-action btn-remove"
                              onClick={() => removeAssetRow(row.id)}
                            >
                              <span className="btn-icon">×</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-section">
            <div className="action-buttons">
              <button
                className="btn-action btn-save"
                type="submit"
                style={{ backgroundColor: "#019159" }}
              >
                <span className="btn-icon">✓</span>
                SAVE
              </button>
              <button
                className="btn-action"
                type="button"
                style={{ backgroundColor: "#fd9d0a" }}
              >
                <span className="btn-icon">🔍</span>
                BROWSE
              </button>
              <button
                className="btn-action btn-cancel"
                type="button"
                style={{ backgroundColor: "#e75933" }}
                onClick={handleReset}
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
        </form>
      </div>
    </div>
  );
};

export default ItemGRN;
