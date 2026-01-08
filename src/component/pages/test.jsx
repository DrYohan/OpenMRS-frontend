import React, { useEffect, useState, useCallback, useMemo, useRef } from "react";
import "../../css/pages.css";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import { FiFileText, FiX, FiUpload, FiCheck } from "react-icons/fi";

// ==================== CONSTANTS ====================
const API_BASE_URL = "http://localhost:3000/api";
const REQUIRED_FIELDS = ["station", "landId", "landName", "deedNo"];

const METHOD_OPTIONS = [
  { label: "Method 1", value: "Method 1" },
  { label: "Method 2", value: "Method 2" },
  { label: "Method 3", value: "Method 3" },
];

const VOTE_NO_OPTIONS = [
  { value: "VOTE001", label: "Vote 001" },
  { value: "VOTE002", label: "Vote 002" },
  { value: "VOTE003", label: "Vote 003" },
  { value: "VOTE004", label: "Vote 004" },
  { value: "VOTE005", label: "Vote 005" },
];

const STATUS_OPTIONS = [
  { value: "Active", label: "Active" },
  { value: "Inactive", label: "Inactive" },
  { value: "Pending", label: "Pending" },
];

const INITIAL_FORM_STATE = {
  station: "",
  landId: "",
  landName: "",
  landDescription: "",
  surveyorId: "",
  surveyorName: "",
  purchasedDate: "",
  price: "",
  method: "",
  voteNo: "",
  deedNo: "",
  lawyerName: "",
  registeredDate: "",
  status: "Active",
  boundryDetails: "",
  areaHectare: "",
  areaAcre: "",
  areaPerch: "",
  destrict: "",
  divisionalSec: "",
  gnDivision: "",
  notUseArea: "",
  deedCopyFile: null,
};

const INITIAL_FILE_STATE = {
  id: Date.now() + Math.random(),
  file: null,
  preview: null,
  isExisting: false,
  serverPath: "",
  name: "",
};

// ==================== SUB-COMPONENTS ====================
const LoadingSpinner = () => (
  <div className="loading-spinner">
    <div className="spinner-border text-primary" role="status">
      <span className="visually-hidden">Loading...</span>
    </div>
  </div>
);

const FormField = ({ label, required, children, error }) => (
  <div className="form-group">
    <label className="form-label">
      {label} {required && <span className="required">*</span>}
    </label>
    {children}
    {error && <div className="form-error">{error}</div>}
  </div>
);

const FilePreview = ({ file, onRemove, isBrowse }) => {
  if (!file) return null;

  const getPreviewContent = () => {
    if (file.preview && file.preview.startsWith('blob:')) {
      return <img src={file.preview} alt="preview" className="preview-img" />;
    }
    if (file.isExisting && file.serverPath) {
      return <img src={`${API_BASE_URL.replace('/api', '')}/${file.serverPath}`} alt="preview" className="preview-img" />;
    }
    if (file.file?.type?.startsWith('image/')) {
      return <img src={URL.createObjectURL(file.file)} alt="preview" className="preview-img" />;
    }
    return <FiFileText size={32} className="placeholder-icon" />;
  };

  const getFileName = () => {
    return file.file?.name || file.serverPath?.split('/').pop() || "Untitled";
  };

  return (
    <div className="uploader-column position-relative" style={{ width: "120px" }}>
      <div
        className="preview-box rounded border shadow-sm bg-light d-flex align-items-center justify-content-center"
        style={{ width: "100%", height: "120px", overflow: "hidden" }}
      >
        {getPreviewContent()}
        {!isBrowse && (file.file || file.isExisting) && (
          <button
            type="button"
            className="remove-btn position-absolute top-0 end-0 rounded-circle bg-danger text-white border-0"
            style={{
              width: "24px",
              height: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 10,
            }}
            onClick={() => onRemove(file.id)}
            aria-label="Remove file"
          >
            <FiX size={12} />
          </button>
        )}
      </div>
      <div className="upload-box mt-2">
        <label className="upload-label">
          <FiUpload size={14} />
          <span> Upload</span>
          <input
            type="file"
            className="hidden-input"
            onChange={(e) => {
              if (e.target.files[0]) {
                onRemove(file.id, e.target.files[0]);
              }
            }}
            accept="image/*,.pdf,.doc,.docx"
            aria-label={`Upload file for ${getFileName()}`}
          />
        </label>
      </div>
      <div className="file-name-display text-truncate mt-1" style={{ fontSize: "12px" }}>
        {getFileName()}
      </div>
    </div>
  );
};

