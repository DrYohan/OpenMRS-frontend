import React, { useEffect, useState } from "react";
import "../../css/pages.css";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";

const ItemGrnApprove = () => {
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
  const [details, setDetails] = useState([])
  const [grnNo, setGrnNo] = useState([]);
  const [images, setImages] = useState([]);

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
    if (!grnNo) return;
    try {
      const response = await axios.get(
        `http://localhost:3000/api/item-grn-approve/${grnNo}`
      );
      const record = response.data.data; 
      setImages([
        record.Item1Pic,
        record.Item2Pic,
        record.Item3Pic,
        record.Item4Pic,
      ].filter(Boolean)); 
      if (!record) return;
      const qty =  record.itemDetails.length
      setDetails(record.itemDetails || []);
      setFormData((prev) => ({
        ...prev,
        middleCategory: record.MiddleCategory || "",
        subCategory: record.SubCategory || "",
        itemName: record.ItemName || "",
        p0No: record.PONo || "",
        brand: record.Brand || "",
        model: record.Model || "",
        supplier: record.Supplier || "",
        qty: qty || "", 
        date: record.CreatedAt ? record.CreatedAt.split("T")[0] : "",
        invoiceNo: record.InvoiceNo || "",
        unitPrice: record.UnitPrice || "",
        invTotal: record.InvoiceTotal || "",
        manufacturer: record.Manufacture || "",
        type: record.Type || "",
        source: record.Source || "",
        receiveType: record.PurchaseType || "",
        remarks: record.Remarks || "",
        grnDate: record.GRNdate ? record.GRNdate.split("T")[0] : "",
        warrantyExp: record.WarrantyExpireDate ? record.WarrantyExpireDate.split("T")[0] : "",
        serviceStart: record.ServiceAgreementStartDate ? record.ServiceAgreementStartDate.split("T")[0] : "",
        serviceEnd: record.ServiceAgreementEndDate ? record.ServiceAgreementEndDate.split("T")[0] : "",
        salvageValue: record.SalvageValue || "",
        createdAt: record.CreatedAt || "",
        updatedAt: record.UpdatedAt || "",
      }));
    } catch (error) {
      console.error("Error fetching record by GRN No:", error);
    }
  };

  const handleStatusChange = (ItemSerial, type) => {
    setDetails((prevDetails) =>
      prevDetails.map((item) => {
        if (item.ItemSerial === ItemSerial) {
          if (type === 'approve') {
            return { ...item, Status: item.Status === 1 ? 0 : 1 };
          } else if (type === 'reject') {
            return { ...item, Status: item.Status === 0 ? 1 : 0 }; 
          }
        }
        return item;
      })
    );
  };

  const handleSelectAll = (type) => {
    setDetails(prev =>
      prev.map(item => ({
        ...item,
        Status: type === 'approve' ? 1 : 0
      }))
    );
  };

  const allApproved =
    details.length > 0 && details.every(item => item.Status === 1);

  const allRejected =
    details.length > 0 && details.every(item => item.Status === 0);

  const handleApprove = async (details) => {
    try {
      console.log("Approving items with details:", details);
      const approvedItems = details.filter(item => item.Status === 1);
      const rehectedItems = details.filter(item => item.Status === 0);
      if (approvedItems.length === 0 & rehectedItems.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No items selected for approval or rejection',
          text: 'Please select at least one item to approve.',
        });
        return;
      }

      const payloadDetails = details.map(item => ({
        ItemSerial: item.ItemSerial,
        Status: Number(item.Status)
      }));


      console.log("payloadDetails", payloadDetails)


      await axios.post("http://localhost:3000/api/item-grn-approve/approve", 
        { itemGrn: formData, itemGrnDetails: payloadDetails }
      );

      Swal.fire({
        icon: "success",
        title: "Items approved successfully",
        showConfirmButton: false,
        timer: 1500,
      });

      handleReset();
      
    } catch (error) {
      console.error("Error approving items:", error);
    }
  }

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
    setDetails([]);
    setImages([]);
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Items - GRN Approve </h1>

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
                              .map(g => ({ value: g, label: g }))
                              .find(option => option.value === formData.grnNo) || null
                          }
                          onChange={selected => handleGrnChange(selected ? selected.value : "")}
                          options={grnNo.map(g => ({ value: g, label: g }))}
                          isSearchable
                        />
                    </div>

                  <div className="form-group">
                      <label className="form-label">Middle Category</label>
                      <input className="form-control" name="middleCategory" value={formData.middleCategory} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                      <label className="form-label">Sub Category</label>
                      <input className="form-control" name="subCategory" value={formData.subCategory} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                      <label className="form-label">Item Name</label>
                      <input className="form-control" name="itemName" value={formData.itemName} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                      <label className="form-label">Receive Type</label>
                      <input className="form-control" name="receiveType" value={formData.receiveType} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                      <label className="form-label">PO Number</label>
                      <input className="form-control" name="p0No" value={formData.p0No} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                      <label className="form-label">Brand</label>
                      <input className="form-control" name="brand" value={formData.brand} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                      <label className="form-label">Model</label>
                      <input className="form-control" name="model" value={formData.model} onChange={handleChange} />
                  </div>
                  {/* corrct */}
                  <div className="form-group">
                      <label className="form-label"> Purchase Type</label>
                      <input className="form-control" name="model" value={formData.model} onChange={handleChange} />
                  </div>

                  {/* Image / File Display */}
                  <div className="form-group image-gallery">
                    <div className="image-wrapper">
                      {images && images.length > 0 &&
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
                                  <span className="media-text">View File {index + 1}</span>
                                </div>
                              )}
                            </a>
                          );
                        })}
                    </div>
                  </div>


                  <div className="form-group">
                      <label className="form-label">Manufacturer</label>
                      <input className="form-control" name="manufacturer" value={formData.manufacturer} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                      <label className="form-label">Source</label>
                      <input className="form-control" name="source" value={formData.source} onChange={handleChange} />
                  </div>

                  <div className="form-group">
                      <label className="form-label">Service Start</label>
                      <input type="date" className="form-control" name="serviceStart" value={formData.serviceStart} onChange={handleChange} />
                  </div>

                </div>

                {/* RIGHT COLUMN */}
                <div className="paired-column">

                <div className="form-group">
                    <label className="form-label">GRN Date</label>
                    <input type="date" className="form-control" name="grnDate" value={formData.grnDate} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label className="form-label">Supplier</label>
                    <input className="form-control" name="supplier" value={formData.supplier} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label className="form-label">Qty</label>
                    <input type="number" className="form-control" name="qty" value={formData.qty} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label className="form-label">Date</label>
                    <input type="date" className="form-control" name="date" value={formData.date} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label className="form-label">Invoice No</label>
                    <input className="form-control" name="invoiceNo" value={formData.invoiceNo} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label className="form-label">Unit Price</label>
                    <input type="number" className="form-control" name="unitPrice" value={formData.unitPrice} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label className="form-label">Inv Total</label>
                    <input type="number" className="form-control" name="invTotal" value={formData.invTotal} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label className="form-label">Type</label>
                    <input className="form-control" name="type" value={formData.type} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label className="form-label">Warranty Expiry</label>
                    <input type="date" className="form-control" name="warrantyExp" value={formData.warrantyExp} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label className="form-label">Service End</label>
                    <input type="date" className="form-control" name="serviceEnd" value={formData.serviceEnd} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label className="form-label">Salvage Value</label>
                    <input type="number" className="form-control" name="salvageValue" value={formData.salvageValue} onChange={handleChange} />
                </div>

                <div className="form-group">
                    <label className="form-label">Remarks</label>
                    <textarea className="form-textarea" name="remarks" value={formData.remarks} onChange={handleChange} />
                </div>

                </div>
            </div>
          </div>
        </div>

        <div className="form-actions-section w-full p-4">
            <div className="table-responsive">
              <table className="table table-bordered table-hover w-100">
                <thead className=" bg-blue">
                  <tr>
                    <th className="text-white">No</th>
                    <th className="text-white">Center</th>
                    <th className="text-white">Location</th>
                    <th className="text-white">Department</th>
                    <th className="text-white">Employee</th>
                    <th className="text-white">Serial No</th>
                    <th className="text-white">Book No / Local ID</th>
                    <th className="text-white">
                      <div className="d-flex flex-wrap align-items-center justify-content-start gap-2">
                        Approve
                        <input type="checkbox" 
                          className="form-check-input" 
                          checked={allApproved}
                          onChange={(e) => handleSelectAll('approve')}
                        />
                      </div>
                    </th>
                    <th className="text-white">
                      <div className="d-flex flex-wrap align-items-center justify-content-start gap-2">
                        Reject
                        <input type="checkbox" 
                          className="form-check-input" 
                          checked={allRejected}
                          onChange={(e) => handleSelectAll('reject')}
                        />
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {
                    details.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center">No records found.</td>
                      </tr>
                    ) :
             
                  details.map((item, index) => (
                    <tr key={index}>
                      <td>{index + 1}</td>
                      <td>{item.CenterName || '-'}</td>
                      <td>{item.LocationName || '-'}</td>
                      <td>{item.DepartmentName || '-'}</td>
                      <td>{item.EmployeeName || '-'}</td>
                      <td>{item.SerialNo || '-'}</td>
                      <td>{item.BookNo || '-'}</td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={item.Status === 1}
                          onChange={() => handleStatusChange(item.ItemSerial, 'approve')}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={item.Status === 0}
                          onChange={() => handleStatusChange(item.ItemSerial, 'reject')}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* Action Btn */}
            <div className="d-flex justify-content-center gap-2 mt-3">
              <button className="button button-submit" 
                onClick={()=>handleApprove(details)}
                type="button"
              >
                Approve
              </button>
              <button className="button button-cancel" 
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
