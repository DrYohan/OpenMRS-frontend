import React, { useState } from "react";
import "../../css/ItemGRN.css";

const ItemGRN = () => {
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

    // File Uploads - Section 2
    file1: "",
    file2: "",
    file3: "",

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

    // Asset Allocation - Section 4
    center: "",
    location: "",
    department: "",
    employee: "",
    serialNo: "",
    bookNoLocalId: "",
    barcodeNo: "",
    replicate: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFileChange = (e, fieldName) => {
    if (e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: e.target.files[0].name,
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
  };

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
      file1: "",
      file2: "",
      file3: "",
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
      center: "",
      location: "",
      department: "",
      employee: "",
      serialNo: "",
      bookNoLocalId: "",
      barcodeNo: "",
      replicate: false,
    });
  };

  return (
    <div className="item-grn-page">
      <div className="item-grn-container">
        <h1 className="item-grn-title">Items - GRN </h1>

        <div className="item-grn-form">
          {/* Section 1: Paired rows - 2 columns */}
          <div className="form-section">
            <h2 className="form-section-title">Item & Invoice Details</h2>

            <div className="paired-section">
              <div className="paired-column">
                <div className="form-group">
                  <label className="form-label">
                    Middle Category
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="middleCategory"
                      value={formData.middleCategory}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter middle category"
                    />
                  </div>
                </div>

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
                      placeholder="Enter sub category"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Item Name
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="itemName"
                      value={formData.itemName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter item name"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    PO No
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="p0No"
                      value={formData.p0No}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter PO number"
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
                    Supplier
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter supplier"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Qty
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="number"
                      name="qty"
                      value={formData.qty}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter quantity"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Date
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Invoice No
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="invoiceNo"
                      value={formData.invoiceNo}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter invoice number"
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
          </div>

          {/* Section 2: File Uploads */}
          <div className="form-section">
            <h2 className="form-section-title">Document Uploads</h2>

            <div className="file-uploads-section">
              <div className="form-group file-upload-group">
                <label className="form-label">Document 1</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="file1"
                    onChange={(e) => handleFileChange(e, "file1")}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="file-choose-btn"
                    onClick={() => document.getElementById("file1").click()}
                  >
                    Choose file
                  </button>
                  <span className="file-name">
                    {formData.file1 || "No file chosen"}
                  </span>
                </div>
              </div>

              <div className="form-group file-upload-group">
                <label className="form-label">Document 2</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="file2"
                    onChange={(e) => handleFileChange(e, "file2")}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="file-choose-btn"
                    onClick={() => document.getElementById("file2").click()}
                  >
                    Choose file
                  </button>
                  <span className="file-name">
                    {formData.file2 || "No file chosen"}
                  </span>
                </div>
              </div>

              <div className="form-group file-upload-group">
                <label className="form-label">Document 3</label>
                <div className="file-input-wrapper">
                  <input
                    type="file"
                    id="file3"
                    onChange={(e) => handleFileChange(e, "file3")}
                    style={{ display: "none" }}
                  />
                  <button
                    type="button"
                    className="file-choose-btn"
                    onClick={() => document.getElementById("file3").click()}
                  >
                    Choose file
                  </button>
                  <span className="file-name">
                    {formData.file3 || "No file chosen"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Manufacturer & GRN Details */}
          <div className="form-section">
            <h2 className="form-section-title">Manufacturer & GRN Details</h2>

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
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="receiveType"
                      value={formData.receiveType}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter receive type"
                    />
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
                    GRN Date
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      name="grnDate"
                      value={formData.grnDate}
                      onChange={handleChange}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">
                    GRN No
                    <span className="required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="grnNo"
                      value={formData.grnNo}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter GRN number"
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

          {/* Section 4: Asset Allocation - Boxed */}
          <div className="form-section asset-allocation-section">
            <h2 className="form-section-title">Asset Allocation</h2>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Center</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="center"
                    value={formData.center}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter center"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Location</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter location"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Department</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter department"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Employee</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="employee"
                    value={formData.employee}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter employee"
                  />
                </div>
              </div>
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">Serial No</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="serialNo"
                    value={formData.serialNo}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter serial number"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Book No/Local ID</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="bookNoLocalId"
                    value={formData.bookNoLocalId}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter book number / local ID"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Barcode No</label>
                <div className="input-wrapper">
                  <input
                    type="text"
                    name="barcodeNo"
                    value={formData.barcodeNo}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter barcode number"
                  />
                </div>
              </div>

              <div className="form-group add-button-group">
                <div className="checkbox-label">
                  <input
                    type="checkbox"
                    name="replicate"
                    checked={formData.replicate}
                    onChange={handleChange}
                    className="form-checkbox"
                  />
                  <span>Replicate</span>
                </div>
                <button type="button" className="btn-action btn-add-small">
                  <span className="btn-icon">+</span>
                  ADD
                </button>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="form-actions-section">
            <div className="action-buttons">
              <button
                className="btn-action btn-save"
                type="submit"
                style={{ backgroundColor: "#019159" }}
                onClick={handleSubmit}
              >
                <span className="btn-icon">✓</span>
                SAVE
              </button>
              <button
                className="btn-action "
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
        </div>
      </div>
    </div>
  );
};

export default ItemGRN;