// ==================== MAIN COMPONENT ====================
const LandDetails = () => {
  // ==================== STATE ====================
  const [formData, setFormData] = useState(INITIAL_FORM_STATE);
  const [files, setFiles] = useState([{ ...INITIAL_FILE_STATE }]);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [stationOptions, setStationOptions] = useState([]);
  const [landIdOptions, setLandIdOptions] = useState([]);
  const [formErrors, setFormErrors] = useState({});
  const [touchedFields, setTouchedFields] = useState({});
  const objectUrlsRef = useRef(new Set());

  // ==================== EFFECTS ====================
  useEffect(() => {
    fetchStations();
    return () => {
      // Clean up all object URLs
      objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
      objectUrlsRef.current.clear();
    };
  }, []);

  useEffect(() => {
    if (isUpdateMode && landIdOptions.length === 0) {
      fetchAllLandIds();
    }
  }, [isUpdateMode, landIdOptions.length]);

  // ==================== API FUNCTIONS ====================
  const fetchStations = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/station`);
      const options = response.data.data.map((d) => ({
        value: d.station_id,
        label: d.station_name,
      }));
      setStationOptions(options);
    } catch (error) {
      console.error("Error fetching stations:", error);
      showError("Failed to load stations");
    }
  };

  const fetchAllLandIds = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/land/landId`);
      const ids = response.data.data.map((item) => item.land_id);
      setLandIdOptions(ids);
    } catch (error) {
      console.error("Error fetching land IDs:", error);
      showError("Failed to load land IDs");
    }
  };

  const fetchDataById = async (landId) => {
    if (!landId) return;
    
    setIsLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/land/${landId}`);
      const data = response.data.data[0];
      
      const formattedData = {
        station: data.station || "",
        landId: data.land_id || "",
        landName: data.land_name || "",
        landDescription: data.land_description || "",
        surveyorId: data.surveyor_id || "",
        surveyorName: data.surveyor_name || "",
        purchasedDate: data.purchased_date 
          ? new Date(data.purchased_date).toISOString().slice(0, 10) 
          : "",
        price: data.price || "",
        method: data.method || "",
        voteNo: data.vote_no || "",
        deedNo: data.deed_no || "",
        lawyerName: data.lawyer_name || "",
        registeredDate: data.registered_date 
          ? new Date(data.registered_date).toISOString().slice(0, 10) 
          : "",
        status: data.status || "Active",
        boundryDetails: data.boundary_details || "",
        areaHectare: data.area_hectare || "",
        areaAcre: data.area_acre || "",
        areaPerch: data.area_perch || "",
        destrict: data.district || "",
        divisionalSec: data.divisional_sec || "",
        gnDivision: data.gn_division || "",
        notUseArea: data.not_use_area || "",
        deedCopyFile: data.deed_copy || null,
      };

      setFormData(formattedData);

      // Handle land images
      if (data.land_image) {
        const landImages = data.land_image.split("@@@").map((path) => ({
          id: Date.now() + Math.random(),
          file: null,
          preview: null,
          isExisting: true,
          serverPath: path.trim(),
          name: path.split('/').pop(),
        }));
        setFiles(landImages.length > 0 ? landImages : [{ ...INITIAL_FILE_STATE }]);
      } else {
        setFiles([{ ...INITIAL_FILE_STATE }]);
      }
    } catch (error) {
      console.error("Error fetching land data:", error);
      showError("Failed to load land details");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== FORM VALIDATION ====================
  const validateForm = useCallback(() => {
    const errors = {};
    
    REQUIRED_FIELDS.forEach(field => {
      if (!formData[field]?.toString().trim()) {
        errors[field] = "This field is required";
      }
    });

    if (formData.landId && !/^[A-Za-z0-9\-_]+$/.test(formData.landId)) {
      errors.landId = "Invalid Land ID format";
    }

    if (formData.price && (isNaN(formData.price) || Number(formData.price) < 0)) {
      errors.price = "Price must be a positive number";
    }

    if (formData.areaHectare && isNaN(formData.areaHectare)) {
      errors.areaHectare = "Must be a number";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  // ==================== EVENT HANDLERS ====================
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    // Clear error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [formErrors]);

  const handleSelectChange = useCallback((name, selected) => {
    setFormData(prev => ({
      ...prev,
      [name]: selected ? selected.value : "",
    }));
    setTouchedFields(prev => ({ ...prev, [name]: true }));
    
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: "" }));
    }
  }, [formErrors]);

  const handleFileChange = useCallback((fileId, newFile) => {
    if (!newFile) return;

    const objectUrl = URL.createObjectURL(newFile);
    objectUrlsRef.current.add(objectUrl);

    setFiles(prevFiles =>
      prevFiles.map(file =>
        file.id === fileId
          ? {
              ...file,
              file: newFile,
              preview: objectUrl,
              isExisting: false,
              serverPath: "",
              name: newFile.name,
            }
          : file
      )
    );
  }, []);

  const addFileField = useCallback(() => {
    setFiles(prev => [
      ...prev,
      {
        ...INITIAL_FILE_STATE,
        id: Date.now() + Math.random(),
      },
    ]);
  }, []);

  const removeFile = useCallback((fileId, replaceFile = null) => {
    setFiles(prevFiles => {
      const fileToRemove = prevFiles.find(f => f.id === fileId);
      
      // Clean up object URL
      if (fileToRemove?.preview && fileToRemove.preview.startsWith('blob:')) {
        URL.revokeObjectURL(fileToRemove.preview);
        objectUrlsRef.current.delete(fileToRemove.preview);
      }

      if (replaceFile) {
        // Replace the file
        return prevFiles.map(file =>
          file.id === fileId
            ? {
                ...INITIAL_FILE_STATE,
                id: Date.now() + Math.random(),
                file: replaceFile,
                preview: URL.createObjectURL(replaceFile),
                name: replaceFile.name,
              }
            : file
        );
      } else {
        // Remove the file
        const newFiles = prevFiles.filter(file => file.id !== fileId);
        return newFiles.length > 0 ? newFiles : [{ ...INITIAL_FILE_STATE }];
      }
    });
  }, []);

  const handleLookup = useCallback(() => {
    setIsUpdateMode(true);
    setFormData(prev => ({ ...prev, landId: "" }));
    setFiles([{ ...INITIAL_FILE_STATE }]);
  }, []);

  const handleCancel = useCallback(() => {
    Swal.fire({
      title: "Are you sure?",
      text: "All unsaved changes will be lost.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, clear form",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        clearForm();
      }
    });
  }, []);

  const clearForm = useCallback(() => {
    setFormData(INITIAL_FORM_STATE);
    setFiles([{ ...INITIAL_FILE_STATE }]);
    setIsUpdateMode(false);
    setFormErrors({});
    setTouchedFields({});
    
    // Clean up all object URLs
    objectUrlsRef.current.forEach(url => URL.revokeObjectURL(url));
    objectUrlsRef.current.clear();
  }, []);

  // ==================== FORM SUBMISSION ====================
  const handleSave = async () => {
    // Validate form
    if (!validateForm()) {
      Swal.fire({
        title: "Validation Error",
        text: "Please fix the errors in the form before submitting.",
        icon: "error",
      });
      return;
    }

    const result = await Swal.fire({
      title: "Are you sure?",
      text: isUpdateMode
        ? "Do you want to update this land details?"
        : "Do you want to submit this land details form?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isUpdateMode ? "Yes, update" : "Yes, submit",
      cancelButtonText: "Cancel",
      showLoaderOnConfirm: true,
      preConfirm: () => saveData(),
    });

    if (result.isConfirmed && result.value) {
      await Swal.fire({
        title: "Success!",
        text: `Land form ${isUpdateMode ? "updated" : "submitted"} successfully.`,
        icon: "success",
        confirmButtonText: "OK",
      });
      clearForm();
    }
  };

  const saveData = async () => {
    setIsLoading(true);
    try {
      const formDataToSend = new FormData();

      // Append form data
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "" && key !== "deedCopyFile") {
          formDataToSend.append(key, value);
        }
      });

      // Handle existing and new files
      const existingFiles = files.filter(f => f.isExisting);
      const newFiles = files.filter(f => !f.isExisting && f.file);

      existingFiles.forEach(f => {
        formDataToSend.append("existingFiles", f.serverPath);
      });

      newFiles.forEach(f => {
        formDataToSend.append("files", f.file);
      });

      // Handle deed copy file
      if (formData.deedCopyFile instanceof File) {
        formDataToSend.append("deedCopy", formData.deedCopyFile);
      } else if (isUpdateMode && formData.deedCopyFile) {
        formDataToSend.append("existingDeedCopy", formData.deedCopyFile);
      }

      // Make API call
      const endpoint = isUpdateMode
        ? `${API_BASE_URL}/land/${formData.landId}`
        : `${API_BASE_URL}/land/create`;

      const method = isUpdateMode ? "put" : "post";

      await axios[method](endpoint, formDataToSend, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return true;
    } catch (error) {
      console.error("Error saving land record:", error);
      
      if (error.response?.status === 409) {
        throw new Error("Land ID already exists. Please use a different ID.");
      }
      
      throw new Error("Failed to save land details. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // ==================== HELPER FUNCTIONS ====================
  const showError = (message) => {
    Swal.fire({
      title: "Error",
      text: message,
      icon: "error",
      confirmButtonText: "OK",
    });
  };

  // ==================== MEMOIZED VALUES ====================
  const selectedStation = useMemo(
    () => stationOptions.find(option => option.value === formData.station) || null,
    [stationOptions, formData.station]
  );

  const selectedLandId = useMemo(
    () => ({ value: formData.landId, label: formData.landId }),
    [formData.landId]
  );

  const landIdSelectOptions = useMemo(
    () => landIdOptions.map(id => ({ value: id, label: id })),
    [landIdOptions]
  );

  const selectedMethod = useMemo(
    () => METHOD_OPTIONS.find(option => option.value === formData.method) || null,
    [formData.method]
  );

  const selectedVoteNo = useMemo(
    () => VOTE_NO_OPTIONS.find(option => option.value === formData.voteNo) || null,
    [formData.voteNo]
  );

  const selectedStatus = useMemo(
    () => STATUS_OPTIONS.find(option => option.value === formData.status) || null,
    [formData.status]
  );

  // ==================== RENDER ====================
  if (isLoading && !isUpdateMode) {
    return <LoadingSpinner />;
  }

  return (
    <div className="page">
      <div className="container">
        <header className="page-header">
          <h1 className="title">Asset Management System</h1>
          <div className="page-subtitle">Land Details Management</div>
        </header>

        <div className="fixed-asset-form">
          {/* Land Details Section */}
          <section className="form-section">
            <div className="section-header">
              <h2 className="form-section-title">
                <FiCheck className="me-2" />
                Land Details
              </h2>
              <div className="section-actions">
                <span className="mode-badge">
                  {isUpdateMode ? "Update Mode" : "Create Mode"}
                </span>
              </div>
            </div>

            <div className="form-grid">
              {/* Station Name */}
              <FormField label="Station Name" required error={formErrors.station}>
                <Select
                  name="station"
                  placeholder="Select station"
                  options={stationOptions}
                  value={selectedStation}
                  onChange={(selected) => handleSelectChange("station", selected)}
                  isSearchable
                  isDisabled={isLoading}
                  className={`react-select ${formErrors.station ? "is-invalid" : ""}`}
                  classNamePrefix="select"
                />
              </FormField>

              {/* Land ID */}
              <FormField label="Land ID" required error={formErrors.landId}>
                {isUpdateMode ? (
                  <Select
                    options={landIdSelectOptions}
                    value={selectedLandId}
                    onChange={(selected) => {
                      if (selected) {
                        fetchDataById(selected.value);
                        handleSelectChange("landId", selected);
                      }
                    }}
                    placeholder="Select Land ID"
                    isSearchable
                    isDisabled={isLoading}
                    className={`react-select ${formErrors.landId ? "is-invalid" : ""}`}
                    classNamePrefix="select"
                  />
                ) : (
                  <input
                    className={`form-control ${formErrors.landId ? "is-invalid" : ""}`}
                    name="landId"
                    value={formData.landId}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="Enter Land ID"
                  />
                )}
              </FormField>

              {/* Land Name */}
              <FormField label="Land Name" required error={formErrors.landName}>
                <input
                  className={`form-control ${formErrors.landName ? "is-invalid" : ""}`}
                  name="landName"
                  value={formData.landName}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter land name"
                />
              </FormField>

              {/* Land Description */}
              <FormField label="Land Description">
                <textarea
                  className="form-control"
                  name="landDescription"
                  value={formData.landDescription}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter land description..."
                  rows={2}
                />
              </FormField>

              {/* Surveyor ID */}
              <FormField label="Surveyor ID">
                <input
                  className="form-control"
                  name="surveyorId"
                  value={formData.surveyorId}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter surveyor ID"
                />
              </FormField>

              {/* Surveyor Name */}
              <FormField label="Surveyor Name">
                <input
                  className="form-control"
                  name="surveyorName"
                  value={formData.surveyorName}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter surveyor name"
                />
              </FormField>

              {/* Purchased Date */}
              <FormField label="Purchased Date">
                <input
                  type="date"
                  className="form-control"
                  name="purchasedDate"
                  value={formData.purchasedDate}
                  onChange={handleChange}
                  disabled={isLoading}
                  max={new Date().toISOString().split('T')[0]}
                />
              </FormField>

              {/* Price */}
              <FormField label="Price" error={formErrors.price}>
                <div className="input-group">
                  <span className="input-group-text">$</span>
                  <input
                    type="number"
                    className={`form-control ${formErrors.price ? "is-invalid" : ""}`}
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    disabled={isLoading}
                    placeholder="0.00"
                    min="0"
                    step="0.01"
                  />
                </div>
              </FormField>

              {/* Method */}
              <FormField label="Method">
                <Select
                  name="method"
                  placeholder="Select Method"
                  options={METHOD_OPTIONS}
                  value={selectedMethod}
                  onChange={(selected) => handleSelectChange("method", selected)}
                  isSearchable
                  isDisabled={isLoading}
                  className="react-select"
                  classNamePrefix="select"
                />
              </FormField>

              {/* Vote No */}
              <FormField label="Vote No">
                <Select
                  name="voteNo"
                  placeholder="Select Vote No"
                  options={VOTE_NO_OPTIONS}
                  value={selectedVoteNo}
                  onChange={(selected) => handleSelectChange("voteNo", selected)}
                  isSearchable
                  isDisabled={isLoading}
                  className="react-select"
                  classNamePrefix="select"
                />
              </FormField>
            </div>

            {/* File Upload Section */}
            <div className="file-uploader-wrapper mt-4">
              <div className="uploader-header">
                <label className="uploader-title">
                  <FiUpload className="me-2" />
                  Upload Documents / Images
                </label>
                <div className="upload-count">
                  {files.filter(f => f.file || f.isExisting).length} file(s) attached
                </div>
              </div>

              <div className="uploader-row d-flex flex-wrap gap-3 align-items-start">
                {files.map((file) => (
                  <FilePreview
                    key={file.id}
                    file={file}
                    onRemove={removeFile}
                    isBrowse={false}
                  />
                ))}

                <div className="d-flex align-items-center justify-content-center">
                  <button
                    type="button"
                    className="btn btn-outline-success rounded-circle d-flex align-items-center justify-content-center"
                    style={{ width: "40px", height: "40px" }}
                    onClick={addFileField}
                    disabled={isLoading}
                    aria-label="Add more files"
                  >
                    <FiCheck size={20} />
                  </button>
                </div>
              </div>
              
              <div className="uploader-footer mt-2">
                <small className="text-muted">
                  Supported formats: JPG, PNG, PDF, DOC. Max size: 5MB per file.
                </small>
              </div>
            </div>
          </section>

          {/* Deed Details Section */}
          <section className="form-section mt-4">
            <h2 className="form-section-title">
              <FiCheck className="me-2" />
              Deed Details
            </h2>

            <div className="form-grid">
              {/* Deed No */}
              <FormField label="Deed No" required error={formErrors.deedNo}>
                <input
                  className={`form-control ${formErrors.deedNo ? "is-invalid" : ""}`}
                  name="deedNo"
                  value={formData.deedNo}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter deed number"
                />
              </FormField>

              {/* Lawyer Name */}
              <FormField label="Lawyer Name">
                <input
                  className="form-control"
                  name="lawyerName"
                  value={formData.lawyerName}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter lawyer name"
                />
              </FormField>

              {/* Registered Date */}
              <FormField label="Registered Date">
                <input
                  type="date"
                  className="form-control"
                  name="registeredDate"
                  value={formData.registeredDate}
                  onChange={handleChange}
                  disabled={isLoading}
                  max={new Date().toISOString().split('T')[0]}
                />
              </FormField>

              {/* Status */}
              <FormField label="Status">
                <Select
                  options={STATUS_OPTIONS}
                  value={selectedStatus}
                  onChange={(selected) => handleSelectChange("status", selected)}
                  isSearchable
                  isDisabled={isLoading}
                  className="react-select"
                  classNamePrefix="select"
                />
              </FormField>

              {/* Boundary Details and Area */}
              <div className="form-group full-width">
                <div className="two-column-row">
                  <FormField label="Boundary Details">
                    <textarea
                      className="form-control"
                      name="boundryDetails"
                      value={formData.boundryDetails}
                      onChange={handleChange}
                      disabled={isLoading}
                      placeholder="Enter boundary details..."
                      rows={3}
                    />
                  </FormField>

                  <FormField label="Area">
                    <div className="area-inputs">
                      <div className="input-group mb-2">
                        <input
                          type="number"
                          className={`form-control ${formErrors.areaHectare ? "is-invalid" : ""}`}
                          name="areaHectare"
                          value={formData.areaHectare}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="Hectares"
                          step="0.01"
                          min="0"
                        />
                        <span className="input-group-text">Ha</span>
                      </div>
                      <div className="input-group mb-2">
                        <input
                          type="number"
                          className="form-control"
                          name="areaAcre"
                          value={formData.areaAcre}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="Acres"
                          step="0.01"
                          min="0"
                        />
                        <span className="input-group-text">Ac</span>
                      </div>
                      <div className="input-group">
                        <input
                          type="number"
                          className="form-control"
                          name="areaPerch"
                          value={formData.areaPerch}
                          onChange={handleChange}
                          disabled={isLoading}
                          placeholder="Perches"
                          step="0.01"
                          min="0"
                        />
                        <span className="input-group-text">P</span>
                      </div>
                    </div>
                  </FormField>
                </div>
              </div>

              {/* District */}
              <FormField label="District">
                <input
                  className="form-control"
                  name="destrict"
                  value={formData.destrict}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter district"
                />
              </FormField>

              {/* Divisional Sec */}
              <FormField label="Divisional Sec">
                <input
                  className="form-control"
                  name="divisionalSec"
                  value={formData.divisionalSec}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter divisional secretariat"
                />
              </FormField>

              {/* GN Division */}
              <FormField label="GN Division">
                <input
                  className="form-control"
                  name="gnDivision"
                  value={formData.gnDivision}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter GN division"
                />
              </FormField>

              {/* Not Use Area */}
              <FormField label="Not Use Area">
                <textarea
                  className="form-control"
                  name="notUseArea"
                  value={formData.notUseArea}
                  onChange={handleChange}
                  disabled={isLoading}
                  placeholder="Enter details of unused area..."
                  rows={2}
                />
              </FormField>

              {/* Deed Copy Upload */}
              <FormField label="Deed Copy">
                <div className="deed-upload-wrapper">
                  <input
                    type="file"
                    className="form-control"
                    id="deedCopy"
                    name="deedCopy"
                    onChange={(e) =>
                      setFormData(prev => ({
                        ...prev,
                        deedCopyFile: e.target.files[0],
                      }))
                    }
                    disabled={isLoading}
                    accept=".pdf,.doc,.docx"
                  />
                  
                  {formData.deedCopyFile && !(formData.deedCopyFile instanceof File) && (
                    <div className="existing-file mt-2">
                      <a
                        href={`${API_BASE_URL.replace('/api', '')}/${formData.deedCopyFile}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-sm btn-outline-primary"
                      >
                        <FiFileText className="me-1" />
                        View Existing Deed Copy
                      </a>
                    </div>
                  )}
                  
                  {formData.deedCopyFile instanceof File && (
                    <div className="new-file mt-2">
                      <span className="badge bg-info">
                        New file: {formData.deedCopyFile.name}
                      </span>
                    </div>
                  )}
                </div>
              </FormField>
            </div>
          </section>

          {/* Action Buttons */}
          <div className="action-buttons mt-4">
            <button
              className="button button-submit"
              type="button"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" />
                  {isUpdateMode ? "Updating..." : "Submitting..."}
                </>
              ) : (
                <>
                  <FiCheck className="me-2" />
                  {isUpdateMode ? "Update" : "Submit"}
                </>
              )}
            </button>

            <button
              className="button button-lookup"
              type="button"
              onClick={handleLookup}
              disabled={isLoading}
            >
              Look Up
            </button>

            <button
              className="button button-clear"
              type="button"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Clear Form
            </button>
          </div>
        </div>

        {/* Form Status Footer */}
        <div className="form-status-footer mt-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="form-stats">
              <span className="stat-item">
                Fields: {Object.keys(formData).length}
              </span>
              <span className="stat-item">
                Files: {files.filter(f => f.file || f.isExisting).length}
              </span>
              <span className="stat-item">
                Mode: {isUpdateMode ? "Update" : "Create"}
              </span>
            </div>
            <div className="required-note">
              <span className="required">*</span> Required fields
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandDetails;