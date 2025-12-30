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

  useEffect(() => {
    console.log("Component mounted. Fetching GRN No...");

    const fetchGrnNo = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/item-grn-approve/grn-no"
        );

        console.log("Fetched GRN No:", response.data.data);

        // example response: { grnNo: "GRN-00023" }
        setGrnNo(response.data.data);
      } catch (error) {
        console.error("Error fetching GRN No:", error);
      }
    };

    fetchGrnNo();
  }, []);


  const images = [
    "https://picsum.photos/600/400?random=1",
    "https://picsum.photos/600/400?random=2",
    "https://picsum.photos/600/400?random=3",
    "https://picsum.photos/600/400?random=4",
    "https://picsum.photos/600/400?random=5",
    "https://picsum.photos/600/400?random=6"
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (name === "grnNo" && value) {
        // fetch records
        fetchRecordByGrnNo(value);
    }
  };

  const fetchRecordByGrnNo = async (grnNo) => {
    console.log("Fetching record for GRN No:", grnNo);
    try {
      const response = await axios.get(
        `http://localhost:3000/api/item-grn-approve/${grnNo}`
      );

      console.log("Fetched Record:", response.data.data);

      const record = response.data.data[0]; // get the first object from array
      if (!record) return;

      setFormData((prev) => ({
        ...prev,
        middleCategory: record.middle_category || "",
        subCategory: record.sub_category || "",
        itemName: record.item_name || "",
        p0No: record.po_no || "",
        brand: record.brand || "",
        model: record.model || "",
        supplier: record.supplier || "",
        qty: record.qty || "",
        date: record.date ? record.date.split("T")[0] : "",
        invoiceNo: record.invoice_no || "",
        unitPrice: record.unit_price || "",
        invTotal: record.inv_total || "",
        manufacturer: record.manufacturer || "",
        type: record.type || "",
        source: record.source || "",
        receiveType: record.receive_type || "",
        remarks: record.remarks || "",
        grnDate: record.grn_date ? record.grn_date.split("T")[0] : "",
        grnNo: record.grn_no || "",
        warrantyExp: record.warranty_expiry ? record.warranty_expiry.split("T")[0] : "",
        serviceStart: record.service_start ? record.service_start.split("T")[0] : "",
        serviceEnd: record.service_end ? record.service_end.split("T")[0] : "",
        salvageValue: record.salvage_value || "",
      }));
    } catch (error) {
      console.error("Error fetching record by GRN No:", error);
    }   
  };
  // Function called when dropdown changes
  const handleGrnChange = async (grnNo) => {
    // update formData with selected GRN number
    setFormData((prev) => ({
      ...prev,
      grnNo: grnNo,
    }));

    if (!grnNo) return;

    try {
      const response = await axios.get(
        `http://localhost:3000/api/item-grn-approve/${grnNo}`
      );

      const record = response.data.data[0]; // backend returns array
      console.log("Fetched Record for GRN Change:", record);
      if (!record) return;
      console.log("Fetched Record for GRN Change:", record);
      console.log("Record Date:", record.details);
      setDetails(record.details || []);
      setFormData((prev) => ({
        ...prev,
        middleCategory: record.middle_category || "",
        subCategory: record.sub_category || "",
        itemName: record.item_name || "",
        p0No: record.po_no || "",
        brand: record.brand || "",
        model: record.model || "",
        supplier: record.supplier || "",
        qty: record.qty || "",
        date: record.date ? record.date.split("T")[0] : "",
        invoiceNo: record.invoice_no || "",
        unitPrice: record.unit_price || "",
        invTotal: record.inv_total || "",
        manufacturer: record.manufacturer || "",
        type: record.type || "",
        source: record.source || "",
        receiveType: record.receive_type || "",
        remarks: record.remarks || "",
        grnDate: record.grn_date ? record.grn_date.split("T")[0] : "",
        warrantyExp: record.warranty_expiry ? record.warranty_expiry.split("T")[0] : "",
        serviceStart: record.service_start ? record.service_start.split("T")[0] : "",
        serviceEnd: record.service_end ? record.service_end.split("T")[0] : "",
        salvageValue: record.salvage_value || "",
        createdAt: record.created_at || "",
        updatedAt: record.updated_at || "",
      }));
    } catch (error) {
      console.error("Error fetching record by GRN No:", error);
    }
  };



  // Handle checkbox change
  const handleStatusChange = (itemId, type) => {
    setDetails((prevDetails) =>
      prevDetails.map((item) => {
        if (item.id === itemId) {
          if (type === 'approve') {
            return { ...item, status: item.status === 1 ? 0 : 1 }; // toggle approve
          } else if (type === 'reject') {
            return { ...item, status: item.status === 0 ? 1 : 0 }; // toggle reject
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
      status: type === 'approve' ? 1 : 0
    }))
  );
};


   // 🔹 ADD THESE HERE
  const allApproved =
    details.length > 0 && details.every(item => item.status === 1);

  const allRejected =
    details.length > 0 && details.every(item => item.status === 0);

  const handleFileChange = (e, fieldName) => {
    if (e.target.files.length > 0) {
      setFormData((prev) => ({
        ...prev,
        [fieldName]: e.target.files[0].name,
      }));
    }
  };


  const handleApprove = async (details) => {
    try {
      console.log("Approving items with details:", details);
      const approvedItems = details.filter(item => item.status === 1);
      const rehectedItems = details.filter(item => item.status === 0);
      if (approvedItems.length === 0 & rehectedItems.length === 0) {
        Swal.fire({
          icon: 'warning',
          title: 'No items selected for approval or rejection',
          text: 'Please select at least one item to approve.',
        });
        return;
      }

      await axios.post("http://localhost:3000/api/item-grn-approve/approve", 
        { itemGrn: formData, itemGrnDetails: details }
      );

      Swal.fire({
        icon: "success",
        title: "Items approved successfully",
        showConfirmButton: false,
        timer: 1500,
      });
      
    } catch (error) {
      console.error("Error approving items:", error);
    }
  }

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

                  {/* Image Display */}
                  <div className="form-group image-gallery">
                      <div className="image-wrapper">
                          {images && images.length > 0 && (
                          images.map((img, index) => (
                              <img
                              key={index}
                              src={img} // or img.path depending on your data
                              alt={`Item Image ${index + 1}`}
                              className="gallery-image"
                              />
                          ))
                          )}
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
                      <td>{item.center_name || '-'}</td>
                      <td>{item.location_name || '-'}</td>
                      <td>{item.department || '-'}</td>
                      <td>{item.employee || '-'}</td>
                      <td>{item.serial_no || '-'}</td>
                      <td>{item.book_no_local_id || '-'}</td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={item.status === 1}
                          onChange={() => handleStatusChange(item.id, 'approve')}
                        />
                      </td>
                      <td className="text-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={item.status === 0}
                          onChange={() => handleStatusChange(item.id, 'reject')}
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
              <button className="button button-cancel" type="button">
                Cancel
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default ItemGrnApprove;
