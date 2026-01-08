import React, { useEffect, useState } from "react";
import "../../css/pages.css";
import axios from "axios";
import Select from "react-select";
import Swal from "sweetalert2";
import { FiFileText, FiX } from "react-icons/fi";
const API_BASE_URL = "http://localhost:3000/api";


const BuildingDetails = () => {
    const [formData, setFormData] = useState({
        station: "",
        mainCategoryId: "",
        middleCategoryId: "",
        subCategoryId: "",
        landId: "",
        buildingId: "",
        buildingName: "",
        address: "",
        ratesNo: "",
        area: "",
        noOfFloors: "",
        value: "",
        benchMarks: "",
        comment: "",
    })

    const clearForm = () => {
        setFormData({
            station: "",
            mainCategoryId: "",
            middleCategoryId: "",
            subCategoryId: "",
            landId: "",
            buildingId: "",
            buildingName: "",
            address: "",
            ratesNo: "",
            area: "",
            noOfFloors: "",
            value: "",
            benchMarks: "",
            comment: "",
        })
        setFiles([{ file: null, preview: null, isExisting: false, serverPath: "" }]);
        setUpdateState(false);
    }
    const [files, setFiles] = useState([{ file: null, preview: null, isExisting: false, serverPath: "" }]);
    const [updateState, setUpdateState] = useState(false);
    const [isBrowse, setIsBrowse] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stationOptions, setStationOptions] = useState([]);
    const [landId, setlandId] = useState([]);
    const [buildingId, setBuildingId] = useState([]);
    const [filePreviews, setFilePreviews] = useState([]);

    const [mainCategoryOptions, setMainCategoryOptions] = useState([]);
    const [middleCategoryOptions, setMiddleCategoryOptions] = useState([]);
    const [subCategoryOptions, setSubCategoryOptions] = useState([]);

    // fetch stations
    useEffect(() => {
        const fetchStations = async () => {
            try {
                const response = await axios.get("http://localhost:3000/api/station")
                console.log("stations", response.data.data)
                setStationOptions(response.data.data.map(d => ({
                    value: d.station_id,
                    label: d.station_name
                })));
            } catch (error) {
                console.error("Error in fetching stations", error);
            }
        }
        fetchStations();
    }, [])

    useEffect(()=>{
      const fetchAllCategories = async () => {
        try {
          const [mainCategoryRes, middleCategoryRes, subCategoryRes] = await Promise.all([
            axios.get(`${API_BASE_URL}/asset-categories/main-categories`),
            axios.get(`${API_BASE_URL}/asset-categories/middle-categories`),
            axios.get(`${API_BASE_URL}/asset-categories/sub-categories`),
          ])

          console.log("mainCategoryRes", mainCategoryRes.data.data)
          setMainCategoryOptions(
            mainCategoryRes.data.data.map(d=>({
              value: d.id,
              label: d.category_name
            }))
          );
          setMiddleCategoryOptions(
            middleCategoryRes.data.data.map(d=>({
              value: d.id,
              label: d.middle_category_name
            }))
          );
          setSubCategoryOptions(
            subCategoryRes.data.data.map(d=>({
              value: d.id,
              label: d.sub_category_name
            }))
          );
        } catch (error) {
          console.error("Error fetching categories:", error);
          showError("Error fetching categories");
        }
      }
      fetchAllCategories();
    }, [])


    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSave = async () => {
        const result = await Swal.fire({
            title: "Are you sure?",
            text: updateState
                ? "Do you want to update this building details?"
                : "Do you want to submit this building details?",
            icon: "question",
            showCancelButton: true,
            confirmButtonText: updateState ? "Yes, update" : "Yes, submit",
            cancelButtonText: "Cancel",
        });

        if (!result.isConfirmed) return;

        try {
            setIsLoading(true);
            const formDataWithFile = new FormData();
            /* ---------- FORM FIELDS ---------- */
            Object.entries(formData).forEach(([key, value]) => {
                if (value !== "" && value !== null) {
                    formDataWithFile.append(key, value);
                }
            });
            /* ---------- FILES ---------- */
            const existingFiles = files.filter(f => f.isExisting);
            const newFiles = files.filter(f => !f.isExisting && f.file);
            // keep existing images
            existingFiles.forEach(f => {
                formDataWithFile.append("existingFiles", f.serverPath);
            });
            // upload new images
            newFiles.forEach(f => {
                formDataWithFile.append("buildingFiles", f.file);
            });
            /* ---------- DEBUG ---------- */
            console.log("---- FormData ----");
            for (let [key, value] of formDataWithFile.entries()) {
                console.log(key, value instanceof File ? value.name : value);
            }
            console.log("------------------");

            /* ---------- API CALL ---------- */
            console.log("---- FormData entries ----");
            for (let [key, value] of formDataWithFile.entries()) {
                if (value instanceof File) {
                    console.log(key, "File:", value.name);
                } else {
                    console.log(key, "Value:", value);
                }
            }
            console.log("--------------------------");

            if (updateState) {
                await axios.put(
                    `http://localhost:3000/api/building/${formData.buildingId}`,
                    formDataWithFile,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                Swal.fire("Updated!", "Building updated successfully.", "success");
            } else {
                await axios.post(
                    "http://localhost:3000/api/building/create",
                    formDataWithFile,
                    { headers: { "Content-Type": "multipart/form-data" } }
                );

                Swal.fire("Saved!", "Building saved successfully.", "success");
            }

            clearForm();
        } catch (error) {
            console.error("Error saving building", error);
                if (error.response?.status === 409) {
                  await Swal.fire({
                    title: "Duplicate Building ID",
                    text: error.response.data.message || "Building ID already exists",
                    icon: "warning",
                    confirmButtonText: "OK",
                  });
                  return;
                }
            Swal.fire("Error", "Operation failed", "error");
        } finally {
            setIsLoading(false);
        }
    };


    const fetchDataById = async (buildingId) => {
        try {
            console.log("Fetching building ID:", buildingId);
            const response = await axios.get(`http://localhost:3000/api/building/${buildingId}`);
            console.log("response.data.data[0]", response.data.data[0])
            const data = response.data.data[0];

            // Populate form fields
            setFormData({
                ...formData,
                station: data.station || "",
                mainCategoryId: data.main_category_id || "",
                middleCategoryId: data.middle_category_id || "",
                subCategoryId: data.sub_category_id || "",
                landId: data.land_id || "",
                buildingId: data.building_id || "",
                buildingName: data.building_name || "",
                address: data.address || "",
                ratesNo: data.rates_no || "",
                area: data.Area || "",
                noOfFloors: data.no_of_floors || "",
                value: data.value || "",
                benchMarks: data.bench_marks || "",
                comment: data.comment || "",
                status: data.status || ""
            });

            // Prepare building images
            const buildingImages = data.building_images
                ? data.building_images.split("@@@").map((path) => ({
                    file: null,
                    preview: null,
                    isExisting: true,
                    serverPath: path.replace(/\\/g, "/"), // <-- replace backslashes with forward slashes
                }))
                : [{ file: null, preview: null, isExisting: false, serverPath: "" }];


            setFiles(buildingImages);

            const previews = buildingImages.map(f => f.serverPath ? `http://localhost:3000/base_uploads${f.serverPath}` : null);
            setFilePreviews(previews);

        } catch (error) {
            console.error("Error fetching building data:", error);
        }
    };


    const handleLookup = () => {
        setUpdateState(true);
    }

      const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles.length ? newFiles : [{ file: null, preview: null, isExisting: false, serverPath: "" }]);
  };

    useEffect(() => {
        fetchAllLandId();
    }, []);


    useEffect(() => {
        fetchBuildingId();
    }, [updateState]);

    const fetchBuildingId = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/building/buildingid");
            console.log("responst building is", response.data.data);
            setBuildingId(response.data.data.map(item => item.building_id));
        } catch (error) {

        }

    }

    const fetchAllLandId = async () => {
        try {
            const response = await axios.get("http://localhost:3000/api/land/landId");
            console.log("responst land is", response.data.data);
            setlandId(response.data.data.map(item => item.land_id));
        } catch (error) {

        }

    }



    const handleCancel = () => {
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
        setFiles([...files, { file: null, preview: null, isExisting: false, serverPath: "" }]);
    };


    const methodOptions = [
        { label: "Method 1", value: "Method 1" },
        { label: "Method 2", value: "Method 2" },
        { label: "Method 3", value: "Method 3" },
    ];

    const statusOptions = [
        { value: "Use", label: "use" },
        { value: "Not Use", label: "Not Use" },

    ];


    const fetchBuildingIds = async (landId) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/building/buildingId/${landId}`);
            console.log("Fetched building IDs by landId:", response.data);

            const ids = response.data.data || [];
            setBuildingId(ids);

            // Clear buildingId in formData if the current one does not exist in the fetched IDs
            setFormData(prev => ({
                ...prev,
                buildingId: ids.includes(prev.buildingId) ? prev.buildingId : "" // clear if invalid
            }));
        } catch (error) {
            console.error("Error fetching building IDs", error);
            setBuildingId([]);
            setFormData(prev => ({ ...prev, buildingId: "" })); // clear invalid building
        }
    };





    return (
        <div className="page">
            <div className="container">
                <h1 className="title">Assest Management System</h1>

                <div className="fixed-asset-form">
                    <div className="form-section">
                        <h2 className="form-section-title">Building Details</h2>

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
                                        if (isBrowse) {
                                            setSelectedStation(selected);
                                        }
                                        setFormData(prev => ({
                                            ...prev,
                                            station: selected ? selected.value : null
                                        }));
                                    }}
                                    isSearchable
                                />
                            </div>


                            {/* Mian Category */}
                            <div className="form-group">
                                <label className="form-label">
                                Mian Category <span className="required">*</span>
                                </label>
                                <Select
                                    name="mainCategory"
                                    placeholder="Select Mian Category"
                                    options={mainCategoryOptions}
                                    value={
                                    mainCategoryOptions.find(
                                        option => option.value === formData.mainCategoryId
                                    ) || null
                                    }
                                    onChange={(selected) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        mainCategoryId: selected ? selected.value : null
                                    }));
                                    }}
                                    isSearchable
                                />
                            </div>

                            {/* Middle Category */}
                            <div className="form-group">
                                <label className="form-label">
                                Middle Category <span className="required">*</span>
                                </label>
                                <Select
                                    name="middleCategory"
                                    placeholder="Select Middle Category"
                                    options={middleCategoryOptions}
                                    value={
                                    middleCategoryOptions.find(
                                        option => option.value === formData.middleCategoryId
                                    ) || null
                                    }
                                    onChange={(selected) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        middleCategoryId: selected ? selected.value : null
                                    }));
                                    }}
                                    isSearchable
                                />
                            </div>


                            {/* Sub Category */}
                            <div className="form-group">
                                <label className="form-label">
                                Sub Category <span className="required">*</span>
                                </label>
                                <Select
                                    name="subCategory"
                                    placeholder="Select Sub Category"
                                    options={subCategoryOptions}
                                    value={
                                    subCategoryOptions.find(
                                        option => option.value === formData.subCategoryId
                                    ) || null
                                    }
                                    onChange={(selected) => {
                                    setFormData(prev => ({
                                        ...prev,
                                        subCategoryId: selected ? selected.value : null
                                    }));
                                    }}
                                    isSearchable
                                />
                            </div>


                            {/* Land Id */}
                            {/*               <div className="form-group">
                <label className="form-label">
                  Land Id <span className="required">*</span>
                </label>
                <Select
                  options={landId.map(id => ({ value: id, label: id }))} 
                  value={
                    landId
                      .map(id => ({ value: id, label: id }))
                      .find(opt => opt.value === formData.landId) || null
                  }
                  onChange={selected => {
                    if(updateState){
                        fetchBuildingIds(selected.value);
                    }
                    console.log("selected", selected.value)
                    setFormData(prev => ({
                      ...prev,
                      landId: selected ? selected.value : "",
                    }));
                  }}
                  placeholder="Select Land ID"
                  isClearable
                />
              </div> */}
                            {/* Land Id */}
                            <div className="form-group">
                                <label className="form-label">
                                    Land Id <span className="required">*</span>
                                </label>
                                <Select
                                    options={landId.map(id => ({ value: id, label: id }))}
                                    value={
                                        landId
                                            .map(id => ({ value: id, label: id }))
                                            .find(opt => opt.value === formData.landId) || null
                                    }
                                    onChange={selected => {
                                        const landValue = selected ? selected.value : "";
                                        setFormData(prev => ({ ...prev, landId: landValue }));

                                        if (updateState && landValue) {
                                            fetchBuildingIds(landValue); // fetch buildings for selected land
                                            setFormData(prev => ({
                                                landId: landValue,
                                                buildingId: "",
                                                buildingName: "",
                                                address: "",
                                                ratesNo: "",
                                                area: "",
                                                noOfFloors: "",
                                                value: "",
                                                benchMarks: "",
                                                comment: "",
                                                station: "",
                                                status: "",
                                                // ...any other form fields
                                            }));

                                            // 3️⃣ Clear files
                                            setFiles([{ file: null, preview: null, isExisting: false, serverPath: "" }]);
                                            setFilePreviews([]);
                                        }
                                        console.log("Selected Land ID:", landValue);
                                    }}
                                    placeholder="Select Land ID"
                                    isClearable
                                />
                            </div>


                            {/* Building Id */}
                            {/*               <div className="form-group">
                <label className="form-label">
                  Building Id <span className="required">*</span>
                </label>
                {updateState ? (
                <Select
                  options={buildingId.map(id => ({ value: id, label: id }))} 
                  value={
                    buildingId
                      .map(id => ({ value: id, label: id }))
                      .find(opt => opt.value === formData.buildingId) || null
                  }
                  onChange={selected => {
                    console.log("selected", selected.value)
                    fetchDataById(selected.value);
                    setFormData(prev => ({
                      ...prev,
                      buildingId: selected ? selected.value : "",
                    }));
                  }}
                  placeholder="Select Land ID"
                  isClearable
                />
                )
                :( 
                <input
                  className="form-control"
                  name="buildingId"
                  value={formData.buildingId}
                  onChange={handleChange}
                 // disabled={isLoading}
                />
                )
               }
              </div> */}
                            {/* Building Id */}
                            <div className="form-group">
                                <label className="form-label">
                                    Building Id <span className="required">*</span>
                                </label>

                                {updateState ? (
                                    <Select
                                        options={buildingId.map(id => ({ value: id, label: id }))}
                                        value={
                                            buildingId
                                                .map(id => ({ value: id, label: id }))
                                                .find(opt => opt.value === formData.buildingId) || null
                                        }
                                        onChange={selected => {
                                            const buildingValue = selected ? selected.value : "";
                                            setFormData(prev => ({ ...prev, buildingId: buildingValue }));
                                            console.log("Selected Building ID:", buildingValue);

                                            if (buildingValue) {
                                                fetchDataById(buildingValue); // fetch building details
                                            }
                                        }}
                                        placeholder="Select Building ID"
                                        isClearable
                                    />
                                ) : (
                                    <input
                                        className="form-control"
                                        name="buildingId"
                                        value={formData.buildingId}
                                        onChange={handleChange}
                                    />
                                )}
                            </div>


                            {/* Building Name */}
                            <div className="form-group">
                                <label className="form-label">
                                    Building Name <span className="required">*</span>
                                </label>
                                <input
                                    className="form-control"
                                    name="buildingName"
                                    value={formData.buildingName}
                                    onChange={handleChange}
                                // disabled={isLoading}
                                />
                            </div>

                            {/* value */}
                            <div className="form-group">
                                <label className="form-label">Value</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="value"
                                    value={formData.value}
                                    onChange={handleChange}
                                // disabled={isLoading}
                                />
                            </div>

                            {/* Rates No */}
                            <div className="form-group">
                                <label className="form-label">Rates No</label>
                                <input
                                    className="form-control"
                                    name="ratesNo"
                                    value={formData.ratesNo}
                                    onChange={handleChange}
                                //  disabled={isLoading}
                                />
                            </div>

                            {/* Area */}
                            <div className="form-group">
                                <label className="form-label">Area (sqft)</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="area"
                                    value={formData.area}
                                    onChange={handleChange}
                                // disabled={isLoading}
                                />
                            </div>

                            {/* No of Floors */}
                            <div className="form-group">
                                <label className="form-label">No of Floors</label>
                                <input
                                    type="number"
                                    className="form-control"
                                    name="noOfFloors"
                                    value={formData.noOfFloors}
                                    onChange={handleChange}
                                //  disabled={isLoading}
                                />
                            </div>

                            {/* Address */}
                            <div className="form-group">
                                <label className="form-label">Address</label>
                                <textarea
                                    className="form-control"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Enter address..."
                                    rows={2}
                                />
                            </div>

                            {/* Bench Marks */}
                            <div className="form-group">
                                <label className="form-label">Bench Marks</label>
                                <textarea
                                    className="form-control"
                                    id="benchMarks"
                                    name="benchMarks"
                                    value={formData.benchMarks}
                                    onChange={handleChange}
                                    placeholder="Enter Bench Marks..."
                                    rows={2}
                                />
                            </div>

                            {/* Comment */}
                            <div className="form-group">
                                <label className="form-label">Comment</label>
                                <textarea
                                    className="form-control"
                                    id="comment"
                                    name="comment"
                                    value={formData.comment}
                                    onChange={handleChange}
                                    placeholder="Enter Comment..."
                                    rows={2}
                                />
                            </div>

                            {/* Status */}
                            <div className="form-group">
                                <label className="form-label">Status</label>
                                <Select
                                    name="status"
                                    placeholder="Select Status"
                                    options={statusOptions}
                                    value={
                                        statusOptions.find(
                                            option => option.value === formData.status
                                        ) || null
                                    }
                                    onChange={(selected) => {
                                        setFormData(prev => ({
                                            ...prev,
                                            status: selected ? selected.value : null
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
                                                    src={`http://localhost:3000/base_uploads/${fileObj.serverPath}`}
                                                    alt="preview"
                                                    className="preview-img"
                                                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                                />
                                            ) : (
                                                <FiFileText size={32} className="placeholder-icon" />
                                            )}

                                            {!isBrowse && (fileObj.file || (fileObj.isExisting && fileObj.serverPath)) && (
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

                                {!isBrowse &&
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

                    {/* Actions */}

                        <div className="action-buttons">
                            <button
                                className="button button-submit"
                                type="button"
                                onClick={handleSave}
                                disabled={isLoading}
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

export default BuildingDetails
