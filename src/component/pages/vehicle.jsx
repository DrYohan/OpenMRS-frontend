import React, { useEffect, useState } from "react";
import "../../css/pages.css";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import { FiFileText, FiX } from "react-icons/fi";

const Vehicle = () => {
  const [formData, setFormData] = useState({
    middleCategory: "",
    subCategory: "",
    registrationId: "",
    taxationClass: "",
    year: "",
    chasisNo: "",
    engineNo: "",
    color: "",
    seatingCapacity: "",
    cylinderCapacity: "",
    make: "",
    model: "",
    bodyType: "",
    weightUnlader: "",
    weightGross: "",
    height: "",
    length: "",
    horsePower: "",
    fuelType: "",
    licenceRenewal: "",
    insuranceRenewal: "",
    purchaseType: "",
    leasePeriodStartDate: "",
    leasePeriodEndDate: "",
    // purchased details
    supplier: "",
    invoiceNo: "",
    purchasedPrice: "",
    totalAmount: "",
    receiveType: "",
    purchasedDate: "",
    voteNo: "",
    remarks: "",
  });
  const [files, setFiles] = useState([
    { file: null, preview: null, isExisting: false, serverPath: "" },
  ]);
  const [filePreviews, setFilePreviews] = useState([null]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isBrowse, setIsBrowse] = useState(false);
  const [registrationIds, setRegistrationIds] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [middleCategoryOptions, setMiddleCategoryOptions] = useState([]);
  const [stationOptions, setStationOptions] = useState([]);
  const [subCategoryOptions, setSubCategoryOptions] = useState([]);
  const [vehicleId, setVehicleId] = useState(null);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedMiddleCategory, setSelectedMiddleCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);

  // fetch suppliers
  useEffect(() => {
    const fetchAllSuppliers = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/vehicle/names"
        );
        console.log("response", response.data.data);
        setSuppliers(response.data.data);
      } catch (error) {
        console.error("Error in fetching suppliers", error);
      }
    };
    fetchAllSuppliers();
  }, []);

  // fetch stations
  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/station");
        console.log("stations", response.data.data);
        setStationOptions(
          response.data.data.map((d) => ({
            value: d.station_id,
            label: d.station_name,
          }))
        );
      } catch (error) {
        console.error("Error in fetching stations", error);
      }
    };
    fetchStations();
  }, []);

  /*   useEffect(() => {
    const fetchMiddleCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/asset-categories/middle-categories")
        console.log("asset-categories", response.data.data)
        setMiddleCategoryOptions(response.data.data.map(d =>({
          value: d.middle_category_id,
          label: d.middle_category_name
        })));
      } catch (error) {
        console.error("Error in fetching suppliers", error);
      }
    }
    fetchMiddleCategories();
  }, [])
  useEffect(() => {
    const fetchSubCategories = async () => {
      try {
        const response = await axios.get("http://localhost:3000/api/asset-categories/sub-categories")
        console.log("sub-categories", response.data.data)
        setSubCategoryOptions(response.data.data.map(d =>({
          value: d.sub_category_id,
          label: d.sub_category_name
        }))); 
      } catch (error) {
        console.error("Error in fetching stations", error);
      }
    }
    fetchSubCategories();
  }, []) */

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      // Run both requests in parallel
      const [middleResponse, subResponse] = await Promise.all([
        axios.get(
          "http://localhost:3000/api/asset-categories/middle-categories"
        ),
        axios.get("http://localhost:3000/api/asset-categories/sub-categories"),
      ]);

      // Set middle categories
      console.log("Middle categories:", middleResponse.data.data);
      setMiddleCategoryOptions(
        middleResponse.data.data.map((d) => ({
          value: d.middle_category_id,
          label: d.middle_category_name,
        }))
      );

      // Set sub categories
      console.log("Sub categories:", subResponse.data.data);
      setSubCategoryOptions(
        subResponse.data.data.map((d) => ({
          value: d.sub_category_id,
          label: d.sub_category_name,
        }))
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // fetch all R_ID
  const fetchRegistrationId = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3000/api/vehicle/registrationId"
      );
      console.log("response regiatration ids ", response.data.data);
      setRegistrationIds(
        response.data.data.map((d) => ({
          value: d.registration_id,
          label: d.registration_id,
        }))
      );
    } catch (error) {
      console.error("Failed to fetch registration ids", error);
    }
  };

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFiles = [...files];
        newFiles[index] = {
          file,
          preview: reader.result,
          isExisting: false,
          serverPath: "",
        };
        setFiles(newFiles);
      };
      reader.readAsDataURL(file);
    }
  };
  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(
      newFiles.length
        ? newFiles
        : [{ file: null, preview: null, isExisting: false, serverPath: "" }]
    );
  };
  const addMoreUploadFields = () => {
    setFiles([
      ...files,
      { file: null, preview: null, isExisting: false, serverPath: "" },
    ]);
  };
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // clear form
  const clearForm = () => {
    setFormData({
      middleCategory: "",
      subCategory: "",
      registrationId: "",
      taxationClass: "",
      year: "",
      chasisNo: "",
      engineNo: "",
      color: "",
      seatingCapacity: "",
      cylinderCapacity: "",
      make: "",
      model: "",
      bodyType: "",
      weightUnlader: "",
      weightGross: "",
      height: "",
      length: "",
      horsePower: "",
      fuelType: "",
      licenceRenewal: "",
      insuranceRenewal: "",
      purchaseType: "",
      leasePeriodStartDate: "",
      leasePeriodEndDate: "",
      supplier: "",
      invoiceNo: "",
      purchasedPrice: "",
      totalAmount: "",
      receiveType: "",
      purchasedDate: "",
      voteNo: "",
      remarks: "",
    });
    setFiles([
      { file: null, preview: null, isExisting: false, serverPath: "" },
    ]);
    setFilePreviews([null]);
    setVehicleId(null);
  };

  // fetch data by R_ID
  const fetchVehicleByRegistrationId = async (registrationId) => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/vehicle/by-registration/${registrationId}`
      );
      console.log("response.data.data", response.data.data);
      const vehicle = response.data.data;
      setVehicleId(vehicle.id);
      console.log("response.data.data", response.data.data);
      // Fill the form
      setFormData((prev) => ({
        ...prev,
        station: vehicle.station || "",
        middleCategory: vehicle.middle_category || "",
        subCategory: vehicle.sub_category || "",
        registrationId: vehicle.registration_id,
        taxationClass: vehicle.taxation_class,
        year: vehicle.year ? Number(vehicle.year) : "",
        chasisNo: vehicle.chasis_no,
        engineNo: vehicle.engine_no,
        color: vehicle.color,
        seatingCapacity: vehicle.seating_capacity,
        cylinderCapacity: vehicle.cylinder_capacity,
        make: vehicle.make,
        model: vehicle.model,
        bodyType: vehicle.body_type,
        weightUnlader: vehicle.weight_unlader,
        weightGross: vehicle.weight_gross,
        height: vehicle.height,
        length: vehicle.length,
        horsePower: vehicle.horse_power,
        fuelType: vehicle.fuel_type,
        licenceRenewal: vehicle.licence_renewal,
        insuranceRenewal: vehicle.insurance_renewal,
        purchaseType: vehicle.purchase_type,
        leasePeriodStartDate: vehicle.lease_period_start_date
          ? vehicle.lease_period_start_date.split("T")[0]
          : "",
        leasePeriodEndDate: vehicle.lease_period_end_date
          ? vehicle.lease_period_end_date.split("T")[0]
          : "",
        supplier: vehicle.supplier,
        invoiceNo: vehicle.invoice_no,
        purchasedPrice: vehicle.purchased_price,
        totalAmount: vehicle.total_amount,
        receiveType: vehicle.receive_type,
        purchasedDate: vehicle.purchased_date
          ? vehicle.purchased_date.split("T")[0]
          : "",
        voteNo: vehicle.vote_no,
        remarks: vehicle.remarks,
      }));

      const vehicleFiles = vehicle.file
        ? vehicle.file.split("@@@").map((path) => ({
            file: null, // new upload is empty
            preview: null,
            isExisting: true, // mark as existing
            serverPath: path, // store path for future updates
          }))
        : [{ file: null, preview: null, isExisting: false, serverPath: "" }];

      setFiles(vehicleFiles);

      const previews = vehicleFiles.map((f) =>
        f.serverPath ? `http://localhost:3000/${f.serverPath}` : null
      );
      setFilePreviews(previews);
    } catch (error) {
      console.error("Failed to fetch vehicle data", error);
    }
  };

  // update
  const handleLookUp = () => {
    clearForm();
    setIsUpdate(true);
    fetchRegistrationId();
  };

  // browse
  const handleBrowse = () => {
    clearForm();
    setIsBrowse(true);
    setIsUpdate(false);
    setSelectedStation(null);
    setSelectedMiddleCategory(null);
    setSelectedSubCategory(null);
    setMiddleCategoryOptions([]);
    setSubCategoryOptions([]);
    setRegistrationIds([]);
  };

  // fetch middlecategories by Station
  useEffect(() => {
    if (isBrowse && selectedStation?.value) {
      fetchMiddleCategoriesByStation(selectedStation.value);
    }
  }, [isBrowse, selectedStation]);
  const fetchMiddleCategoriesByStation = async (stationId) => {
    try {
      console.log("stationId", stationId); // ST-005
      const response = await axios.get(
        `http://localhost:3000/api/vehicle/middle-categories/${stationId}`
      );
      console.log(
        "fetchMiddleCategoriesByStation response.data.data",
        response.data.data
      );
      setMiddleCategoryOptions(
        response.data.data.map((d) => ({
          value: d.middle_category,
          label: d.middle_category_name,
        }))
      );
    } catch (error) {
      console.error("Error fetching middle categories by station", error);
    }
  };

  // fetch sub categories by Middle categories
  useEffect(() => {
    if (isBrowse && selectedMiddleCategory?.value) {
      fetchSubCategoriesByMiddleCategories(selectedMiddleCategory.value);
    }
  }, [isBrowse, selectedMiddleCategory]);
  const fetchSubCategoriesByMiddleCategories = async (middleCategory) => {
    try {
      console.log("middleCategory", middleCategory); // ST-005
      const response = await axios.get(
        `http://localhost:3000/api/vehicle/sub-categories/${middleCategory}`
      );
      console.log("response.data.data sub-categories", response.data.data);
      setSubCategoryOptions(
        response.data.data.map((d) => ({
          value: d.sub_category,
          label: d.sub_category_name,
        }))
      );
    } catch (error) {
      console.error("Error fetching middle categories by station", error);
    }
  };

  // fetch R_ID by
  useEffect(() => {
    if (
      isBrowse &&
      selectedStation?.value &&
      selectedMiddleCategory?.value &&
      selectedSubCategory?.value
    ) {
      fetchRegistrationIdBySlectedValues(
        selectedStation?.value,
        selectedMiddleCategory.value,
        selectedSubCategory.value
      );
    }
  }, [isBrowse, selectedStation, selectedMiddleCategory, selectedSubCategory]);

  const fetchRegistrationIdBySlectedValues = async (
    station,
    middleCategory,
    subCategory
  ) => {
    try {
      console.log("middleCategory", middleCategory); // ST-005
      const response = await axios.get(
        `http://localhost:3000/api/vehicle/registrationId/${station}/${middleCategory}/${subCategory}`
      );
      console.log("response.data.data sub-categories", response.data.data);
      setRegistrationIds(
        response.data.data.map((d) => ({
          value: d.registration_id,
          label: d.registration_id,
        }))
      );
    } catch (error) {
      console.error("Error fetching middle categories by station", error);
    }
  };

  /*   const registrationOptions = registrationIds.map(id => ({
    value: id,
    label: id
  })); */
  const registrationOptions = registrationIds;

  const handleSubmit = async () => {
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to submit this vehicle form?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Yes, submit",
        cancelButtonText: "Cancel",
      });
      if (!result.isConfirmed) return;

      const requiredFields = [
        { key: "registrationId", label: "Registration ID" },
        { key: "chasisNo", label: "Chassis No" },
        { key: "engineNo", label: "Engine No" },
        { key: "model", label: "Model" },
        { key: "station", label: "Station" },
        { key: "middleCategory", label: "Middle Category" },
        { key: "supplier", label: "Supplier" },
        { key: "purchasedPrice", label: "Purchased Price" },
        { key: "supplier", label: "Supplier" },
      ];

      const missingField = requiredFields.find(
        (field) => !formData[field.key]?.toString().trim()
      );

      if (missingField) {
        Swal.fire({
          title: "Missing Required Field",
          text: `Please enter ${missingField.label}.`,
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      if (
        new Date(formData.leasePeriodStartDate) >
        new Date(formData.leasePeriodEndDate)
      ) {
        Swal.fire({
          title: "Error",
          text: `Lease Period Start date cannot be after End date.`,
          icon: "error",
          confirmButtonText: "OK",
        });
        return;
      }

      // Create FormData
      const formDataWithFile = new FormData();
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && formData[key] !== null) {
          formDataWithFile.append(key, formData[key]);
        }
      });
      // Separate existing and new files
      const existingFiles = files.filter((f) => f.isExisting);
      const newFiles = files.filter((f) => !f.isExisting && f.file);

      // Append existing files (server paths)
      existingFiles.forEach((f) => {
        formDataWithFile.append("existingFiles", f.serverPath);
      });

      // Append new files
      newFiles.forEach((f) => {
        formDataWithFile.append("files", f.file);
      });

      const allFileNames = files
        .map((f) =>
          f.isExisting ? f.serverPath.split("/").pop() : f.file?.name
        )
        .filter(Boolean)
        .join("@");
      formDataWithFile.append("filesNamesJoined", allFileNames);

      if (isUpdate) {
        await axios.put(
          `http://localhost:3000/api/vehicle/update/${vehicleId}`,
          formDataWithFile,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
        setIsUpdate(false);
      } else {
        await axios.post(
          "http://localhost:3000/api/vehicle/create",
          formDataWithFile,
          {
            headers: { "Content-Type": "multipart/form-data" },
          }
        );
      }
      Swal.fire({
        title: "Success!",
        text: `Vehicle form ${
          isUpdate ? "updated" : "submitted"
        } successfully.`,
        icon: "success",
        confirmButtonText: "OK",
      });
      // Reset form
      clearForm();
    } catch (error) {
      console.error("Error submitting vehicle form", error);
      const errorMsg =
        error.response?.data?.error || "Failed to submit vehicle form.";
      Swal.fire({
        title: "Error!",
        text: errorMsg,
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };

  const handleCancel = () => {
    clearForm();
    setIsUpdate(false);
    setIsBrowse(false);

    // reset browse-related selections
    setSelectedStation(null);
    setSelectedMiddleCategory(null);
    setSelectedSubCategory(null);

    // reset dependent dropdowns
    setMiddleCategoryOptions([]);
    setSubCategoryOptions([]);
    setRegistrationIds([]);
    fetchCategories();
  };

  const purchaseTypeOptions = [
    { value: "outreight", label: "outreight" },
    { value: "Oprational Lease", label: "Oprational Lease" },
    { value: "Finance Lease", label: "Donation" },
    { value: "Rent", label: "Rent" },
    { value: "Other", label: "Other (Please Specify)" },
  ];

  const fuelTypeOptions = [
    { value: "Petrol", label: "Petrol" },
    { value: "Diesel", label: "Diesel" },
    { value: "Hybrid", label: "Hybrid" },
    { value: "Electricity", label: "Electricity" },
  ];

  const startYear = 1996;
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from(
    { length: currentYear - startYear + 1 },
    (_, i) => {
      const year = startYear + i;
      return { value: year, label: year.toString() };
    }
  );

  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier.supplier_code,
    label: supplier.supplier_name,
  }));

  const receiveTypeOptions = [
    { value: "PURCHASE", label: "Purchase" },
    { value: "DONATION", label: "Donation" },
    { value: "TRANSFER", label: "Transfer" },
    { value: "LEASE", label: "Lease" },
  ];

  const voteNoOptions = [
    { value: "VOTE001", label: "Vote 001" },
    { value: "VOTE002", label: "Vote 002" },
    { value: "VOTE003", label: "Vote 003" },
    { value: "VOTE004", label: "Vote 004" },
    { value: "VOTE005", label: "Vote 005" },
  ];

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Asset Management System </h1>

        <div className="fixed-asset-form">
          <div className="form-section">
            <h2 className="form-section-title">Vehicle</h2>
            <div className="paired-section">
              {/* LEFT COLUMN */}
              <div className="paired-column">
                {/* Station Name Dropdown */}
                <div className="form-group">
                  <label className="form-label">Station Name</label>
                  <Select
                    name="station"
                    placeholder="Select station"
                    options={stationOptions}
                    value={
                      stationOptions.find(
                        (option) => option.value === formData.station
                      ) || null
                    }
                    onChange={(selected) => {
                      if (isBrowse) {
                        setSelectedStation(selected);
                      }
                      setFormData((prev) => ({
                        ...prev,
                        station: selected ? selected.value : null,
                      }));
                    }}
                    isSearchable
                  />
                </div>
                {/* Middle category */}
                <div className="form-group">
                  <label className="form-label">Middle Category</label>
                  <Select
                    name="middleCategory"
                    placeholder="Select Middle Category"
                    options={middleCategoryOptions}
                    isDisabled={isBrowse && !selectedStation}
                    value={
                      middleCategoryOptions.find(
                        (option) => option.value === formData.middleCategory
                      ) || null
                    }
                    onChange={(selected) => {
                      if (isBrowse) {
                        setSelectedMiddleCategory(selected);
                      }
                      setFormData((prev) => ({
                        ...prev,
                        middleCategory: selected ? selected.value : null,
                      }));
                    }}
                    isSearchable
                  />
                </div>
                {/* Sub category */}
                <div className="form-group">
                  <label className="form-label">Sub Category</label>
                  <Select
                    name="subCategory"
                    placeholder="Select Sub Category"
                    options={subCategoryOptions}
                    isDisabled={isBrowse && !selectedMiddleCategory}
                    value={
                      subCategoryOptions.find(
                        (option) => option.value === formData.subCategory
                      ) || null
                    }
                    onChange={(selected) => {
                      if (isBrowse) {
                        setSelectedSubCategory(selected);
                      }
                      setFormData((prev) => ({
                        ...prev,
                        subCategory: selected ? selected.value : null,
                      }));
                    }}
                    isSearchable
                  />
                </div>
                {/* Registration ID */}
                <div className="form-group">
                  <label className="form-label">Registration Id</label>
                  {isUpdate || isBrowse ? (
                    <Select
                      name="grnNo"
                      placeholder="Select Registration No"
                      options={registrationOptions}
                      value={
                        registrationOptions.find(
                          (opt) => opt.value === formData.registrationId
                        ) || null
                      }
                      onChange={(selected) => {
                        //const regId = selected ? selected.value : "";
                        const regId = selected?.value || "";
                        setFormData((prev) => ({
                          ...prev,
                          registrationId: regId,
                        }));

                        if (regId) {
                          fetchVehicleByRegistrationId(regId);
                        }
                      }}
                      isSearchable
                    />
                  ) : (
                    <input
                      className="form-control"
                      name="registrationId"
                      value={formData.registrationId}
                      onChange={handleChange}
                    />
                  )}
                </div>
                {/* Taxation class */}
                <div className="form-group">
                  <label className="form-label">Taxation Class</label>
                  <input
                    className="form-control"
                    name="taxationClass"
                    value={formData.taxationClass}
                    onChange={handleChange}
                  />
                </div>
                {/* Year */}
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <Select
                    name="year"
                    placeholder="Select Year"
                    options={yearOptions}
                    value={
                      yearOptions.find(
                        (option) => option.value === formData.year
                      ) || null
                    }
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        year: selected ? selected.value : null,
                      }))
                    }
                    isSearchable
                  />
                </div>
                {/* Chasis No */}
                <div className="form-group">
                  <label className="form-label">Chasis No</label>
                  <input
                    className="form-control"
                    name="chasisNo"
                    value={formData.chasisNo}
                    onChange={handleChange}
                  />
                </div>
                {/* Engin No */}
                <div className="form-group">
                  <label className="form-label">Engine No</label>
                  <input
                    className="form-control"
                    name="engineNo"
                    value={formData.engineNo}
                    onChange={handleChange}
                  />
                </div>
                {/* Color */}
                <div className="form-group">
                  <label className="form-label">Color</label>
                  <input
                    className="form-control"
                    name="color"
                    value={formData.color}
                    onChange={handleChange}
                  />
                </div>
                {/* Seating Capacity */}
                <div className="form-group">
                  <label className="form-label">Seating Capacity</label>
                  <input
                    type="number"
                    className="form-control"
                    name="seatingCapacity"
                    value={formData.seatingCapacity}
                    onChange={handleChange}
                  />
                </div>
                {/* Cylinder Capacity */}
                <div className="form-group">
                  <label className="form-label">Cylinder Capacity</label>
                  <input
                    type="number"
                    className="form-control"
                    name="cylinderCapacity"
                    value={formData.cylinderCapacity}
                    onChange={handleChange}
                  />
                </div>
                {/* Make */}
                <div className="form-group">
                  <label className="form-label">Make</label>
                  <input
                    type="text"
                    className="form-control"
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                  />
                </div>
                {/* Images */}
                <div className="file-uploader-wrapper">
                  <label className="uploader-title">
                    Upload Documents / Images
                  </label>

                  <div className="uploader-row d-flex flex-wrap gap-3">
                    {files.map((fileObj, index) => (
                      <div
                        key={index}
                        className="uploader-column position-relative"
                        style={{ width: "120px" }}
                      >
                        <div
                          className="preview-box rounded border shadow-sm bg-light d-flex align-items-center justify-content-center border-dark"
                          style={{
                            width: "100%",
                            height: "120px",
                            overflow: "hidden",
                          }}
                        >
                          {fileObj.file ? (
                            <img
                              src={URL.createObjectURL(fileObj.file)}
                              alt="preview"
                              className="preview-img"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : fileObj.isExisting && fileObj.serverPath ? (
                            <img
                              src={`http://localhost:3000/${fileObj.serverPath}`}
                              alt="preview"
                              className="preview-img"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          ) : (
                            <FiFileText
                              size={32}
                              className="placeholder-icon"
                            />
                          )}

                          {!isBrowse &&
                            (fileObj.file ||
                              (fileObj.isExisting && fileObj.serverPath)) && (
                              <button
                                type="button"
                                className="remove-btn position-absolute top-0 end-0 rounded-circle bg-danger text-white border-0"
                                style={{
                                  width: "24px",
                                  height: "24px",
                                  display: "flex",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                                onClick={() => removeFile(index)}
                              >
                                <FiX size={12} />
                              </button>
                            )}
                        </div>

                        <div className="upload-box mt-2">
                          <label>
                            Upload
                            <input
                              type="file"
                              className="hidden-input position-absolute top-0 start-0 w-100 h-100 opacity-0"
                              onChange={(e) => handleFileChange(e, index)}
                              accept="image/*"
                            />
                          </label>
                        </div>

                        {(fileObj.file ||
                          (fileObj.isExisting && fileObj.serverPath)) && (
                          <span
                            className="file-name-display text-truncate"
                            style={{ fontSize: "12px" }}
                          >
                            {fileObj.file
                              ? fileObj.file.name
                              : fileObj.isExisting && fileObj.serverPath
                              ? fileObj.serverPath.split("/").pop()
                              : ""}
                          </span>
                        )}
                      </div>
                    ))}

                    {/* Add More Button */}
                    {!isBrowse && (
                      <div className="d-flex align-items-center justify-content-center">
                        <button
                          type="button"
                          className=" btn-success rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "30px", height: "30px" }}
                          onClick={addMoreUploadFields}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN */}
              <div className="paired-column">
                {/* Model */}
                <div className="form-group">
                  <label className="form-label">Model</label>
                  <input
                    type="text"
                    className="form-control"
                    name="model"
                    value={formData.model}
                    onChange={handleChange}
                  />
                </div>
                {/* Body Type */}
                <div className="form-group">
                  <label className="form-label">Body Type</label>
                  <input
                    className="form-control"
                    name="bodyType"
                    value={formData.bodyType}
                    onChange={handleChange}
                  />
                </div>
                {/* Weight Unlader */}
                <div className="form-group">
                  <label className="form-label">Weight Unlader</label>
                  <input
                    type="number"
                    className="form-control"
                    name="weightUnlader"
                    value={formData.weightUnlader}
                    onChange={handleChange}
                  />
                </div>
                {/* Weight Gross */}
                <div className="form-group">
                  <label className="form-label">Weight Gross</label>
                  <input
                    type="number"
                    className="form-control"
                    name="weightGross"
                    value={formData.weightGross}
                    onChange={handleChange}
                  />
                </div>
                {/* Height */}
                <div className="form-group">
                  <label className="form-label">Height(m)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="height"
                    value={formData.height}
                    onChange={handleChange}
                  />
                </div>
                {/* Length */}
                <div className="form-group">
                  <label className="form-label">Length(m)</label>
                  <input
                    type="number"
                    className="form-control"
                    name="length"
                    value={formData.length}
                    onChange={handleChange}
                  />
                </div>
                {/* Horse Power */}
                <div className="form-group">
                  <label className="form-label">Horse Power</label>
                  <input
                    type="number"
                    className="form-control"
                    name="horsePower"
                    value={formData.horsePower}
                    onChange={handleChange}
                  />
                </div>
                {/* Fuel Type */}
                <div className="form-group">
                  <label className="form-label">Fuel Type</label>
                  <Select
                    name="fuelType"
                    placeholder="Select Fuel Type"
                    options={fuelTypeOptions}
                    value={
                      fuelTypeOptions.find(
                        (option) => option.value === formData.fuelType
                      ) || null
                    }
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        fuelType: selected ? selected.value : null,
                      }))
                    }
                    isSearchable
                  />
                </div>
                {/* Licence Renewal */}
                <div className="form-group">
                  <label className="form-label">Licence Renewal</label>
                  <input
                    type="text"
                    className="form-control"
                    name="licenceRenewal"
                    value={formData.licenceRenewal}
                    onChange={handleChange}
                  />
                </div>
                {/* Insurance Renewal */}
                <div className="form-group">
                  <label className="form-label">Insurance Renewal</label>
                  <input
                    type="text"
                    className="form-control"
                    name="insuranceRenewal"
                    value={formData.insuranceRenewal}
                    onChange={handleChange}
                  />
                </div>
                {/* Purchase Type*/}
                <div className="form-group">
                  <label className="form-label">Purchase Type</label>
                  <Select
                    name="purchaseType"
                    placeholder="Select Purchase Type"
                    options={purchaseTypeOptions}
                    value={
                      purchaseTypeOptions.find(
                        (option) => option.value === formData.purchaseType
                      ) || null
                    }
                    onChange={(selected) =>
                      setFormData((prev) => ({
                        ...prev,
                        purchaseType: selected ? selected.value : null,
                      }))
                    }
                    isSearchable
                  />
                </div>
                {/* Lease Period Start Date */}
                <div className="form-group">
                  <label className="form-label">Lease Period Start Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="leasePeriodStartDate"
                    value={formData.leasePeriodStartDate}
                    onChange={handleChange}
                  />
                </div>
                {/* Lease Period End Date */}
                <div className="form-group">
                  <label className="form-label">Lease Period End Date</label>
                  <input
                    type="date"
                    className="form-control"
                    name="leasePeriodEndDate"
                    value={formData.leasePeriodEndDate}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h2 className="form-section-title">Purchase Details</h2>
          <div className="paired-section">
            <div className="paired-column">
              {/* Supplier */}
              <div className="form-group">
                <label className="form-label">Supplier</label>
                <Select
                  name="supplier"
                  placeholder="Select station"
                  options={supplierOptions}
                  value={
                    supplierOptions.find(
                      (option) => option.value === formData.supplier
                    ) || null
                  }
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      supplier: selected ? selected.value : null,
                    }))
                  }
                  isSearchable
                />
              </div>
              {/* Invoice No */}
              <div className="form-group">
                <label className="form-label">Invoice No</label>
                <input
                  type="text"
                  className="form-control"
                  name="invoiceNo"
                  value={formData.invoiceNo}
                  onChange={handleChange}
                />
              </div>
              {/* Purchased Price */}
              <div className="form-group">
                <label className="form-label">Purchased Price</label>
                <input
                  type="number"
                  className="form-control"
                  name="purchasedPrice"
                  value={formData.purchasedPrice}
                  onChange={handleChange}
                />
              </div>
              {/* Total Amount */}
              <div className="form-group">
                <label className="form-label">Total Amount</label>
                <input
                  type="number"
                  className="form-control"
                  name="totalAmount"
                  value={formData.totalAmount}
                  onChange={handleChange}
                />
              </div>
            </div>
            <div className="paired-column">
              {/*  Receive Type */}
              <div className="form-group">
                <label className="form-label">Receive Type</label>
                <Select
                  name="receiveType"
                  placeholder="Select Receive Type"
                  options={receiveTypeOptions}
                  value={
                    receiveTypeOptions.find(
                      (option) => option.value === formData.receiveType
                    ) || null
                  }
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      receiveType: selected ? selected.value : null,
                    }))
                  }
                  isSearchable
                />
              </div>
              {/* Purchased Date */}
              <div className="form-group">
                <label className="form-label">Purchased Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="purchasedDate"
                  value={formData.purchasedDate}
                  onChange={handleChange}
                />
              </div>
              {/* Vote No */}
              <div className="form-group">
                <label className="form-label">Vote No</label>
                <Select
                  name="voteNo"
                  placeholder="Select Vote No"
                  options={voteNoOptions}
                  value={
                    voteNoOptions.find(
                      (option) => option.value === formData.voteNo
                    ) || null
                  }
                  onChange={(selected) =>
                    setFormData((prev) => ({
                      ...prev,
                      voteNo: selected ? selected.value : null,
                    }))
                  }
                  isSearchable
                />
              </div>
              {/*  Remarks */}
              <div className="form-group">
                <label className="form-label">Remarks</label>
                <textarea
                  className="form-textarea"
                  name="remarks"
                  value={formData.remarks}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Action Btn */}
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button
            className="button button-submit"
            type="button"
            disabled={isBrowse}
            onClick={handleSubmit}
          >
            {isUpdate ? "Update" : "Submit"}
          </button>
          <button
            className="button button-lookup"
            type="button"
            onClick={handleLookUp}
          >
            Look Up
          </button>

          <button
            className="button button-browse"
            type="button"
            onClick={handleBrowse}
          >
            Browse
          </button>

          <button
            className="button button-cancel"
            type="button"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default Vehicle;
