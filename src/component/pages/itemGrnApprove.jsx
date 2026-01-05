import React, { useEffect, useState } from "react";
import "../../css/pages.css";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";

const ItemGrnApprove = () => {
  const [formData, setFormData] = useState({
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
  const [details, setDetails] = useState([]);
  const [grnNo, setGrnNo] = useState([]);
  const [images, setImages] = useState([]);
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const fetchGrnNo = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/item-grn-approve/grn-no"
        );
        setGrnNo(response.data.data);
      } catch (error) {
        console.error("Error fetching GRN No:", error);
      }
    };
    fetchGrnNo();
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleGrnChange = async (grnNo) => {
    setFormData((prev) => ({
      ...prev,
      grnNo: grnNo,
    }));

    if (!grnNo) {
      setDetails([]);
      setImages([]);
      setSummary(null);
      return;
    }

    try {
      const response = await axios.get(
        `http://localhost:3000/api/item-grn-approve/${grnNo}`
      );

      if (!response.data.success) {
        throw new Error(response.data.message || "Failed to fetch GRN details");
      }

      const allDetails = response.data.data;
      const summaryInfo = response.data.summary;

      if (!allDetails || allDetails.length === 0) {
        console.log("No records found");
        setDetails([]);
        setImages([]);
        setSummary(null);
        Swal.fire({
          icon: "info",
          title: "No records",
          text: "No records found for this GRN number",
        });
        return;
      }

      // Process all details
      const processedDetails = allDetails.map((item, index) => ({
        ...item,
        id: item.id || `item-${index}`,
        status: item.status !== undefined ? Number(item.status) : 0,
      }));

      console.log("Processed details:", processedDetails);
      setDetails(processedDetails);
      setSummary(summaryInfo);

      // Collect all images from all items
      const allImages = processedDetails.flatMap((item) =>
        (item.item_images || []).filter(Boolean)
      );
      setImages([...new Set(allImages)]);

      // Set form data with information from FIRST item for display
      if (processedDetails.length > 0) {
        const firstItem = processedDetails[0];
        const qty = processedDetails.length;

        const formUpdates = {
          middleCategory: firstItem.item_middle_category || "",
          subCategory: firstItem.item_sub_category || "",
          itemName: firstItem.item_name || "",
          p0No: firstItem.item_po_no || "",
          brand: firstItem.item_brand || "",
          model: firstItem.item_model || "",
          supplier: firstItem.item_supplier || "",
          qty: qty || "",
          date: firstItem.item_date ? formatDate(firstItem.item_date) : "",
          invoiceNo: firstItem.item_invoice_no || "",
          unitPrice: firstItem.item_unit_price || "",
          invTotal: firstItem.item_inv_total || "",
          manufacturer: firstItem.item_manufacturer || "",
          type: firstItem.item_type || "",
          source: firstItem.item_source || "",
          receiveType: firstItem.item_receive_type || "",
          remarks: firstItem.item_remarks || "",
          grnDate: firstItem.item_grn_date
            ? formatDate(firstItem.item_grn_date)
            : "",
          warrantyExp: firstItem.item_warranty_expiry
            ? formatDate(firstItem.item_warranty_expiry)
            : "",
          serviceStart: firstItem.item_service_start
            ? formatDate(firstItem.item_service_start)
            : "",
          serviceEnd: firstItem.item_service_end
            ? formatDate(firstItem.item_service_end)
            : "",
          salvageValue: firstItem.item_salvage_value || "",
          replicate: firstItem.item_replicate || false,
        };

        setFormData((prev) => ({
          ...prev,
          ...formUpdates,
        }));
      }

      console.log(
        `Loaded ${summaryInfo.totalItems} items with ${summaryInfo.totalDetails} details`
      );
    } catch (error) {
      console.error("Error fetching record by GRN No:", error);
      setDetails([]);
      setImages([]);
      setSummary(null);
      Swal.fire({
        icon: "error",
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch GRN details",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      return date.toISOString().split("T")[0];
    } catch (e) {
      return dateString.split("T")[0];
    }
  };

  const handleStatusChange = (id, type) => {
    setDetails((prevDetails) =>
      prevDetails.map((item) => {
        if (item.id === id) {
          const currentStatus = item.status || 0;
          if (type === "approve") {
            return { ...item, status: currentStatus === 1 ? 0 : 1 };
          } else if (type === "reject") {
            return { ...item, status: currentStatus === 0 ? 1 : 0 };
          }
        }
        return item;
      })
    );
  };

  const handleSelectAll = (type) => {
    setDetails((prev) =>
      prev.map((item) => ({
        ...item,
        status: type === "approve" ? 1 : 0,
      }))
    );
  };

  const allApproved =
    details.length > 0 && details.every((item) => item.status === 1);
  const allRejected =
    details.length > 0 && details.every((item) => item.status === 0);

  const handleApprove = async () => {
    try {
      console.log("Approving items with details:", details);

      // Create payload with itemGrnDetails containing status for each item
      const payloadDetails = details.map((item) => ({
        id: item.id, // This should be the ItemSerial from item_grn table
        status: Number(item.status),
        center: item.center,
        location: item.location,
        department: item.department,
        employee: item.employee,
        serial_no: item.serial_no,
        book_no_local_id: item.book_no_local_id,
        barcode_no: item.barcode_no,
      }));

      console.log("Sending payload:", {
        itemGrn: formData,
        itemGrnDetails: payloadDetails,
      });

      const response = await axios.post(
        "http://localhost:3000/api/item-grn-approve/approve",
        {
          itemGrn: formData,
          itemGrnDetails: payloadDetails,
        }
      );

      if (response.data.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          html: `
          <div>
            <p>${response.data.message}</p>
            ${
              response.data.first_item_code
                ? `<p><strong>Generated Item Codes:</strong> ${response.data.first_item_code} to ${response.data.last_item_code}</p>`
                : ""
            }
            <p><strong>Total Items Processed:</strong> ${
              response.data.processed_count
            }</p>
          </div>
        `,
          showConfirmButton: true,
          confirmButtonText: "OK",
        });

        handleReset();
      } else {
        throw new Error(response.data.message || "Approval failed");
      }
    } catch (error) {
      console.error("Error approving items:", error);
      Swal.fire({
        icon: "error",
        title: "Approval Failed",
        html: `
        <div>
          <p>${
            error.response?.data?.message ||
            error.message ||
            "Failed to approve items"
          }</p>
          ${
            error.response?.data?.sqlError
              ? `<p><small>SQL Error: ${error.response.data.sqlError}</small></p>`
              : ""
          }
        </div>
      `,
      });
    }
  };

  const isImageFile = (filePath) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(filePath);
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
    setDetails([]);
    setImages([]);
    setSummary(null);
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Items - GRN Approve</h1>

        {/* Summary Display */}
        {summary && (
          <div className="alert alert-info mb-3">
            <div className="d-flex justify-content-between align-items-center">
              <div>
                <strong>GRN: {summary.grnNo}</strong> -
                <span className="ms-2">Total Items: {summary.totalItems}</span>{" "}
                -
                <span className="ms-2">
                  Total Records: {summary.totalDetails}
                </span>
              </div>
              <div>
                <span className="badge bg-success me-2">
                  Selected: {details.filter((item) => item.status === 1).length}
                </span>
                <span className="badge bg-danger">
                  Rejected: {details.filter((item) => item.status === 0).length}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="fixed-asset-form">
          <div className="form-section">
            <h2 className="form-section-title">Item & Invoice Details</h2>
            <div className="paired-section">
              {/* LEFT COLUMN */}
              <div className="paired-column">
                {/* GRN No Dropdown */}
                <div className="form-group">
                  <label className="form-label">GRN No</label>
                  <Select
                    name="grnNo"
                    placeholder="Select GRN No"
                    value={
                      grnNo
                        .map((g) => ({ value: g, label: g }))
                        .find((option) => option.value === formData.grnNo) ||
                      null
                    }
                    onChange={(selected) =>
                      handleGrnChange(selected ? selected.value : "")
                    }
                    options={grnNo.map((g) => ({ value: g, label: g }))}
                    isSearchable
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Middle Category</label>
                  <input
                    className="form-control"
                    name="middleCategory"
                    value={formData.middleCategory}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Sub Category</label>
                  <input
                    className="form-control"
                    name="subCategory"
                    value={formData.subCategory}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Item Name</label>
                  <input
                    className="form-control"
                    name="itemName"
                    value={formData.itemName}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Receive Type</label>
                  <input
                    className="form-control"
                    name="receiveType"
                    value={formData.receiveType}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">PO Number</label>
                  <input
                    className="form-control"
                    name="p0No"
                    value={formData.p0No}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Brand</label>
                  <input
                    className="form-control"
                    name="brand"
                    value={formData.brand}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input
                    className="form-control"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Purchase Type</label>
                  <input
                    className="form-control"
                    name="purchaseType"
                    value={formData.receiveType}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                {/* Image / File Display */}
                <div className="form-group image-gallery">
                  <div className="image-wrapper">
                    {images.length > 0 ? (
                      images.map((file, index) => {
                        const fileUrl = `http://localhost:3000${file}`;
                        const isImage = isImageFile(file);
                        return (
                          <a
                            key={index}
                            href={fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="media-box"
                          >
                            {isImage ? (
                              <img
                                src={fileUrl}
                                alt={`Item ${index + 1}`}
                                className="media-image"
                              />
                            ) : (
                              <div className="media-file">
                                <span className="media-icon">📄</span>
                                <span className="media-text">
                                  View File {index + 1}
                                </span>
                              </div>
                            )}
                          </a>
                        );
                      })
                    ) : (
                      <div className="text-muted">No images available</div>
                    )}
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Manufacturer</label>
                  <input
                    className="form-control"
                    name="manufacturer"
                    value={formData.manufacturer}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Source</label>
                  <input
                    className="form-control"
                    name="source"
                    value={formData.source}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Service Start</label>
                  <input
                    type="date"
                    className="form-control"
                    name="serviceStart"
                    value={formData.serviceStart}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="paired-column">
                <div className="form-group">
                  <label className="form-label">GRN Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="grnDate"
                    value={formData.grnDate}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Supplier</label>
                  <input
                    className="form-control"
                    name="supplier"
                    value={formData.supplier}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Qty</label>
                  <input
                    type="number"
                    className="form-control"
                    name="qty"
                    value={formData.qty}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Invoice No</label>
                  <input
                    className="form-control"
                    name="invoiceNo"
                    value={formData.invoiceNo}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Unit Price</label>
                  <input
                    type="number"
                    className="form-control"
                    name="unitPrice"
                    value={formData.unitPrice}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Inv Total</label>
                  <input
                    type="number"
                    className="form-control"
                    name="invTotal"
                    value={formData.invTotal}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Type</label>
                  <input
                    className="form-control"
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Warranty Expiry</label>
                  <input
                    type="date"
                    className="form-control"
                    name="warrantyExp"
                    value={formData.warrantyExp}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Service End</label>
                  <input
                    type="date"
                    className="form-control"
                    name="serviceEnd"
                    value={formData.serviceEnd}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Salvage Value</label>
                  <input
                    type="number"
                    className="form-control"
                    name="salvageValue"
                    value={formData.salvageValue}
                    onChange={handleChange}
                    readOnly
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Remarks</label>
                  <textarea
                    className="form-textarea"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-actions-section w-full p-4">
          <div className="table-responsive">
            <table className="table table-bordered table-hover w-100">
              <thead className="bg-blue">
                <tr>
                  <th className="text-white">No</th>
                  <th className="text-white">Center</th>
                  <th className="text-white">Location</th>
                  <th className="text-white">Department</th>
                  <th className="text-white">Employee</th>
                  <th className="text-white">Serial No</th>
                  <th className="text-white">Book No / Local ID</th>
                  <th className="text-white">Item Name</th>
                  <th className="text-white">
                    <div className="d-flex flex-wrap align-items-center justify-content-start gap-2">
                      Approve
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={allApproved}
                        onChange={(e) => handleSelectAll("approve")}
                      />
                    </div>
                  </th>
                  <th className="text-white">
                    <div className="d-flex flex-wrap align-items-center justify-content-start gap-2">
                      Reject
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={allRejected}
                        onChange={(e) => handleSelectAll("reject")}
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {details.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="text-center">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  details.map((item, index) => (
                    <tr key={item.id || index}>
                      <td>{index + 1}</td>
                      <td>{item.center_name || item.center || "-"}</td>
                      <td>{item.location_name || item.location || "-"}</td>
                      <td>{item.department_name || item.department || "-"}</td>
                      <td>{item.employee_name || item.employee || "-"}</td>
                      <td>{item.serial_no || "-"}</td>
                      <td>{item.book_no_local_id || "-"}</td>
                      <td>{item.item_name || "-"}</td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={item.status === 1}
                          onChange={() =>
                            handleStatusChange(item.id, "approve")
                          }
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={item.status === 0}
                          onChange={() => handleStatusChange(item.id, "reject")}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Action Buttons */}
          <div className="d-flex justify-content-center gap-2 mt-3">
            <button
              className="button button-submit"
              onClick={handleApprove}
              type="button"
              disabled={details.length === 0}
            >
              Approve Selected (
              {details.filter((item) => item.status === 1).length})
            </button>
            <button
              className="button button-cancel"
              type="button"
              onClick={handleReset}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItemGrnApprove;
