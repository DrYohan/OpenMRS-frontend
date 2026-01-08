import React, { useEffect, useState, useCallback, useMemo } from "react";
import "../../css/pages.css";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import { FiFileText, FiX  } from "react-icons/fi";
const API_BASE_URL = "http://localhost:3000/api";

const methodOptions = [
  { label: "Method 1", value: "Method 1" },
  { label: "Method 2", value: "Method 2" },
  { label: "Method 3", value: "Method 3" },
];
const voteNoOptions = [
  { value: "VOTE001", label: "Vote 001" },
  { value: "VOTE002", label: "Vote 002" },
  { value: "VOTE003", label: "Vote 003" },
  { value: "VOTE004", label: "Vote 004" },
  { value: "VOTE005", label: "Vote 005" },
];
const statusOptions = [
  { value: "status1", label: "status1" },
  { value: "status2", label: "status2" },
];
// initial form state 
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
  status: "",
  boundryDetails: "",
  areaHectare: "",
  areaAcre: "",
  areaPerch: "",
  destrict: "",
  divisionalSec: "",
  gnDivision: "",
  notUseArea: "",
};

// initail file state
const INITIAL_FILE_STATE = {
  file: null,
  preview: null,
  isExisting: false,
  serverPath: "",
};

const LandDetails = () => {
    const [formData, setFormData] = useState(INITIAL_FORM_STATE)
    const [files, setFiles] = useState([{INITIAL_FILE_STATE}]);
    const [updateState, setUpdateState] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stationOptions, setStationOptions] = useState([]);
    const [landId, setlandId] = useState([]);
    const [objectUrls, setObjectUrls] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);


    // fetch stations
    useEffect(() => {
      const fetchStations = async () => {
        try {
          const response = await axios.get("http://localhost:3000/api/station")
          setStationOptions(response.data.data.map(d =>({
            value: d.station_id,
            label: d.station_name
          })));
        } catch (error) {
          console.error("Error in fetching stations", error);
          showError("Failed to load stations");
        }
      }
      fetchStations();
    }, [])


    // Clean up object URLs on unmount
    useEffect(() => {
      return () => {
        objectUrls.forEach(url => URL.revokeObjectURL(url));
      };
    }, [objectUrls]);

    // fetch all land ids
    const fetchAllLandId = useCallback(async ()=>{
      try {
        const response = await axios.get(`${API_BASE_URL}/land/landId`);
        const ids = response.data.data.map((item) => item.land_id);
        setlandId(ids);
      } catch (error) {
        console.error("Error fetching land IDs", error);
        showError("Failed to load land IDs");
      }
    }, [])

    const fetchDataById = async (landId) => {
      if (!landId) return;
      setIsLoading(true);

      try {
        const response = await axios.get(`${API_BASE_URL}/land/${landId}`);
        console.log("landId response",  response.data.data[0])
        const data = response.data.data[0];

        setFormData(prev => ({
          ...prev,
          station: data.station || "",
          landId: data.land_id || "",
          landName: data.land_name || "",
          landDescription: data.land_description || "",
          surveyorId: data.surveyor_id || "",
          surveyorName: data.surveyor_name || "",
          purchasedDate: data.purchased_date ? new Date(data.purchased_date).toISOString().slice(0, 10) : "",
          price: data.price || "",
          method: data.method || "",
          voteNo: data.vote_no || "",
          deedNo: data.deed_no || "",
          lawyerName: data.lawyer_name || "",
          registeredDate: data.registered_date ? new Date(data.registered_date).toISOString().slice(0, 10) : "",
          status: data.status || "",
          boundryDetails: data.boundary_details || "",
          areaHectare: data.area_hectare || "",
          areaAcre: data.area_acre || "",
          areaPerch: data.area_perch || "",
          destrict: data.district || "",
          divisionalSec: data.divisional_sec || "",
          gnDivision: data.gn_division || "",
          notUseArea: data.not_use_area || "",
          buildingImages: data.land_image || "",
          deedCopyFile: data.deed_copy || null 
        }));


        const landImages = data.land_image
        ? data.land_image.split("@@@").map((path) => ({
                file: null,          // new upload is empty
                preview: null,
                isExisting: true,    // mark as existing
                serverPath: path,    // store path for future updates
              }))
            : [{ file: null, preview: null, isExisting: false, serverPath: "" }];
            setFiles(landImages);
            const previews = landImages.map(f => f.serverPath ? `http://localhost:3000/${f.serverPath}` : null);
            setFilePreviews(previews);
      } catch (error) {
        console.error("Error fetching land data:", error);
        showError("Failed to load land details");
      } finally {
        setIsLoading(false);
      }

    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
        ...prev,
        [name]: value
        }));
    };

    // validate form
    const validateForm = useCallback(() => {
      const requiredFields = ["station", "landId", "landName", "deedNo"];
      const missingFields = requiredFields.filter(
        (field) => !formData[field]?.trim()
      );

      if (missingFields.length > 0) {
        Swal.fire({
          title: "Missing Required Fields",
          text: `Please fill in: ${missingFields.join(", ")}`,
          icon: "warning",
        });
        return false;
      }
      return true;
    }, [formData]);


    const handleSave = async () => {
      if (!validateForm()) return;

      const result = await Swal.fire({
        title: "Are you sure?",
        text: updateState
          ? "Do you want to update this land details?"
          : "Do you want to submit this land details form?",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: updateState ? "Yes, update" : "Yes, submit",
        cancelButtonText: "Cancel",
      });
      if (!result.isConfirmed) return;

      setIsLoading(true);

      try {
        const formDataWithFile = new FormData();

        // append form data
        Object.keys(formData).forEach((key) => {
          if (
            formData[key] !== "" &&
            formData[key] !== null &&
            key !== "deedCopyFile"
          ) {
            formDataWithFile.append(key, formData[key]);
          }
        });


        // handle files
        const existingFiles = files.filter(f => f.isExisting);
        const newFiles = files.filter(f => !f.isExisting && f.file);

        existingFiles.forEach(f =>
          formDataWithFile.append("existingFiles", f.serverPath)
        );
        newFiles.forEach(f =>
          formDataWithFile.append("files", f.file)
        );

        if (formData.deedCopyFile instanceof File) {
          formDataWithFile.append("deedCopy", formData.deedCopyFile);
        } else if (updateState) {
          formDataWithFile.append("existingDeedCopy", formData.deedCopyFile || "");
        }


        // API call
        const endpoint = updateState
          ? `${API_BASE_URL}/land/${formData.landId}`
          : `${API_BASE_URL}/land/create`;

        const method = updateState ? "put" : "post";

        await axios[method](endpoint, formDataWithFile, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        await Swal.fire({
          title: "Success!",
          text: `Land form ${updateState ? "updated" : "submitted"} successfully.`,
          icon: "success",
          confirmButtonText: "OK",
        });
        clearForm();

      } catch (error) {
        console.error("Error saving land record", error);
        if (error.response?.status === 409) {
          await Swal.fire({
            title: "Duplicate Land ID",
            text: error.response.data.message || "Land ID already exists",
            icon: "warning",
            confirmButtonText: "OK",
          });
          return;
        }
        await Swal.fire({
          title: "Error",
          text: "Operation failed. Please try again.",
          icon: "error",
        });
      } finally {
        setIsLoading(false);
      }
    };


    const clearForm = () => {
      setFormData(INITIAL_FORM_STATE);
      setFiles([{ ...INITIAL_FILE_STATE }]);
      setUpdateState(false);
      objectUrls.forEach(url => URL.revokeObjectURL(url));
      setObjectUrls([]);
    }

    const handleLookup  = () => {
      setUpdateState(true);
    }
  
    useEffect(() => {
      if (!updateState) return;
      if (landId.length > 0) return;
      fetchAllLandId();
    }, [updateState, landId.length]);


    const handleCancel  = () => {
      clearForm();
    }

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

    const addMoreUploadFields = () => {
      //setFiles([...files, { file: null, preview: null, isExisting: false, serverPath: "" }]);
      setFiles(prev => [
        ...prev,
       { ...INITIAL_FILE_STATE }
      ]);
    };

    const removeFile = (index) => {
      setFiles(prev => {
        const newFiles = prev.filter((_, i) => i !== index);
        return newFiles.length ? newFiles : [{ ...INITIAL_FILE_STATE }];
      });
    };


/*     const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles.length ? newFiles : [{ file: null, preview: null, isExisting: false, serverPath: "" }]);
  };
 */


  // ==================== HELPER FUNCTIONS ====================
  const showError = (message) => {
    Swal.fire({
      title: "Error",
      text: message,
      icon: "error",
      confirmButtonText: "OK",
    });
  };



  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Assest Management System</h1>

        <div className="fixed-asset-form">
          <div className="form-section">
            <h2 className="form-section-title">Land Details</h2>

            <div className="form-grid">
              {/* Station Name */}
              <div className="form-group">
                <label className="form-label">
                  Station Name <span className="required">*</span>
                </label>
                  <Select
                    name="station"
                    placeholder="Select station"
                    options={stationOptions}
                    value={
                      stationOptions.find(
                        option => option.value === formData.station
                      ) || null
                    }
                    onChange={(selected) => {
                      setFormData(prev => ({
                        ...prev,
                        station: selected ? selected.value : null
                      }));
                    }}
                    isSearchable
                  />
              </div>

              {/* Land Id */}
              <div className="form-group">
                <label className="form-label">
                  Land Id <span className="required">*</span>
                </label>
                {updateState ? (
                <Select
                  options={landId.map(id => ({ value: id, label: id }))} // map fetched IDs to {value,label}
                  value={
                    landId
                      .map(id => ({ value: id, label: id }))
                      .find(opt => opt.value === formData.landId) || null
                  }
                  onChange={selected => {
                    console.log("selected", selected.value)
                    fetchDataById(selected.value);
                    setFormData(prev => ({
                      ...prev,
                      landId: selected ? selected.value : "",
                    }));
                  }}
                  placeholder="Select Land ID"
                  isClearable
                />

                  ) : (
                    <input
                      className="form-control"
                      id="landId"
                      name="landId"
                      value={formData.landId || ""}
                      onChange={handleChange}
                    />
                  )}
              </div>

              {/* Land Name */}
              <div className="form-group">
                <label className="form-label">
                  Land Name <span className="required">*</span>
                </label>
                <input
                  className="form-control"
                  name="landName"
                  value={formData.landName}
                  onChange={handleChange}
                 // disabled={isLoading}
                />
              </div>

              {/* land Description */}
              <div className="form-group">
                <label className="form-label">Land Description</label>
                <textarea
                    className="form-control"
                    id="landDescription"
                    name="landDescription"
                    value={formData.landDescription}
                    onChange={handleChange}
                    placeholder="Enter land description..."
                    rows={2}   
                />
              </div>

              {/* Surveyor Id */}
              <div className="form-group">
                <label className="form-label">Surveyor Id</label>
                <input
                  className="form-control"
                  name="surveyorId"
                  value={formData.surveyorId}
                  onChange={handleChange}
                //  disabled={isLoading}
                />
              </div>

              {/* Surveyor Name */}
              <div className="form-group">
                <label className="form-label">Surveyor Name</label>
                <input
                  className="form-control"
                  name="surveyorName"
                  value={formData.surveyorName}
                  onChange={handleChange}
                 // disabled={isLoading}
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
                //  disabled={isLoading}
                />
              </div>

              {/* Price */}
              <div className="form-group">
                <label className="form-label">Price</label>
                <input
                  type="number"
                  className="form-control"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                 // disabled={isLoading}
                />
              </div>

              {/* Method */}
              <div className="form-group">
                <label className="form-label">Method</label>
                  <Select
                    name="method"
                    placeholder="Select Method"
                    options={methodOptions}
                    value={
                      methodOptions.find(
                        option => option.value === formData.method
                      ) || null
                    }
                    onChange={(selected) => {
                      setFormData(prev => ({
                        ...prev,
                        method: selected ? selected.value : null
                      }))
                    }} 
                    isSearchable
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
                        option => option.value === formData.voteNo
                      ) || null
                    }
                    onChange={(selected) => {
                      setFormData(prev => ({
                        ...prev,
                        voteNo: selected ? selected.value : null
                      }))
                    }} 
                    isSearchable
                  />
              </div>
            </div>

                <div className="file-uploader-wrapper">
                  <label className="uploader-title">Upload Documents / Images</label>

                  <div className="uploader-row d-flex flex-wrap gap-3">
                    {files.map((fileObj, index) => (
                      <div
                        key={index}
                        className="uploader-column position-relative"
                        style={{ width: "120px" }}
                      >
                        <div
                          className="preview-box rounded border shadow-sm bg-light d-flex align-items-center justify-content-center border-dark"
                          style={{ width: "100%", height: "120px", overflow: "hidden" }}
                        >
                          {fileObj.file ? (
                            <img
                              src={URL.createObjectURL(fileObj.file)}
                              alt="preview"
                              className="preview-img"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : fileObj.isExisting && fileObj.serverPath ? (
                            <img
                              src={`http://localhost:3000/${fileObj.serverPath}`}
                              alt="preview"
                              className="preview-img"
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                          ) : (
                            <FiFileText size={32} className="placeholder-icon" />
                          )}

                          {!updateState && (fileObj.file || (fileObj.isExisting && fileObj.serverPath)) && (
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

                        {(fileObj.file || (fileObj.isExisting && fileObj.serverPath)) && (
                          <span className="file-name-display text-truncate" style={{ fontSize: "12px" }}>
                            {fileObj.file
                              ? fileObj.file.name
                              : fileObj.isExisting && fileObj.serverPath
                                ? fileObj.serverPath.split("/").pop()
                                : ""}
                          </span>
                        )}
                      </div>
                    ))}

                    {!updateState && 
                      <div className="d-flex align-items-center justify-content-center">
                        <button
                          type="button"
                          className=" btn-success rounded-circle d-flex align-items-center justify-content-center"
                          style={{ width: "30px", height: "30px" }}
                          onClick={addMoreUploadFields}
                        >
                          <i className="fas fa-plus"></i>
                        </button>
                      </div>}
                  </div>
                </div> 
          </div>

        <div className="fixed-asset-form">
          <div className="form-section">
            <h2 className="form-section-title">Deed Details</h2>

            <div className="form-grid">
              {/* Deed No */}
              <div className="form-group">
                <label className="form-label">
                  Deed No <span className="required">*</span>
                </label>
                <input
                  className="form-control"
                  name="deedNo"
                  value={formData.deedNo}
                  onChange={handleChange}
                  //disabled={isLoading}
                />
              </div>

              {/* Lawyer Name */}
              <div className="form-group">
                <label className="form-label">Lawyer Name</label>
                <input
                  className="form-control"
                  name="lawyerName"
                  value={formData.lawyerName}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>


              {/* Lawyer Name */}
              <div className="form-group">
                <label className="form-label">Registered Date</label>
                <input
                  type="date"
                  className="form-control"
                  name="registeredDate"
                  value={formData.registeredDate}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Status */}
              <div className="form-group">
                <label className="form-label">Status</label>

                <Select
                  className="react-select-container"
                  classNamePrefix="react-select"
                  options={statusOptions}
                  isSearchable={true}
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
                  isDisabled={isLoading}
                />
              </div>

              {/* Boundary Details + Area */}
              <div className="form-group full-width">
                <div className="two-column-row">
                  {/* Boundary Details */}
                  <div className="form-group">
                    <label className="form-label">Boundry Details</label>
                    <textarea
                      className="form-control"
                      name="boundryDetails"
                     value={formData.boundryDetails}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </div>

                  {/* Area */}
                  <div className="form-group">
                    <label className="form-label">Area</label>

                    <div className="d-flex gap-2">
                      <input
                        className="form-control"
                        type="number"
                        name="areaHectare"
                        value={formData.areaHectare}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Hec"
                      />
                      <input
                        className="form-control"
                        type="number"
                        name="areaAcre"
                        value={formData.areaAcre}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Acr"
                      />
                      <input
                        className="form-control"
                        type="number"
                        name="areaPerch"
                        value={formData.areaPerch}
                        onChange={handleChange}
                        disabled={isLoading}
                        placeholder="Pur"
                      />
                    </div>
                  </div>

                </div>
              </div>

              {/* Destrict */}
              <div className="form-group">
                <label className="form-label">Destrict</label>
                <input
                  className="form-control"
                  name="destrict"
                  value={formData.destrict}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Divisional Sec */}
              <div className="form-group">
                <label className="form-label">Divisional Sec</label>
                <input
                  className="form-control"
                  name="divisionalSec"
                  value={formData.divisionalSec}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* GN division */}
              <div className="form-group">
                <label className="form-label">GN Division</label>
                <input
                  type="text"
                  className="form-control"
                  name="gnDivision"
                  value={formData.gnDivision}
                  onChange={handleChange}
                  disabled={isLoading}
                />
              </div>

              {/* Not Use Area */}
              <div className="form-group">
                <label className="form-label">Not Use Area</label>
                <textarea
                    className="form-control"
                    id="notUseArea"
                    name="notUseArea"
                    value={formData.notUseArea}
                    onChange={handleChange}
                    placeholder="Enter land Not Use Area..."
                    rows={2}   
                />
              </div>

              {/* file */}
              <div className="form-group">
                <label className="form-label">Deed Copy</label>
                <input
                  type="file"
                    className="form-control"
                    id="deedCopy"
                    name="deedCopy"
                    onChange={(e) => setFormData(prev => ({
                    ...prev,
                    deedCopyFile: e.target.files[0]  // <-- store File object in state
                  }))}
                />

                {/* Existing file preview */}
  {updateState && formData.deedCopyFile && typeof formData.deedCopyFile === "string" && (
    <div className="mt-2">
      <a
        href={`http://localhost:3000/${formData.deedCopyFile}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        📄 View Existing Deed Copy
      </a>
    </div>
  )}
              </div>



            </div>
          </div>


        </div>

          {/* Actions */}
      
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
              >
                Cancel
              </button>
            </div>
         
        </div>
      </div>
    </div>
  )
}

export default LandDetails
