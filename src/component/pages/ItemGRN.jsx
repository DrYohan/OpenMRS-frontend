import React, { useState, useEffect } from "react";
import "../../css/ItemGRN.css";
import Swal from "sweetalert2";

const ItemGRN = () => {
  // Main form data
  const [formData, setFormData] = useState({
    // Left Column - Section 1
    middleCategory: "",
    subCategory: "",
    itemName: "",
    poNo: "",
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
    {
      id: 1,
      name: "",
      file: null,
      fileName: "No file chosen",
      previewUrl: null,
    },
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
    middleCategories: [], // Will be populated from API
    subCategories: [], // Will be populated from API
    receiveTypes: [
      { id: 1, name: "Purchase" },
      { id: 2, name: "Donation" },
      { id: 3, name: "Transfer" },
      { id: 4, name: "Lease" },
      { id: 5, name: "Gift" },
    ],
    centers: [],
    locations: [],
    departments: [],
    employees: [],
    suppliers: [],
  });

  // Browse modal state
  const [showBrowseModal, setShowBrowseModal] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  // FIXED: Add these state variables in the right place (only once)
  const [isEditingMode, setIsEditingMode] = useState(false);
  const [selectedGrnData, setSelectedGrnData] = useState(null);
  const [selectedItemSerials, setSelectedItemSerials] = useState([]);
  const [allRelatedItems, setAllRelatedItems] = useState([]);
  const [isViewingFixedAsset, setIsViewingFixedAsset] = useState(false);

  const itemsPerPage = 20;

  // Add image viewing state
  const [selectedItemImages, setSelectedItemImages] = useState({
    hasImages: false,
    imageCount: 0,
    imagePaths: {},
  });
  const [showImageModal, setShowImageModal] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loadingImage, setLoadingImage] = useState(false);
  const [imagePreviews, setImagePreviews] = useState({});

  useEffect(() => {
    const initializeDropdowns = async () => {
      await Promise.all([
        fetchMiddleCategories(),
        fetchSubCategories(), // or fetchItemTypesWithMiddleCategories()
        fetchCenters(),
        fetchLocations(),
        fetchDepartments(),
        fetchSuppliers(),
      ]);
    };

    initializeDropdowns();
    fetchExistingGrnNumbers();
  }, []);

  useEffect(() => {
    return () => {
      // Clean up object URLs to prevent memory leaks
      files.forEach((file) => {
        if (file.previewUrl && file.previewUrl.startsWith("blob:")) {
          URL.revokeObjectURL(file.previewUrl);
        }
      });
      Object.values(imagePreviews).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [files, imagePreviews]);

  // Add this useEffect to ensure departments are loaded when editing
  useEffect(() => {
    if (isEditingMode && assetRows.length > 0) {
      // Load departments for all rows when in edit mode
      assetRows.forEach((row) => {
        if (row.center && row.location) {
          loadFilteredDepartmentsForLocation(row.center, row.location).then(
            (depts) => {
              setFilteredDepartments((prev) => {
                const newDepartments = [...prev];
                depts.forEach((dept) => {
                  if (!newDepartments.some((d) => d.id === dept.id)) {
                    newDepartments.push(dept);
                  }
                });
                return newDepartments;
              });
            }
          );
        }
      });
    }
  }, [isEditingMode, assetRows]);

  // Function to fetch all fixed assets by GRN number
  const fetchAssetsByGrnNo = async (grnNo) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/item-grn-approve/assets/by-grn/${grnNo}`
      );
      const result = await response.json();

      if (result.success) {
        return result.data;
      }
      return [];
    } catch (error) {
      console.error("Error fetching assets by GRN:", error);
      return [];
    }
  };

  // Open image modal
  const openImageModal = (index = 0) => {
    setCurrentImageIndex(index);
    setShowImageModal(true);
  };

  // Close image modal
  const closeImageModal = () => {
    setShowImageModal(false);
    setLoadingImage(false);
  };

  // Get image URL (updated to handle both item-grn and fixed-asset)
  const getImageUrl = (itemSerial, imageNumber) => {
    if (isViewingFixedAsset && selectedItem) {
      // For fixed assets, get from the selected item data
      const imageField = `Item${imageNumber}Pic`;
      const imagePath = selectedItem[imageField];
      if (imagePath) {
        // Clean the path
        let cleanedPath = imagePath
          .replace(/['"]/g, "")
          .trim()
          .replace(/\\/g, "/");
        cleanedPath = cleanedPath.replace(/^\/+/, "");

        return `http://localhost:3000/${cleanedPath}`;
      }
    }

    // For item-grn items, check if we have image paths in selectedItemImages
    if (selectedItemImages.imagePaths) {
      const imageField = `Item${imageNumber}Pic`;
      const imagePath = selectedItemImages.imagePaths[imageField];
      if (imagePath) {
        // Clean the path
        let cleanedPath = imagePath;
        if (typeof cleanedPath === "string") {
          cleanedPath = cleanedPath
            .replace(/['"]/g, "")
            .trim()
            .replace(/\\/g, "/");
          cleanedPath = cleanedPath.replace(/^\/+/, "");

          if (cleanedPath.startsWith("http")) {
            return cleanedPath;
          } else {
            return `http://localhost:3000/${cleanedPath}`;
          }
        }
      }
    }

    // Fallback: try the API endpoint
    return `http://localhost:3000/api/item-grn/${itemSerial}/images/${imageNumber}`;
  };

  const handleImageError = (e, imageNumber) => {
    console.error(`Error loading image ${imageNumber}:`, e);
    e.target.src =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='150' height='150' viewBox='0 0 150 150'%3E%3Crect width='150' height='150' fill='%23f0f0f0'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-family='Arial, sans-serif' font-size='14'%3EImage %23${imageNumber}%3C/text%3E%3C/svg%3E";

    // Try to reload the image
    setTimeout(() => {
      if (
        selectedItemSerials[0] &&
        selectedItemImages.imagePaths[`Item${imageNumber}Pic`]
      ) {
        if (isViewingFixedAsset && selectedItem) {
          loadFixedAssetImagePreview(selectedItem, imageNumber);
        } else {
          loadImagePreview(selectedItemSerials[0], imageNumber);
        }
      }
    }, 1000);
  };

  // Add a function to force reload all images
  const reloadAllImages = () => {
    if (selectedItem && isViewingFixedAsset) {
      console.log("Reloading all images...");
      loadFixedAssetImages(selectedItem);
    } else if (selectedItemSerials[0]) {
      console.log("Reloading images for item-grn...");
      [1, 2, 3, 4].forEach((imageNum) => {
        const imageField = `Item${imageNum}Pic`;
        if (selectedItemImages.imagePaths[imageField]) {
          loadImagePreview(selectedItemSerials[0], imageNum);
        }
      });
    }
  };

  // Load image for preview
  const loadImagePreview = async (itemSerial, imageNumber) => {
    const imageUrl = getImageUrl(itemSerial, imageNumber);

    try {
      const response = await fetch(imageUrl);
      if (response.ok) {
        const blob = await response.blob();
        const objectUrl = URL.createObjectURL(blob);

        setImagePreviews((prev) => ({
          ...prev,
          [`${itemSerial}_${imageNumber}`]: objectUrl,
        }));

        return objectUrl;
      } else {
        console.warn(`Image not found at: ${imageUrl}`);
        // Try alternative path - check if it might be in uploads folder
        const alternativeUrl = `http://localhost:3000/uploads/${itemSerial}_${imageNumber}.jpg`;
        try {
          const altResponse = await fetch(alternativeUrl);
          if (altResponse.ok) {
            const blob = await altResponse.blob();
            const objectUrl = URL.createObjectURL(blob);
            setImagePreviews((prev) => ({
              ...prev,
              [`${itemSerial}_${imageNumber}`]: objectUrl,
            }));
            return objectUrl;
          }
        } catch (altError) {
          console.warn(`Alternative image also not found: ${alternativeUrl}`);
        }
      }
    } catch (error) {
      console.error(`Error loading image ${imageNumber}:`, error);
    }

    return null;
  };

  // Auto-load image previews when images are available
  useEffect(() => {
    if (
      (isEditingMode || isViewingFixedAsset) &&
      selectedItemImages.hasImages &&
      selectedItemSerials[0]
    ) {
      const itemSerial = selectedItemSerials[0];

      // Load all available images
      [1, 2, 3, 4].forEach((imageNum) => {
        const imageField = `Item${imageNum}Pic`;
        if (selectedItemImages.imagePaths[imageField]) {
          if (isViewingFixedAsset && selectedItem) {
            loadFixedAssetImagePreview(selectedItem, imageNum);
          } else {
            loadImagePreview(itemSerial, imageNum);
          }
        }
      });
    }
  }, [
    isEditingMode,
    isViewingFixedAsset,
    selectedItemImages.hasImages,
    selectedItemSerials,
    selectedItem,
  ]);

  // Helper function to check if fixed asset has images
  const checkFixedAssetImages = (fixedAssetItem) => {
    if (!fixedAssetItem) return false;

    return (
      fixedAssetItem.Item1Pic ||
      fixedAssetItem.Item2Pic ||
      fixedAssetItem.Item3Pic ||
      fixedAssetItem.Item4Pic
    );
  };

  const fetchSuppliers = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/supplier/all");
      const result = await response.json();

      if (result.success) {
        // Store suppliers for dropdown
        setDropdownOptions((prev) => ({
          ...prev,
          suppliers: result.data.map((supplier) => ({
            id: supplier.id,
            supplierCode: supplier.supplier_code,
            name: supplier.supplier_name,
            email: supplier.email,
            telephone: supplier.telephone,
            address: supplier.address,
          })),
        }));
      }
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    }
  };

  const fetchMiddleCategories = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/asset-categories/middle-categories"
      );
      const result = await response.json();

      if (result.success) {
        setDropdownOptions((prev) => ({
          ...prev,
          middleCategories: result.data.map((category) => ({
            id: category.id, // Use database primary key id
            middleCategoryId: category.middle_category_id, // The actual middle category ID like "MC001"
            name: category.middle_category_name,
            mainCategoryId: category.main_category_id,
            description: category.description,
          })),
        }));
      }
    } catch (error) {
      console.error("Error fetching middle categories:", error);
    }
  };

  // Fetch sub categories from database (item types)
  const fetchSubCategories = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/asset-categories/sub-categories"
      );
      const result = await response.json();

      if (result.success) {
        setDropdownOptions((prev) => ({
          ...prev,
          subCategories: result.data.map((subCategory) => ({
            id: subCategory.id, // Database primary key
            subCategoryId: subCategory.sub_category_id, // Actual sub category ID like "SC001"
            name: subCategory.sub_category_name,
            middleCategoryId: subCategory.middle_category_id,
            mainCategoryId: subCategory.main_category_id,
            shortCode: subCategory.short_code,
          })),
        }));
      }
    } catch (error) {
      console.error("Error fetching sub categories:", error);
      // Fallback to item types if sub-categories endpoint doesn't exist
      fetchItemTypesAsSubCategories();
    }
  };

  const fetchCenters = async () => {
    try {
      const response = await fetch("http://localhost:3000/api/centers");
      const result = await response.json();
      if (result.success) {
        setDropdownOptions((prev) => ({
          ...prev,
          centers: result.data.map((center) => ({
            id: center.center_id,
            name: center.center_name,
          })),
        }));
      }
    } catch (error) {
      console.error("Error fetching centers:", error);
    }
  };

  const fetchDepartments = async (centerId = null, locationId = null) => {
    try {
      let url = "http://localhost:3000/api/departments";

      if (centerId || locationId) {
        const params = new URLSearchParams();
        if (centerId) params.append("center_id", centerId);
        if (locationId) params.append("location_id", locationId);
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        const departmentsData = result.data.map((dept) => ({
          id: dept.department_id,
          name: dept.department_name,
          centerId: dept.center_id,
          locationId: dept.location_id,
        }));

        if (centerId || locationId) {
          setFilteredDepartments(departmentsData);
        } else {
          setDropdownOptions((prev) => ({
            ...prev,
            departments: departmentsData,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchLocations = async (centerId = null) => {
    try {
      let url = "http://localhost:3000/api/locations";
      if (centerId) {
        url += `?center_id=${centerId}`;
      }

      const response = await fetch(url);
      const result = await response.json();
      if (result.success) {
        const locationsData = result.data.map((location) => ({
          id: location.location_id,
          name: location.location_name,
          centerId: location.center_id,
        }));

        if (centerId) {
          setFilteredLocations(locationsData);
        } else {
          setDropdownOptions((prev) => ({
            ...prev,
            locations: locationsData,
          }));
        }
      }
    } catch (error) {
      console.error("Error fetching locations:", error);
    }
  };

  // Filtered dropdowns
  const [filteredSubCategories, setFilteredSubCategories] = useState([]);
  const [filteredLocations, setFilteredLocations] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);

  const [existingGrnNumbers, setExistingGrnNumbers] = useState([]);
  const [isGeneratingGrn, setIsGeneratingGrn] = useState(false);

  // Filter locations based on selected center
  const getFilteredLocations = (centerId) => {
    if (!centerId) return [];

    // First check filteredLocations (which may have been pre-loaded)
    const filtered = filteredLocations.filter(
      (loc) => loc.centerId == centerId
    );

    // If no filtered locations, try from dropdown options
    if (filtered.length === 0) {
      return dropdownOptions.locations.filter(
        (loc) => loc.centerId == centerId
      );
    }

    return filtered;
  };

  // Filter employees based on selected department
  const getFilteredEmployees = (departmentId) => {
    return dropdownOptions.employees.filter(
      (emp) => emp.departmentId == departmentId
    );
  };

  useEffect(() => {
    fetchExistingGrnNumbers();
  }, []);

  const fetchExistingGrnNumbers = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/item-grn/grn-numbers"
      );
      const result = await response.json();
      if (result.success) {
        setExistingGrnNumbers(result.data);
      }
    } catch (error) {
      console.error("Error fetching GRN numbers:", error);
    }
  };

  // Function to generate new GRN number
  const generateNewGrnNo = async () => {
    setIsGeneratingGrn(true);
    try {
      const response = await fetch(
        "http://localhost:3000/api/item-grn/generate-grn"
      );
      const result = await response.json();
      if (result.success) {
        const newGrnNo = result.data.grn_no;

        const grnExists = existingGrnNumbers.some(
          (grn) => (grn.grn_no || grn.GrnNo) === newGrnNo
        );

        if (grnExists) {
          Swal.fire({
            icon: "warning",
            title: "GRN Already Exists",
            text: `GRN number ${newGrnNo} already exists. Please select it from the dropdown.`,
            confirmButtonColor: "#3085d6",
          });
          return;
        }

        setFormData((prev) => ({
          ...prev,
          grnNo: newGrnNo,
        }));

        setExistingGrnNumbers((prev) => [
          { grn_no: newGrnNo, GrnNo: newGrnNo },
          ...prev,
        ]);
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Error generating GRN number: " + result.message,
          confirmButtonColor: "#d33",
        });
      }
    } catch (error) {
      console.error("Error generating GRN number:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error generating GRN number. Please try again.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setIsGeneratingGrn(false);
    }
  };

  // Handle GRN number selection
  const handleGrnNoChange = async (e) => {
    const { value } = e.target;
    if (value === "new") {
      await generateNewGrnNo();
    } else {
      setFormData((prev) => ({
        ...prev,
        grnNo: value,
      }));
    }
  };

  // Update filtered subcategories when middle category changes
  useEffect(() => {
    if (formData.middleCategory) {
      // Find the middle category object
      const middleCat = findMiddleCategoryById(formData.middleCategory);

      if (middleCat) {
        const filtered = dropdownOptions.subCategories.filter((subCat) => {
          // Try to match by middleCategoryId or by the middle category's id
          return (
            subCat.middleCategoryId == middleCat.middleCategoryId ||
            subCat.middleCategoryId == middleCat.id ||
            (subCat.mainCategoryId &&
              subCat.mainCategoryId == middleCat.mainCategoryId)
          );
        });
        setFilteredSubCategories(filtered);
      } else {
        // If middle category not found, clear subcategories
        setFilteredSubCategories([]);
      }
    } else {
      setFilteredSubCategories([]);
      setFormData((prev) => ({ ...prev, subCategory: "" }));
    }
  }, [formData.middleCategory, dropdownOptions.subCategories]);

  // Add these helper functions near the top of your component
  const findMiddleCategoryById = (id) => {
    if (!id) return null;

    // Try to find by different ID types
    return dropdownOptions.middleCategories.find(
      (cat) =>
        cat.id.toString() === id.toString() ||
        cat.middleCategoryId === id.toString()
    );
  };

  const findSubCategoryById = (id, middleCategoryId = null) => {
    if (!id) return null;

    // First, filter subcategories if middleCategoryId is provided
    let subCategoriesToSearch = dropdownOptions.subCategories;
    if (middleCategoryId) {
      subCategoriesToSearch = dropdownOptions.subCategories.filter((sub) => {
        const middleCat = findMiddleCategoryById(middleCategoryId);
        if (!middleCat) return true;

        return (
          sub.middleCategoryId == middleCat.middleCategoryId ||
          sub.middleCategoryId == middleCat.id
        );
      });
    }

    // Try to find by different ID types
    return subCategoriesToSearch.find(
      (sub) =>
        sub.id.toString() === id.toString() ||
        sub.subCategoryId === id.toString()
    );
  };

  // Handle main form field changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "middleCategory") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        subCategory: "",
      }));
    } else if (name === "replicate") {
      const newValue = checked;
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      if (newValue) {
        if (assetRows.length > 1) {
          setAssetRows([assetRows[0]]);
        }
      } else {
        if (assetRows.length > 1) {
          setAssetRows([assetRows[0]]);
        }
      }
    } else if (name === "qty") {
      const newValue = value;
      setFormData((prev) => ({
        ...prev,
        [name]: newValue,
      }));

      if (formData.replicate && assetRows.length > 1) {
        const quantity = parseInt(newValue) || 1;
        if (quantity < assetRows.length) {
          setAssetRows(assetRows.slice(0, quantity));
        } else if (quantity > assetRows.length) {
          const templateRow = assetRows[0];
          const newRows = [...assetRows];

          for (let i = assetRows.length; i < quantity; i++) {
            newRows.push({
              ...templateRow,
              id: i + 1,
              serialNo: templateRow.serialNo
                ? `${
                    templateRow.serialNo.split("-")[0] || templateRow.serialNo
                  }-${i + 1}`
                : "",
              bookNoLocalId: templateRow.bookNoLocalId
                ? `${templateRow.bookNoLocalId}-${i + 1}`
                : "",
              barcodeNo: templateRow.barcodeNo
                ? `${templateRow.barcodeNo}-${i + 1}`
                : "",
            });
          }
          setAssetRows(newRows);
        }
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  // Handle file upload with preview
  const handleFileChange = (e, fileId) => {
    const file = e.target.files[0];
    if (file) {
      // Check if it's an image file
      const isImage = file.type.startsWith("image/");
      let previewUrl = null;

      if (isImage) {
        // Create preview URL for image files
        previewUrl = URL.createObjectURL(file);
      }

      setFiles(
        files.map((f) =>
          f.id === fileId
            ? {
                ...f,
                file: file,
                fileName: file.name,
                previewUrl: previewUrl,
                isImage: isImage,
                fileType: file.type,
              }
            : f
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
        previewUrl: null,
        isImage: false,
        fileType: null,
      },
    ]);
  };

  // Remove file upload field
  const removeFileUpload = (fileId) => {
    if (files.length > 1) {
      const fileToRemove = files.find((f) => f.id === fileId);
      // Clean up object URL before removing
      if (
        fileToRemove &&
        fileToRemove.previewUrl &&
        fileToRemove.previewUrl.startsWith("blob:")
      ) {
        URL.revokeObjectURL(fileToRemove.previewUrl);
      }
      setFiles(files.filter((f) => f.id !== fileId));
    }
  };

  // Replace your getFilteredDepartments function with this:
  const getFilteredDepartments = (centerId, locationId) => {
    if (!centerId && !locationId) {
      // Combine both filtered and dropdown departments
      const allDepartments = [
        ...dropdownOptions.departments,
        ...filteredDepartments,
      ];

      // Remove duplicates
      const seenIds = new Set();
      return allDepartments.filter((dept) => {
        if (seenIds.has(dept.id)) return false;
        seenIds.add(dept.id);
        return true;
      });
    }

    // First check filteredDepartments
    let filtered = filteredDepartments.filter((dept) => {
      if (centerId && dept.centerId !== centerId) return false;
      if (locationId && dept.locationId !== locationId) return false;
      return true;
    });

    // If no departments found, also check dropdownOptions.departments
    if (filtered.length === 0) {
      filtered = dropdownOptions.departments.filter((dept) => {
        if (centerId && dept.centerId !== centerId) return false;
        if (locationId && dept.locationId !== locationId) return false;
        return true;
      });
    }

    return filtered;
  };

  const getDisplayName = (id, items, field = "name") => {
    if (!id) return "";

    const item = items.find((item) => item.id === id);
    return item ? item[field] : `ID: ${id}`;
  };

  // Update your handleAssetChange function:
  const handleAssetChange = async (rowId, fieldName, value) => {
    setAssetRows((rows) =>
      rows.map((row) => {
        if (row.id === rowId) {
          const updatedRow = { ...row, [fieldName]: value };

          if (fieldName === "center") {
            updatedRow.location = "";
            updatedRow.department = "";
            updatedRow.employee = "";
            fetchLocations(value);
            fetchDepartments(value, null);
          } else if (fieldName === "location") {
            updatedRow.department = "";
            updatedRow.employee = "";

            // Fetch departments for this center/location
            if (updatedRow.center && value) {
              loadFilteredDepartmentsForLocation(updatedRow.center, value).then(
                (depts) => {
                  // Add these departments to filteredDepartments
                  setFilteredDepartments((prev) => {
                    const newDepartments = [...prev];
                    depts.forEach((dept) => {
                      if (!newDepartments.some((d) => d.id === dept.id)) {
                        newDepartments.push(dept);
                      }
                    });
                    return newDepartments;
                  });
                }
              );
            }
          } else if (fieldName === "department") {
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
    if (formData.replicate) {
      const quantity = parseInt(formData.qty) || 1;

      if (!formData.qty || quantity < 1) {
        Swal.fire({
          icon: "warning",
          title: "Invalid Quantity",
          text: "Please enter a valid quantity first.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const firstRow = assetRows[0];
      if (!firstRow.center || !firstRow.department || !firstRow.serialNo) {
        Swal.fire({
          icon: "warning",
          title: "Missing Information",
          text: "Please fill in Center, Department, and Serial No in the first row before creating replicate rows.",
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const newRows = [];

      for (let i = 0; i < quantity; i++) {
        if (i === 0) {
          newRows.push({ ...firstRow, id: 1 });
        } else {
          newRows.push({
            ...firstRow,
            id: i + 1,
            serialNo: `${firstRow.serialNo}-${i + 1}`,
            bookNoLocalId: firstRow.bookNoLocalId
              ? `${firstRow.bookNoLocalId}-${i + 1}`
              : "",
            barcodeNo: firstRow.barcodeNo
              ? `${firstRow.barcodeNo}-${i + 1}`
              : "",
          });
        }
      }

      setAssetRows(newRows);
    } else {
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
    }
  };

  // Remove asset row
  const removeAssetRow = (rowId) => {
    if (formData.replicate && assetRows.length > 1) {
      Swal.fire({
        icon: "warning",
        title: "Cannot Remove Row",
        text: "Cannot remove individual rows in Replicate mode. Uncheck Replicate first to remove rows.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (assetRows.length <= 1) {
      return;
    }

    setAssetRows(assetRows.filter((row) => row.id !== rowId));
  };

  // ===== BROWSE MODAL FUNCTIONS =====

  const fetchSearchResults = async (page = 1) => {
    setLoading(true);
    try {
      // Use the new API endpoint for fixed assets
      const response = await fetch(
        `http://localhost:3000/api/item-grn-approve/assets/all`
      );
      const result = await response.json();

      if (result.success) {
        // If there's a search query, filter the results
        let filteredResults = result.data || [];

        if (searchQuery.trim() !== "") {
          const query = searchQuery.toLowerCase();
          filteredResults = filteredResults.filter((item) => {
            return (
              (item.ItemName && item.ItemName.toLowerCase().includes(query)) ||
              (item.InvoiceNo &&
                item.InvoiceNo.toLowerCase().includes(query)) ||
              (item.GrnNo && item.GrnNo.toLowerCase().includes(query)) ||
              (item.SerialNo && item.SerialNo.toLowerCase().includes(query)) ||
              (item.BarcodeNo &&
                item.BarcodeNo.toLowerCase().includes(query)) ||
              (item.PONo && item.PONo.toLowerCase().includes(query)) ||
              (item.Manufacture &&
                item.Manufacture.toLowerCase().includes(query)) ||
              (item.ItemCode && item.ItemCode.toLowerCase().includes(query)) ||
              (item.center_name &&
                item.center_name.toLowerCase().includes(query)) ||
              (item.department_name &&
                item.department_name.toLowerCase().includes(query))
            );
          });
        }

        // Sort by CreatedAt descending
        filteredResults.sort((a, b) => {
          const dateA = new Date(a.CreatedAt || a.CreatedAt);
          const dateB = new Date(b.CreatedAt || b.CreatedAt);
          return dateB - dateA;
        });

        // Manual pagination
        const itemsPerPage = 20;
        const startIndex = (page - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedResults = filteredResults.slice(startIndex, endIndex);

        setSearchResults(paginatedResults);
        setTotalPages(Math.ceil(filteredResults.length / itemsPerPage));
        setTotalItems(filteredResults.length);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching fixed assets:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error fetching data. Please try again.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllAssets = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/item-grn-approve/assets/all`
      );
      const result = await response.json();

      if (result.success) {
        return result.data || [];
      }
      return [];
    } catch (error) {
      console.error("Error fetching all assets:", error);
      return [];
    }
  };

  // Handle search
  const handleSearch = () => {
    setCurrentPage(1);
    fetchSearchResults(1);
  };

  // Handle key press for search
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // Open browse modal
  const openBrowseModal = () => {
    setShowBrowseModal(true);
    setSearchQuery("");
    setCurrentPage(1);
    fetchSearchResults(1);
  };

  // Close browse modal
  const closeBrowseModal = () => {
    setShowBrowseModal(false);
    setSelectedItem(null);
    setIsEditing(false);
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedItemSerials.length) {
      Swal.fire({
        icon: "warning",
        title: "No Item Selected",
        text: "No item selected to delete.",
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    Swal.fire({
      title: "Are you sure?",
      text: `You want to delete ${selectedItemSerials.length} item(s) with GRN ${formData.grnNo}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      cancelButtonText: "Cancel",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          // Delete all items with this GRN number
          const deletePromises = selectedItemSerials.map((itemSerial) =>
            fetch(`http://localhost:3000/api/item-grn/${itemSerial}`, {
              method: "DELETE",
            })
          );

          const results = await Promise.all(deletePromises);
          const allSuccess = results.every((response) => response.ok);

          if (allSuccess) {
            Swal.fire({
              icon: "success",
              title: "Deleted!",
              text: `${selectedItemSerials.length} item(s) deleted successfully!`,
              confirmButtonColor: "#019159",
            });
            handleReset();
          } else {
            Swal.fire({
              icon: "error",
              title: "Error",
              text: "Some items could not be deleted. Please try again.",
              confirmButtonColor: "#d33",
            });
          }
        } catch (error) {
          console.error("Error deleting items:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error deleting items. Please try again.",
            confirmButtonColor: "#d33",
          });
        }
      }
    });
  };

  // Helper to check if form has been modified
  const hasFormChanges = () => {
    // This is a simple check - you might want to implement a more sophisticated one
    if (!selectedGrnData) return false;

    const firstItem = selectedGrnData.items[0];
    const commonInfo = selectedGrnData.common_info;

    // Compare key fields to see if they've changed
    const changes = [
      formData.itemName !== firstItem.item_name,
      formData.poNo !== commonInfo.po_no,
      formData.invoiceNo !== commonInfo.invoice_no,
      // Add more field comparisons as needed
    ];

    return changes.some((change) => change === true);
  };

  // Add a confirmation when leaving edit mode
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isEditingMode && hasFormChanges()) {
        e.preventDefault();
        e.returnValue =
          "You have unsaved changes. Are you sure you want to leave?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isEditingMode, hasFormChanges]);

  // Handle row click to load item data
  // Handle row click to load item data
  const handleRowClick = async (item) => {
    try {
      // Check if this is from fixed_asset_master or item_grn
      const isFixedAsset =
        item.ItemCode !== undefined || item.item_serial === undefined;

      if (isFixedAsset) {
        // This is from fixed_asset_master - fetch all items with same GRN
        await handleFixedAssetClick(item);
      } else {
        // This is from item_grn - handle as before
        await handleGrnItemClick(item);
      }
    } catch (error) {
      console.error("Error loading item details:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error loading item details. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Handle fixed asset click (view-only mode)
  // Handle fixed asset click (view-only mode)
  const handleFixedAssetClick = async (item) => {
    try {
      const grnNo = item.GrnNo;
      if (!grnNo) {
        Swal.fire({
          icon: "warning",
          title: "No GRN Number",
          text: "No GRN number found for this item",
          confirmButtonColor: "#3085d6",
        });
        return;
      }
      // Fetch all items with this GRN number from fixed_asset_master
      const allItems = await fetchAssetsByGrnNo(grnNo);
      if (allItems.length === 0) {
        Swal.fire({
          icon: "warning",
          title: "No Items Found",
          text: `No items found for GRN: ${grnNo}`,
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      console.log(`Found ${allItems.length} items for GRN: ${grnNo}`);

      // Set the clicked item for reference
      setSelectedItem(item);
      setIsViewingFixedAsset(true);
      setIsEditingMode(false);

      // Store all related items
      setAllRelatedItems(allItems);

      // Use the first item to populate common fields
      const firstItem = allItems[0];

      // Load images for the first item
      await loadFixedAssetImages(firstItem);

      const formatDateForInput = (dateString) => {
        if (!dateString) return "";
        try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) return "";
          return date.toISOString().split("T")[0];
        } catch (error) {
          console.error("Error loading fixed asset details:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: "Error loading item details. Please try again.",
            confirmButtonColor: "#d33",
          });
        }
      };

      // Find the matching middle category
      const middleCategoryFromApi = firstItem.MiddleCategory;
      let mappedMiddleCategory = "";

      const foundMiddleCategory = dropdownOptions.middleCategories.find(
        (cat) => cat.middleCategoryId === middleCategoryFromApi
      );

      if (foundMiddleCategory) {
        mappedMiddleCategory = foundMiddleCategory.id.toString();
      } else {
        const foundById = dropdownOptions.middleCategories.find(
          (cat) => cat.id.toString() === middleCategoryFromApi
        );
        if (foundById) {
          mappedMiddleCategory = foundById.id.toString();
        } else {
          mappedMiddleCategory = middleCategoryFromApi;
        }
      }

      // Find the matching sub category
      const subCategoryFromApi =
        firstItem.SubCategory || firstItem.SubCategoryId;
      let mappedSubCategory = "";

      const filteredSubCats = dropdownOptions.subCategories.filter((subCat) => {
        return (
          subCat.middleCategoryId == mappedMiddleCategory ||
          subCat.id == mappedMiddleCategory ||
          (foundMiddleCategory &&
            subCat.middleCategoryId == foundMiddleCategory.middleCategoryId)
        );
      });

      const foundSubCategory =
        filteredSubCats.find(
          (sub) => sub.subCategoryId === subCategoryFromApi
        ) ||
        filteredSubCats.find((sub) => sub.id.toString() === subCategoryFromApi);

      if (foundSubCategory) {
        mappedSubCategory = foundSubCategory.id.toString();
      } else {
        mappedSubCategory = subCategoryFromApi;
      }

      // Map backend data to frontend form structure
      const formDataUpdate = {
        // Left Column - Section 1
        middleCategory: mappedMiddleCategory,
        subCategory: mappedSubCategory,
        itemName: firstItem.ItemName || "",
        poNo: firstItem.PONo || "",
        brand: firstItem.Brand || "",
        model: firstItem.Model || "",

        // Right Column - Section 1
        supplier: firstItem.Supplier || "",
        qty: allItems.length.toString(), // Show total count
        date: formatDateForInput(firstItem.PurchaseDate),
        invoiceNo: firstItem.InvoiceNo || "",
        unitPrice: firstItem.UnitPrice || "",
        invTotal: firstItem.InvoiceTotal || "",

        // Left Column - Section 3
        manufacturer: firstItem.Manufacture || "",
        type: firstItem.Type || "",
        source: firstItem.Source || "",
        receiveType: firstItem.ReceiveType || firstItem.InType || "",
        remarks: firstItem.Remarks || "",

        // Right Column - Section 3
        grnDate: formatDateForInput(firstItem.GRNdate),
        grnNo: grnNo,
        warrantyExp: formatDateForInput(firstItem.WarrantyExpireDate),
        serviceStart: formatDateForInput(firstItem.ServiceAgreementStartDate),
        serviceEnd: formatDateForInput(firstItem.ServiceAgreementEndDate),
        salvageValue: firstItem.SalvageValue || "",

        // Checkbox - set to true if multiple items
        replicate: allItems.length > 1,
      };

      setFormData(formDataUpdate);

      // Create asset allocation rows for ALL items
      const assetRowsData = allItems.map((assetItem, index) => ({
        id: assetItem.ItemSerial || index + 1,
        center: assetItem.Center || assetItem.StationId || "",
        location: assetItem.Location || assetItem.X || "",
        department: assetItem.Department || assetItem.DepartmentSerial || "",
        employee:
          assetItem.Employee || assetItem.EmployeeSerial?.toString() || "",
        serialNo: assetItem.SerialNo || "",
        bookNoLocalId: assetItem.BookNo || "",
        barcodeNo: assetItem.BarcodeNo || "",
      }));

      setAssetRows(assetRowsData);

      // Store all item serials
      const itemSerials = allItems.map((asset) => asset.ItemSerial);
      setSelectedItemSerials(itemSerials);

      closeBrowseModal();
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (error) {
      console.error("Error loading fixed asset details:", error);
      alert("Error loading item details. Please try again.");
    }
  };

  // Load fixed asset images
  const loadFixedAssetImages = async (fixedAssetItem) => {
    try {
      console.log(
        "Starting to load images for item:",
        fixedAssetItem.ItemSerial
      );

      // Check which images exist
      const imagePaths = {};
      let imageCount = 0;

      // Check all 4 possible image fields
      [1, 2, 3, 4].forEach((imageNum) => {
        const imageField = `Item${imageNum}Pic`;
        if (
          fixedAssetItem[imageField] &&
          fixedAssetItem[imageField].trim() !== ""
        ) {
          imagePaths[imageField] = fixedAssetItem[imageField];
          imageCount++;
          console.log(`Found image ${imageNum}:`, fixedAssetItem[imageField]);
        }
      });

      console.log(`Found ${imageCount} images total for item:`, imagePaths);

      // Update the selectedItemImages state IMMEDIATELY
      const newSelectedItemImages = {
        hasImages: imageCount > 0,
        imageCount: imageCount,
        imagePaths: imagePaths,
      };

      console.log("Setting selectedItemImages to:", newSelectedItemImages);
      setSelectedItemImages(newSelectedItemImages);

      // Store the item serial
      const itemSerial = fixedAssetItem.ItemSerial;
      console.log(`Setting selectedItemSerials to: [${itemSerial}]`);
      setSelectedItemSerials([itemSerial]);

      // If there are images, load previews
      if (imageCount > 0) {
        console.log(`Loading ${imageCount} image previews...`);

        // Load all available images
        [1, 2, 3, 4].forEach((imageNum) => {
          const imageField = `Item${imageNum}Pic`;
          if (imagePaths[imageField]) {
            console.log(`Loading preview for ${imageField}`);
            // Use setTimeout to avoid blocking the main thread
            setTimeout(() => {
              loadFixedAssetImagePreview(fixedAssetItem, imageNum);
            }, 100 * imageNum); // Stagger the loading
          }
        });
      } else {
        console.log("No images found for this item");
        // Clear any existing previews
        setImagePreviews({});
      }
    } catch (error) {
      console.error("Error in loadFixedAssetImages:", error);
      setSelectedItemImages({
        hasImages: false,
        imageCount: 0,
        imagePaths: {},
      });
    }
  };

  // Load fixed asset image for preview
  const loadFixedAssetImagePreview = async (fixedAssetItem, imageNumber) => {
    const imageField = `Item${imageNumber}Pic`;
    const rawImagePath = fixedAssetItem[imageField];

    if (!rawImagePath || rawImagePath.trim() === "") {
      console.log(`No image path for ${imageField}`);
      return null;
    }

    try {
      // Clean up the image path
      let imagePath = rawImagePath.trim();

      // Remove any quotes
      imagePath = imagePath.replace(/['"]/g, "");

      // Normalize path separators
      imagePath = imagePath.replace(/\\/g, "/");

      // Ensure it doesn't start with a slash (to avoid double slashes)
      imagePath = imagePath.replace(/^\//, "");

      // Create the image URL
      const imageUrl = `http://localhost:3000/${imagePath}`;
      console.log(`Attempting to load image ${imageNumber} from:`, imageUrl);

      const response = await fetch(imageUrl, {
        method: "GET",
        headers: {
          Accept: "image/*",
        },
        cache: "no-cache", // Prevent caching issues
      });

      if (response.ok) {
        const blob = await response.blob();

        if (blob.type.startsWith("image/")) {
          const objectUrl = URL.createObjectURL(blob);
          const previewKey = `${fixedAssetItem.ItemSerial}_${imageNumber}`;

          console.log(
            `Successfully loaded image ${imageNumber}, setting preview for key: ${previewKey}`
          );

          // Update the imagePreviews state
          setImagePreviews((prev) => {
            const updated = {
              ...prev,
              [previewKey]: objectUrl,
            };
            console.log(
              `Updated imagePreviews with key ${previewKey}, total keys:`,
              Object.keys(updated).length
            );
            return updated;
          });

          return objectUrl;
        } else {
          console.warn(
            `Loaded blob is not an image for ${imageNumber}:`,
            blob.type
          );
        }
      } else {
        console.warn(
          `Image not found at ${imageUrl}, status: ${response.status}`
        );

        // Try alternative paths
        const alternativePaths = [
          `http://localhost:3000/uploads/${imagePath.split("/").pop()}`, // Just filename in uploads
          `http://localhost:3000/uploads/${fixedAssetItem.ItemSerial}_${imageNumber}.jpg`,
          `http://localhost:3000/uploads/${fixedAssetItem.ItemSerial}_${imageNumber}.png`,
          `http://localhost:3000/uploads/${fixedAssetItem.ItemSerial}_${imageNumber}.jpeg`,
        ];

        for (const altUrl of alternativePaths) {
          try {
            console.log(`Trying alternative URL: ${altUrl}`);
            const altResponse = await fetch(altUrl);
            if (altResponse.ok) {
              const altBlob = await altResponse.blob();
              if (altBlob.type.startsWith("image/")) {
                const altObjectUrl = URL.createObjectURL(altBlob);
                const previewKey = `${fixedAssetItem.ItemSerial}_${imageNumber}`;

                setImagePreviews((prev) => ({
                  ...prev,
                  [previewKey]: altObjectUrl,
                }));

                console.log(
                  `Successfully loaded from alternative URL: ${altUrl}`
                );
                return altObjectUrl;
              }
            }
          } catch (altError) {
            console.log(`Alternative URL failed: ${altUrl}`, altError.message);
          }
        }
      }
    } catch (error) {
      console.error(`Error loading image ${imageNumber}:`, error);
    }

    return null;
  };

  const FallbackImage = ({ imageNumber }) => (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#f5f5f5",
        color: "#999",
        fontSize: "14px",
        textAlign: "center",
        padding: "10px",
      }}
    >
      <div style={{ fontSize: "24px", marginBottom: "5px" }}>📷</div>
      <div>Image {imageNumber}</div>
    </div>
  );

  // Helper function to load filtered locations for a center
  const loadFilteredLocationsForCenter = async (centerId) => {
    if (!centerId) return [];

    try {
      const response = await fetch(
        `http://localhost:3000/api/locations?center_id=${centerId}`
      );
      const result = await response.json();

      if (result.success) {
        return result.data.map((location) => ({
          id: location.location_id,
          name: location.location_name,
          centerId: location.center_id,
        }));
      }
    } catch (error) {
      console.error("Error fetching filtered locations:", error);
    }

    return [];
  };

  // Helper function to load filtered departments for center/location
  const loadFilteredDepartmentsForLocation = async (centerId, locationId) => {
    try {
      let url = "http://localhost:3000/api/departments";
      const params = new URLSearchParams();

      if (centerId) params.append("center_id", centerId);
      if (locationId) params.append("location_id", locationId);

      if (centerId || locationId) {
        url += `?${params.toString()}`;
      }

      const response = await fetch(url);
      const result = await response.json();

      if (result.success) {
        return result.data.map((dept) => ({
          id: dept.department_id,
          name: dept.department_name,
          centerId: dept.center_id,
          locationId: dept.location_id,
        }));
      }
    } catch (error) {
      console.error("Error fetching filtered departments:", error);
    }

    return [];
  };

  // Handle create form submission
  const handleCreate = async (e) => {
    e.preventDefault();

    // Validate required fields
    const requiredFields = [
      { field: "middleCategory", name: "Middle Category" },
      { field: "subCategory", name: "Sub Category" },
      { field: "itemName", name: "Item Name" },
      { field: "poNo", name: "PO No" },
      { field: "supplier", name: "Supplier" },
      { field: "qty", name: "Quantity" },
      { field: "date", name: "Date" },
      { field: "invoiceNo", name: "Invoice No" },
      { field: "grnDate", name: "GRN Date" },
      { field: "grnNo", name: "GRN No" },
    ];

    const missingFields = requiredFields.filter(
      ({ field, name }) =>
        !formData[field] || formData[field].toString().trim() === ""
    );

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map((f) => f.name).join(", ");
      Swal.fire({
        icon: "warning",
        title: "Required Fields Missing",
        html: `Please fill in the following required fields:<br><strong>${fieldNames}</strong>`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (formData.replicate) {
      const quantity = parseInt(formData.qty) || 0;
      if (assetRows.length !== quantity) {
        Swal.fire({
          icon: "warning",
          title: "Asset Rows Mismatch",
          html: `When Replicate is checked, you need exactly <strong>${quantity}</strong> asset allocation rows.<br>Currently you have <strong>${assetRows.length}</strong> rows.<br>Please click the "+" button to create all ${quantity} rows.`,
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const invalidRows = assetRows.filter(
        (row) => !row.center || !row.department || !row.serialNo
      );

      if (invalidRows.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Incomplete Asset Rows",
          text: `Please fill in Center, Department, and Serial No for all ${quantity} asset allocation rows.`,
          confirmButtonColor: "#3085d6",
        });
        return;
      }
    }

    try {
      const formDataToSend = new FormData();

      const fieldMapping = {
        middleCategory: "middle_category",
        subCategory: "sub_category",
        itemName: "item_name",
        poNo: "po_no",
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

      Object.keys(fieldMapping).forEach((frontendKey) => {
        const backendKey = fieldMapping[frontendKey];
        const value = formData[frontendKey];

        if (value !== undefined && value !== null && value !== "") {
          if (frontendKey === "replicate") {
            formDataToSend.append(backendKey, value ? "true" : "false");
          } else {
            formDataToSend.append(backendKey, value.toString());
          }
        }
      });

      files.forEach((file) => {
        if (file.file) {
          formDataToSend.append("files", file.file);
        }
      });

      if (assetRows.length > 0) {
        formDataToSend.append("assetAllocations", JSON.stringify(assetRows));
      }

      const response = await fetch("http://localhost:3000/api/item-grn", {
        method: "POST",
        body: formDataToSend,
      });

      const result = await response.json();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          html: `<div style="text-align: center;">
                   <div style="font-size: 24px; font-weight: bold; color: #019159; margin-bottom: 10px;">
                     <span style="font-size: 28px;">${
                       formData.grnNo
                     }</span> SAVED
                   </div>
                   <div style="font-size: 16px; color: #666; margin-top: 10px;">
                     ${
                       result.data.is_existing
                         ? "Added to existing GRN"
                         : "New GRN created"
                     }
                   </div>
                 </div>`,
          confirmButtonColor: "#019159",
          confirmButtonText: "OK",
          width: 500,
        });
        handleReset();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "Error saving item GRN",
          confirmButtonColor: "#d33",
        });
        if (result.errors) {
          console.log("Validation errors:", result.errors);
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error submitting form. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Handle update form submission
  const handleUpdate = async (e) => {
    e.preventDefault();

    // Validate required fields (same as handleCreate)
    const requiredFields = [
      { field: "middleCategory", name: "Middle Category" },
      { field: "subCategory", name: "Sub Category" },
      { field: "itemName", name: "Item Name" },
      { field: "poNo", name: "PO No" },
      { field: "supplier", name: "Supplier" },
      { field: "qty", name: "Quantity" },
      { field: "date", name: "Date" },
      { field: "invoiceNo", name: "Invoice No" },
      { field: "grnDate", name: "GRN Date" },
      { field: "grnNo", name: "GRN No" },
    ];

    const missingFields = requiredFields.filter(
      ({ field, name }) =>
        !formData[field] || formData[field].toString().trim() === ""
    );

    if (missingFields.length > 0) {
      const fieldNames = missingFields.map((f) => f.name).join(", ");
      Swal.fire({
        icon: "warning",
        title: "Required Fields Missing",
        html: `Please fill in the following required fields:<br><strong>${fieldNames}</strong>`,
        confirmButtonColor: "#3085d6",
      });
      return;
    }

    if (formData.replicate) {
      const quantity = parseInt(formData.qty) || 0;
      if (assetRows.length !== quantity) {
        Swal.fire({
          icon: "warning",
          title: "Asset Rows Mismatch",
          text: `When Replicate is checked, you need exactly ${quantity} asset allocation rows. Currently you have ${assetRows.length} rows.`,
          confirmButtonColor: "#3085d6",
        });
        return;
      }

      const invalidRows = assetRows.filter(
        (row) => !row.center || !row.department || !row.serialNo
      );

      if (invalidRows.length > 0) {
        Swal.fire({
          icon: "warning",
          title: "Incomplete Asset Rows",
          text: `Please fill in Center, Department, and Serial No for all ${quantity} asset allocation rows.`,
          confirmButtonColor: "#3085d6",
        });
        return;
      }
    }

    try {
      const updateData = new FormData();

      // Map frontend fields to backend fields - FIXED MAPPING
      const fieldMapping = {
        middleCategory: "middle_category", // This should map to database column
        subCategory: "sub_category",
        itemName: "item_name",
        poNo: "po_no",
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

      Object.keys(fieldMapping).forEach((frontendKey) => {
        const backendKey = fieldMapping[frontendKey];
        const value = formData[frontendKey];

        if (value !== undefined && value !== null) {
          if (frontendKey === "replicate") {
            updateData.append(backendKey, value ? "true" : "false");
          } else if (value !== "") {
            updateData.append(backendKey, value.toString());
          }
        }
      });

      // Add files if any
      files.forEach((file) => {
        if (file.file) {
          updateData.append("files", file.file);
        }
      });

      // Add asset allocations with proper field mapping
      if (assetRows.length > 0) {
        const mappedAssetRows = assetRows.map((row) => ({
          id: row.id,
          center: row.center,
          location: row.location,
          department: row.department,
          employee: row.employee,
          serialNo: row.serialNo,
          bookNoLocalId: row.bookNoLocalId,
          barcodeNo: row.barcodeNo,
        }));
        updateData.append("assetAllocations", JSON.stringify(mappedAssetRows));
      }

      // CRITICAL FIX: Update ALL items with the same GRN number
      const grnNo = formData.grnNo;

      if (!grnNo) {
        alert("GRN number is required for update.");
        return;
      }

      console.log(`Updating all items with GRN: ${grnNo}`);
      console.log(`Number of asset rows: ${assetRows.length}`);
      console.log(`Replicate mode: ${formData.replicate}`);
      console.log(`Quantity: ${formData.qty}`);

      // Log the data being sent
      console.log("FormData entries:");
      for (let [key, value] of updateData.entries()) {
        if (key !== "files") {
          console.log(`${key}: ${value}`);
        } else {
          console.log(`${key}: File object`);
        }
      }

      // Show loading state
      const saveButton = e.target.querySelector('button[type="submit"]');
      const originalText = saveButton.innerHTML;
      saveButton.innerHTML = '<span class="btn-icon">⏳</span> UPDATING...';
      saveButton.disabled = true;
      Swal.fire({
        title: "Updating...",
        text: `Updating items with GRN: ${formData.grnNo}`,
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Send update request with GRN number
      const response = await fetch(
        `http://localhost:3000/api/item-grn/by-grn/${grnNo}/update-all`,
        {
          method: "PUT",
          body: updateData,
        }
      );

      const result = await response.json();
      console.log("Update response:", result);

      Swal.close();

      if (result.success) {
        Swal.fire({
          icon: "success",
          title: "Success!",
          html: `<div style="text-align: center;">
                   <div style="font-size: 24px; font-weight: bold; color: #2196F3; margin-bottom: 10px;">
                     GRN <span style="font-size: 28px;">${
                       formData.grnNo
                     }</span> UPDATED
                   </div>
                   <div style="font-size: 16px; color: #666; margin-top: 10px;">
                     ${
                       result.data.updated_count || 1
                     } item(s) updated successfully
                   </div>
                 </div>`,
          confirmButtonColor: "#2196F3",
          confirmButtonText: "OK",
          width: 500,
        });
        handleReset();
      } else {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: result.message || "Error updating item GRN",
          confirmButtonColor: "#d33",
        });
        if (result.errors) {
          console.log("Validation errors:", result.errors);
        }
      }
    } catch (error) {
      console.error("Error updating form:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Error updating form. Please try again.",
        confirmButtonColor: "#d33",
      });
    }
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditingMode) {
      // Show confirmation dialog for update
      Swal.fire({
        title: "Update Confirmation",
        html: `Are you sure you want to update <strong>GRN ${formData.grnNo}</strong>?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#2196F3",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, update it!",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          handleUpdate(e);
        }
      });
    } else {
      // Show confirmation dialog for create
      Swal.fire({
        title: "Save Confirmation",
        html: `Are you sure you want to save <strong>GRN ${formData.grnNo}</strong>?`,
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#019159",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Yes, save it!",
        cancelButtonText: "Cancel",
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          handleCreate(e);
        }
      });
    }
  };

  // Handle pagination
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      fetchSearchResults(page);
    }
  };

  // Format date for display
  const formatDateForDisplay = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Reset all form data
  const handleReset = () => {
    setFormData({
      middleCategory: "",
      subCategory: "",
      itemName: "",
      poNo: "",
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
    setSelectedItem(null);
    setSelectedGrnData(null);
    setSelectedItemSerials([]);
    setIsEditingMode(false);
    setIsEditing(false);
    setIsViewingFixedAsset(false); // Add this
    setAllRelatedItems([]); // Add this
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
                          {category.middleCategoryId} - {category.name}
                          {category.description && ` (${category.description})`}
                        </option>
                      ))}
                    </select>
                    <div className="select-arrow"></div>
                  </div>
                  {formData.middleCategory && (
                    <div
                      className="field-info"
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "5px",
                      }}
                    ></div>
                  )}
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
                          {subCategory.subCategoryId} - {subCategory.name}
                          {subCategory.shortCode &&
                            ` (${subCategory.shortCode})`}
                        </option>
                      ))}
                      {formData.middleCategory &&
                        filteredSubCategories.length === 0 && (
                          <option value="" disabled>
                            No sub categories available for this middle category
                          </option>
                        )}
                    </select>
                    <div className="select-arrow"></div>
                  </div>
                  {formData.subCategory && (
                    <div
                      className="field-info"
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "5px",
                      }}
                    ></div>
                  )}
                </div>

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
                      name="poNo"
                      value={formData.poNo}
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
                  <div className="select-wrapper">
                    <select
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      className="form-select"
                      required
                    >
                      <option value="">Select Supplier</option>
                      {dropdownOptions.suppliers &&
                        dropdownOptions.suppliers.map((supplier) => (
                          <option
                            key={supplier.id}
                            value={supplier.supplierCode || supplier.id}
                          >
                            {supplier.supplierCode} - {supplier.name}
                            {supplier.telephone && ` (${supplier.telephone})`}
                          </option>
                        ))}
                    </select>
                    <div className="select-arrow"></div>
                  </div>

                  {/* Show selected supplier info */}
                  {formData.supplier && (
                    <div
                      className="field-info"
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "5px",
                      }}
                    ></div>
                  )}
                </div>

                <div className="form-group">
                  <label className="form-label">
                    Qty<span className="required">*</span>
                  </label>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "20px",
                      width: "100%",
                    }}
                  >
                    <div style={{ flex: 1, maxWidth: "600px" }}>
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
                          style={{ width: "100%" }}
                        />
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flex: 1,
                      }}
                    >
                      <label className="checkbox-label" style={{ margin: 0 }}>
                        <input
                          type="checkbox"
                          name="replicate"
                          checked={formData.replicate}
                          onChange={handleChange}
                          className="form-checkbox"
                          style={{ margin: 0 }}
                        />
                        <span style={{ fontSize: "1rem", fontWeight: "500" }}>
                          Replicate
                        </span>
                      </label>
                    </div>
                  </div>
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
                      accept="image/*,.pdf,.doc,.docx,.xls,.xlsx" // Accept images and documents
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

                    {/* Image Preview */}
                    {file.previewUrl && file.isImage && (
                      <div className="file-preview-container">
                        <div
                          className="image-preview-thumbnail"
                          onClick={() => window.open(file.previewUrl, "_blank")}
                          style={{ cursor: "pointer" }}
                          title="Click to view full size"
                        >
                          <img
                            src={file.previewUrl}
                            alt={`Preview ${file.fileName}`}
                            className="preview-image"
                            style={{ height: "100px" }}
                          />
                          <div className="preview-overlay"></div>
                        </div>
                      </div>
                    )}

                    {/* Non-image file indicator */}
                    {file.file && !file.isImage && (
                      <div className="file-type-indicator">
                        📄 {file.fileType || "Document"}
                      </div>
                    )}

                    {files.length > 1 && (
                      <button
                        type="button"
                        className="remove-file-btn"
                        onClick={() => {
                          // Clean up object URL before removing
                          if (
                            file.previewUrl &&
                            file.previewUrl.startsWith("blob:")
                          ) {
                            URL.revokeObjectURL(file.previewUrl);
                          }
                          removeFileUpload(file.id);
                        }}
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

            {/* Image Display Section */}
            <div className="form-section">
              <h2 className="form-section-title">Item Images</h2>

              {isViewingFixedAsset && selectedItem ? (
                <div className="image-preview-section">
                  <div className="image-preview-header">
                    <div>
                      {selectedItemImages.hasImages
                        ? `Found ${selectedItemImages.imageCount} image(s)`
                        : "Checking for images..."}
                    </div>
                    <button
                      type="button"
                      className="btn-action btn-small"
                      onClick={() => {
                        console.log("Reloading images for:", selectedItem);
                        loadFixedAssetImages(selectedItem);
                      }}
                      style={{
                        marginLeft: "auto",
                        backgroundColor: "#2196F3",
                        fontSize: "12px",
                        padding: "5px 10px",
                      }}
                    >
                      🔄 Reload
                    </button>
                  </div>

                  <div className="image-grid">
                    {[1, 2, 3, 4].map((imageNum) => {
                      const imageField = `Item${imageNum}Pic`;
                      const hasImage =
                        selectedItemImages.imagePaths &&
                        selectedItemImages.imagePaths[imageField];

                      if (hasImage) {
                        const previewKey = `${selectedItem?.ItemSerial}_${imageNum}`;
                        const previewUrl = imagePreviews[previewKey];
                        const imagePath =
                          selectedItemImages.imagePaths[imageField];

                        console.log(`Image ${imageNum}:`, {
                          hasImage: true,
                          previewKey,
                          hasPreviewUrl: !!previewUrl,
                          imagePath,
                        });

                        return (
                          <div key={imageNum} className="image-preview-item">
                            <div
                              className="image-thumbnail"
                              onClick={() => openImageModal(imageNum - 1)}
                              style={{
                                cursor: "pointer",
                                position: "relative",
                                overflow: "hidden",
                              }}
                              title={`Image ${imageNum}\nPath: ${imagePath}`}
                            >
                              {previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt={`Item Image ${imageNum}`}
                                  className="thumbnail-image"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover",
                                    transition: "transform 0.3s ease",
                                  }}
                                  onLoad={() =>
                                    console.log(
                                      `Image ${imageNum} loaded successfully`
                                    )
                                  }
                                  onError={(e) => {
                                    console.error(
                                      `Error loading image ${imageNum}`
                                    );
                                    e.target.style.display = "none";
                                    // Show fallback
                                    const container = e.target.parentElement;
                                    container.innerHTML = "";
                                    container.appendChild(
                                      <FallbackImage imageNumber={imageNum} />
                                    );
                                  }}
                                />
                              ) : (
                                <div
                                  className="image-loading"
                                  style={{
                                    width: "100%",
                                    height: "100%",
                                    display: "flex",
                                    flexDirection: "column",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    backgroundColor: "#f8f9fa",
                                  }}
                                >
                                  <div
                                    style={{
                                      width: "30px",
                                      height: "30px",
                                      border: "3px solid #f3f3f3",
                                      borderTop: "3px solid #3498db",
                                      borderRadius: "50%",
                                      animation: "spin 1s linear infinite",
                                      marginBottom: "10px",
                                    }}
                                  ></div>
                                  <div>Loading...</div>
                                </div>
                              )}
                            </div>
                            <div className="image-label">
                              Image {imageNum}
                              {imagePath && (
                                <div
                                  className="image-path"
                                  style={{
                                    fontSize: "10px",
                                    color: "#666",
                                    marginTop: "2px",
                                    wordBreak: "break-all",
                                    fontFamily: "monospace",
                                  }}
                                >
                                  {imagePath}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      }

                      // Show placeholder for images that don't exist
                      return (
                        <div key={imageNum} className="image-preview-item">
                          <div
                            className="image-thumbnail"
                            style={{
                              cursor: "not-allowed",
                              opacity: 0.5,
                            }}
                            title={`No image ${imageNum} uploaded`}
                          >
                            <FallbackImage imageNumber={imageNum} />
                          </div>
                          <div className="image-label">
                            Image {imageNum}
                            <div
                              style={{
                                fontSize: "10px",
                                color: "#999",
                                marginTop: "2px",
                              }}
                            >
                              Not uploaded
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="image-actions">
                    {isViewingFixedAsset && (
                      <div className="image-info-text">
                        Fixed Asset Images (View Only)
                        <div
                          style={{
                            fontSize: "11px",
                            color: "#666",
                            marginTop: "5px",
                          }}
                        >
                          Item Serial: {selectedItem?.ItemSerial}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : isViewingFixedAsset ? (
                <div className="no-images-message">No item selected</div>
              ) : (
                <div className="no-images-message">
                  Select an item from Browse to view images
                </div>
              )}
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
                  <div
                    style={{
                      display: "flex",
                      gap: "10px",
                      alignItems: "center",
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        name="grnNo"
                        value={formData.grnNo}
                        onChange={handleChange}
                        className="form-input"
                        placeholder="Select or generate GRN number"
                        required
                        readOnly
                        style={{ backgroundColor: "#f5f5f5" }}
                      />
                    </div>
                    <div style={{ width: "200px" }}>
                      <div className="select-wrapper">
                        <select
                          value={formData.grnNo || ""}
                          onChange={handleGrnNoChange}
                          className="form-select"
                          required
                          disabled={isGeneratingGrn}
                        >
                          <option value="">Select GRN</option>
                          <option value="new">New GRN</option>
                          {existingGrnNumbers.map((grn) => (
                            <option
                              key={grn.grn_no || grn.GrnNo}
                              value={grn.grn_no || grn.GrnNo}
                            >
                              {grn.grn_no || grn.GrnNo}
                            </option>
                          ))}
                        </select>
                        <div className="select-arrow"></div>
                      </div>
                    </div>
                  </div>
                  {isGeneratingGrn && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#666",
                        marginTop: "5px",
                      }}
                    >
                      Generating new GRN number...
                    </div>
                  )}
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
            <h2 className="form-section-title">
              Asset Allocation
              {formData.replicate &&
                assetRows.length === 1 &&
                ` (Ready to create ${formData.qty || 0} rows)`}
              {formData.replicate &&
                assetRows.length > 1 &&
                ` (${assetRows.length} items created)`}
            </h2>

            {formData.replicate && assetRows.length === 1 && (
              <div
                style={{
                  marginBottom: "10px",
                  color: "#2196F3",
                  fontSize: "14px",
                  padding: "8px",
                  backgroundColor: "#E3F2FD",
                  borderRadius: "4px",
                }}
              >
                <strong>Instructions:</strong>
                1. Fill details in the first row below.
                <br />
                2. Click the "+" button to create all {formData.qty || 0} asset
                rows at once.
              </div>
            )}

            {formData.replicate && assetRows.length > 1 && (
              <div
                style={{
                  marginBottom: "10px",
                  color: "#4CAF50",
                  fontSize: "14px",
                  padding: "8px",
                  backgroundColor: "#E8F5E9",
                  borderRadius: "4px",
                }}
              >
                <strong>✓ Success:</strong> Created {assetRows.length} asset
                rows from template.
              </div>
            )}

            <div className="asset-table-container">
              <table className="asset-allocation-table">
                <thead>
                  <tr>
                    <th>#</th>
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
                      <td style={{ textAlign: "center", fontWeight: "bold" }}>
                        {index + 1}
                      </td>
                      <td>
                        <div className="select-wrapper">
                          <select
                            value={row.center}
                            onChange={(e) =>
                              !isViewingFixedAsset &&
                              handleAssetChange(
                                row.id,
                                "center",
                                e.target.value
                              )
                            }
                            className="form-select table-select"
                            disabled={isViewingFixedAsset}
                          >
                            <option value="">Select Center</option>
                            {dropdownOptions.centers.map((center) => (
                              <option key={center.id} value={center.id}>
                                {center.name} ({center.id})
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
                              !isViewingFixedAsset &&
                              handleAssetChange(
                                row.id,
                                "location",
                                e.target.value
                              )
                            }
                            className="form-select table-select"
                            disabled={isViewingFixedAsset || !row.center}
                          >
                            <option value="">Select Location</option>
                            {getFilteredLocations(row.center).map(
                              (location) => (
                                <option key={location.id} value={location.id}>
                                  {location.name} ({location.id})
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
                              !isViewingFixedAsset &&
                              handleAssetChange(
                                row.id,
                                "department",
                                e.target.value
                              )
                            }
                            className="form-select table-select"
                            disabled={
                              isViewingFixedAsset ||
                              !row.center ||
                              !row.location
                            }
                          >
                            <option value="">Select Department</option>
                            {(() => {
                              const departments =
                                getFilteredDepartments(
                                  row.center,
                                  row.location
                                ) || [];
                              return departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.name} ({dept.id})
                                </option>
                              ));
                            })()}
                          </select>
                          <div className="select-arrow"></div>
                        </div>
                      </td>

                      <td>
                        <div className="select-wrapper">
                          <select
                            value={row.employee}
                            onChange={(e) =>
                              !isViewingFixedAsset &&
                              handleAssetChange(
                                row.id,
                                "employee",
                                e.target.value
                              )
                            }
                            className="form-select table-select"
                            disabled={isViewingFixedAsset || !row.department}
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
                            !isViewingFixedAsset &&
                            handleAssetChange(
                              row.id,
                              "serialNo",
                              e.target.value
                            )
                          }
                          className="form-input table-input"
                          placeholder="Serial No"
                          readOnly={isViewingFixedAsset}
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          value={row.bookNoLocalId}
                          onChange={(e) =>
                            !isViewingFixedAsset &&
                            handleAssetChange(
                              row.id,
                              "bookNoLocalId",
                              e.target.value
                            )
                          }
                          className="form-input table-input"
                          placeholder="Book No/Local ID"
                          readOnly={isViewingFixedAsset}
                        />
                      </td>

                      <td>
                        <input
                          type="text"
                          value={row.barcodeNo}
                          onChange={(e) =>
                            !isViewingFixedAsset &&
                            handleAssetChange(
                              row.id,
                              "barcodeNo",
                              e.target.value
                            )
                          }
                          className="form-input table-input"
                          placeholder="Barcode No"
                          readOnly={isViewingFixedAsset}
                        />
                      </td>

                      <td>
                        <div className="table-actions">
                          {!isViewingFixedAsset &&
                            index === assetRows.length - 1 && (
                              <button
                                type="button"
                                className="btn-action btn-add-small"
                                onClick={addAssetRow}
                                title={
                                  formData.replicate && assetRows.length === 1
                                    ? `Create ${
                                        formData.qty || 0
                                      } replicate rows`
                                    : "Add Row"
                                }
                                style={
                                  formData.replicate && assetRows.length === 1
                                    ? { backgroundColor: "#4CAF50" }
                                    : {}
                                }
                              >
                                <span className="btn-icon">+</span>
                                {formData.replicate &&
                                  assetRows.length === 1 && (
                                    <span
                                      style={{
                                        marginLeft: "5px",
                                        fontSize: "12px",
                                      }}
                                    >
                                      Create {formData.qty || 0} Rows
                                    </span>
                                  )}
                              </button>
                            )}

                          {!isViewingFixedAsset &&
                            !formData.replicate &&
                            assetRows.length > 1 && (
                              <button
                                type="button"
                                className="btn-action btn-remove"
                                onClick={() => removeAssetRow(row.id)}
                                title="Remove Row"
                              >
                                <span className="btn-icon">×</span>
                              </button>
                            )}

                          {isViewingFixedAsset && (
                            <span
                              className="view-only-info"
                              title="View Only - Fixed Asset"
                              style={{
                                color: "#666",
                                fontSize: "12px",
                                cursor: "help",
                                padding: "4px 8px",
                                backgroundColor: "#f5f5f5",
                                borderRadius: "4px",
                              }}
                            >
                              View Only
                            </span>
                          )}

                          {!isViewingFixedAsset &&
                            formData.replicate &&
                            assetRows.length > 1 && (
                              <span
                                className="replicate-info"
                                title="Replicate rows - cannot modify individually"
                                style={{
                                  color: "#666",
                                  fontSize: "12px",
                                  cursor: "help",
                                  padding: "4px 8px",
                                  backgroundColor: "#f5f5f5",
                                  borderRadius: "4px",
                                }}
                              >
                                Replicate
                              </span>
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
              {isViewingFixedAsset ? (
                <div
                  className="view-mode-indicator"
                  style={{
                    backgroundColor: "transparent",
                    color: "black",
                    padding: "20px 20px",
                    borderRadius: "4px",
                    fontWeight: "bold",
                  }}
                >
                  VIEW MODE
                </div>
              ) : (
                <>
                  <button
                    className="btn-action btn-save"
                    type="submit"
                    style={{
                      backgroundColor: isEditingMode ? "#2196F3" : "#019159",
                    }}
                  >
                    <span className="btn-icon">✓</span>
                    {isEditingMode ? "UPDATE" : "SAVE"}
                  </button>
                  {isEditingMode && (
                    <button
                      className="btn-action"
                      type="button"
                      style={{ backgroundColor: "#FF9800" }}
                      onClick={() => {
                        Swal.fire({
                          title: "Delete Confirmation",
                          html: `Are you sure you want to delete <strong>GRN ${formData.grnNo}</strong>?`,
                          icon: "warning",
                          showCancelButton: true,
                          confirmButtonColor: "#d33",
                          cancelButtonColor: "#3085d6",
                          confirmButtonText: "Yes, delete it!",
                          cancelButtonText: "Cancel",
                          reverseButtons: true,
                        }).then((result) => {
                          if (result.isConfirmed) {
                            handleDelete();
                          }
                        });
                      }}
                    >
                      <span className="btn-icon">🗑️</span>
                      DELETE
                    </button>
                  )}
                </>
              )}

              <button
                className="btn-action"
                type="button"
                style={{ backgroundColor: "#fd9d0a" }}
                onClick={openBrowseModal}
              >
                <span className="btn-icon">🔍</span>
                BROWSE
              </button>

              <button
                className="btn-action btn-cancel"
                type="button"
                style={{ backgroundColor: "#e75933" }}
                onClick={() => {
                  if (isEditingMode || isViewingFixedAsset || formData.grnNo) {
                    Swal.fire({
                      title: "Reset Form",
                      text: "Are you sure you want to reset the form? All unsaved changes will be lost.",
                      icon: "warning",
                      showCancelButton: true,
                      confirmButtonColor: "#e75933",
                      cancelButtonColor: "#3085d6",
                      confirmButtonText: "Yes, reset it!",
                      cancelButtonText: "Cancel",
                      reverseButtons: true,
                    }).then((result) => {
                      if (result.isConfirmed) {
                        handleReset();
                        Swal.fire({
                          icon: "success",
                          title: "Form Reset",
                          text: "Form has been reset successfully.",
                          confirmButtonColor: "#019159",
                          timer: 1500,
                          showConfirmButton: false,
                        });
                      }
                    });
                  } else {
                    handleReset();
                  }
                }}
              >
                <span className="btn-icon">✕</span>
                CANCEL
              </button>
            </div>

            <div className="form-info">
              <p className="info-text">
                <span className="required">*</span> Required fields
                {isEditingMode && !isViewingFixedAsset && (
                  <span
                    style={{
                      marginLeft: "20px",
                      color: "#2196F3",
                      fontWeight: "bold",
                    }}
                  >
                    EDITING MODE - GRN: {formData.grnNo}
                  </span>
                )}
                {isViewingFixedAsset && (
                  <span
                    style={{
                      marginLeft: "20px",
                      color: "#6c757d",
                      fontWeight: "bold",
                    }}
                  >
                    VIEW MODE - Fixed Asset (GRN: {formData.grnNo})
                  </span>
                )}
              </p>
            </div>
          </div>
        </form>
      </div>
      {/* Browse Modal */}

      {showBrowseModal && (
        <div className="modal-overlay" onClick={closeBrowseModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Browse Fixed Assets</h2>
              <button className="modal-close-btn" onClick={closeBrowseModal}>
                ×
              </button>
            </div>

            <div className="modal-content">
              {/* Search Section */}
              <div className="search-section">
                <div className="search-input-group">
                  <input
                    type="text"
                    className="search-input"
                    placeholder="Search by Item Code, Item Name, GRN No, Serial No, Barcode No, Center, Department..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={handleKeyPress}
                  />
                  <button
                    className="btn-action search-btn"
                    onClick={handleSearch}
                    style={{ backgroundColor: "#4CAF50" }}
                  >
                    <span className="btn-icon">🔍</span>
                    Search
                  </button>
                  <button
                    className="btn-action"
                    onClick={() => {
                      setSearchQuery("");
                      fetchSearchResults(1);
                    }}
                    style={{ backgroundColor: "#2196F3" }}
                  >
                    <span className="btn-icon">↺</span>
                    Clear
                  </button>
                </div>
                <div className="total-records">Total Records: {totalItems}</div>
              </div>

              {/* Results Table - Updated for fixed_asset_master */}
              <div className="results-table-container">
                {loading ? (
                  <div className="loading-spinner">Loading...</div>
                ) : (
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Item Code</th>
                        <th>Item Name</th>
                        <th>GRN No</th>
                        <th>Center</th>
                        <th>Department</th>
                        <th>Invoice No</th>
                        <th>Barcode No</th>
                        <th>Book No</th>
                        <th>Serial No</th>
                        <th>PO No</th>
                        <th>Status</th>
                        <th>Created Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.length > 0 ? (
                        searchResults.map((item, index) => (
                          <tr
                            key={item.ItemSerial || index}
                            className="result-row"
                            onClick={() => handleRowClick(item)}
                            style={{ cursor: "pointer" }}
                          >
                            <td>{item.ItemCode || "N/A"}</td>
                            <td>{item.ItemName || "N/A"}</td>
                            <td>{item.GrnNo || "N/A"}</td>
                            <td>
                              {item.center_name ||
                                item.Center ||
                                item.StationId ||
                                "N/A"}
                            </td>
                            <td>
                              {item.department_name ||
                                item.Department ||
                                item.DepartmentSerial ||
                                "N/A"}
                            </td>
                            <td>{item.InvoiceNo || "N/A"}</td>
                            <td>{item.BarcodeNo || "N/A"}</td>
                            <td>{item.BookNo || "N/A"}</td>
                            <td>{item.SerialNo || "N/A"}</td>
                            <td>{item.PONo || "N/A"}</td>
                            <td>
                              <span
                                className={`status-badge status-${
                                  item.Status || 0
                                }`}
                              >
                                {item.Status === 1
                                  ? "Approved"
                                  : item.Status === 0
                                  ? "Rejected"
                                  : "Pending"}
                              </span>
                            </td>
                            <td>
                              {formatDateForDisplay(item.CreatedAt) || "N/A"}
                            </td>
                            <td>
                              <button
                                className="btn-action btn-select"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRowClick(item);
                                }}
                                style={{
                                  backgroundColor: "#2196F3",
                                  padding: "4px 8px",
                                  fontSize: "12px",
                                }}
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="13" className="no-results">
                            No records found
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    ← Previous
                  </button>
                  <span className="page-info">
                    Page {currentPage} of {totalPages} (Showing{" "}
                    {searchResults.length} of {totalItems} records)
                  </span>
                  <button
                    className="pagination-btn"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    Next →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && selectedItemImages.hasImages && (
        <div className="image-modal-overlay" onClick={closeImageModal}>
          <div
            className="image-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">📸 Item Images</h2>
              {isViewingFixedAsset && (
                <span
                  style={{
                    fontSize: "14px",
                    color: "#ddd",
                    marginLeft: "10px",
                    fontStyle: "italic",
                  }}
                >
                  (Fixed Asset - View Only)
                </span>
              )}
              <button className="modal-close-btn" onClick={closeImageModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {loadingImage ? (
                <div className="modal-image-container">
                  <div className="loading-spinner">Loading image...</div>
                </div>
              ) : (
                <>
                  {/* Main Image Display - ADD THIS SECTION */}
                  <div className="main-image-container">
                    <div className="main-image-wrapper">
                      {(() => {
                        const currentImageNum = currentImageIndex + 1;
                        const imageField = `Item${currentImageNum}Pic`;

                        if (selectedItemImages.imagePaths[imageField]) {
                          const previewKey = `${
                            selectedItemSerials[0] || selectedItem?.ItemSerial
                          }_${currentImageNum}`;
                          const previewUrl = imagePreviews[previewKey];

                          if (previewUrl) {
                            return (
                              <img
                                src={previewUrl}
                                alt={`Item Image ${currentImageNum}`}
                                className="main-image"
                                onLoad={() => setLoadingImage(false)}
                                onError={(e) => {
                                  console.error(
                                    `Error loading image ${currentImageNum}:`,
                                    e
                                  );
                                  setLoadingImage(false);
                                  e.target.src = "/placeholder-image.jpg";
                                }}
                              />
                            );
                          } else {
                            // Try to load the image if preview is not available
                            setTimeout(() => {
                              if (isViewingFixedAsset && selectedItem) {
                                loadFixedAssetImagePreview(
                                  selectedItem,
                                  currentImageNum
                                );
                              } else if (selectedItemSerials[0]) {
                                loadImagePreview(
                                  selectedItemSerials[0],
                                  currentImageNum
                                );
                              }
                            }, 100);

                            return (
                              <div className="image-loading-placeholder">
                                <div className="loading-text">
                                  Loading Image {currentImageNum}...
                                </div>
                                <button
                                  type="button"
                                  className="btn-action btn-small"
                                  onClick={() => {
                                    if (isViewingFixedAsset && selectedItem) {
                                      loadFixedAssetImagePreview(
                                        selectedItem,
                                        currentImageNum
                                      );
                                    } else if (selectedItemSerials[0]) {
                                      loadImagePreview(
                                        selectedItemSerials[0],
                                        currentImageNum
                                      );
                                    }
                                  }}
                                  style={{ marginTop: "10px" }}
                                >
                                  Retry Load
                                </button>
                              </div>
                            );
                          }
                        }

                        return (
                          <div className="no-image-available">
                            Image {currentImageNum} not available
                          </div>
                        );
                      })()}
                    </div>
                  </div>

                  {/* Thumbnail Navigation */}
                  <div className="image-thumbnails-row">
                    {[1, 2, 3, 4].map((imageNum, index) => {
                      const imageField = `Item${imageNum}Pic`;
                      if (selectedItemImages.imagePaths[imageField]) {
                        const previewKey = `${
                          selectedItemSerials[0] || selectedItem?.ItemSerial
                        }_${imageNum}`;
                        const previewUrl = imagePreviews[previewKey];

                        return (
                          <div
                            key={imageNum}
                            className={`thumbnail-item ${
                              index === currentImageIndex ? "active" : ""
                            }`}
                            onClick={() => {
                              setCurrentImageIndex(index);
                              setLoadingImage(true);
                            }}
                          >
                            {previewUrl ? (
                              <img
                                src={previewUrl}
                                alt={`Thumbnail ${imageNum}`}
                                className="thumbnail-img"
                              />
                            ) : (
                              <div className="thumbnail-placeholder">
                                {imageNum}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Navigation Footer */}
            {selectedItemImages.imageCount > 1 && (
              <div className="modal-navigation">
                <button
                  className="nav-btn"
                  onClick={() => {
                    const newIndex =
                      currentImageIndex > 0
                        ? currentImageIndex - 1
                        : selectedItemImages.imageCount - 1;
                    setCurrentImageIndex(newIndex);
                    setLoadingImage(true);
                  }}
                  disabled={loadingImage}
                >
                  ← Previous
                </button>

                <div className="image-counter">
                  Image {currentImageIndex + 1} of{" "}
                  {selectedItemImages.imageCount}
                  {isViewingFixedAsset && " (Fixed Asset)"}
                </div>

                <button
                  className="nav-btn"
                  onClick={() => {
                    const newIndex =
                      currentImageIndex < selectedItemImages.imageCount - 1
                        ? currentImageIndex + 1
                        : 0;
                    setCurrentImageIndex(newIndex);
                    setLoadingImage(true);
                  }}
                  disabled={loadingImage}
                >
                  Next →
                </button>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Add CSS for modal */}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 20px;
        }

        .image-info-text {
          text-align: center;
          font-size: 12px;
          color: #666;
          margin-top: 10px;
          padding: 5px;
          background-color: #f8f9fa;
          border-radius: 4px;
        }

        .image-filename {
          word-break: break-all;
          font-size: 11px;
          color: #888;
          margin-top: 5px;
          padding: 0 10px;
        }

        .modal-container {
          background-color: white;
          border-radius: 8px;
          width: 95%;
          height: 90%;
          max-width: 1400px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          background-color: #2c3e50;
          color: white;
          padding: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          margin: 0;
          font-size: 1.5rem;
        }

        .modal-close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 2rem;
          cursor: pointer;
          line-height: 1;
        }

        .modal-content {
          flex: 1;
          padding: 20px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
        }

        .search-section {
          margin-bottom: 20px;
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 6px;
          border: 1px solid #dee2e6;
        }

        .search-input-group {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .search-input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .search-btn {
          white-space: nowrap;
        }

        .total-records {
          font-size: 14px;
          color: #666;
          font-weight: 500;
        }

        .results-table-container {
          flex: 1;
          overflow-y: auto;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          margin-bottom: 20px;
        }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }

        .results-table th {
          background-color: #f1f5f9;
          padding: 10px 6px;
          text-align: left;
          font-weight: 600;
          color: #334155;
          border-bottom: 2px solid #e2e8f0;
          position: sticky;
          top: 0;
          z-index: 10;
          font-size: 12px;
          white-space: nowrap;
        }

        .results-table td {
          padding: 8px 6px;
          border-bottom: 1px solid #e2e8f0;
          color: #475569;
          font-size: 11px;
        }

        .result-row:hover {
          background-color: #f8fafc;
          cursor: pointer;
        }

        .result-row:active {
          background-color: #e2e8f0;
        }

        .no-results {
          text-align: center;
          padding: 40px;
          color: #94a3b8;
          font-style: italic;
        }

        .loading-spinner {
          text-align: center;
          padding: 40px;
          color: #64748b;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 20px;
          padding: 15px;
          background-color: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #dee2e6;
        }

        .pagination-btn {
          padding: 8px 16px;
          background-color: #4caf50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .pagination-btn:disabled {
          background-color: #cccccc;
          cursor: not-allowed;
        }

        .page-info {
          font-size: 14px;
          font-weight: 500;
          color: #333;
        }

        .btn-select {
          white-space: nowrap;
          padding: 4px 12px;
          font-size: 12px;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .modal-container {
            width: 98%;
            height: 95%;
          }

          .search-input-group {
            flex-direction: column;
          }

          .results-table {
            font-size: 12px;
          }

          .results-table th,
          .results-table td {
            padding: 6px 4px;
          }

          /* Image Preview Styles */
          .image-preview-section {
            margin: 20px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #dee2e6;
          }

          .image-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }

          .image-preview-item {
            text-align: center;
          }

          .image-thumbnail {
            width: 150px;
            height: 150px;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid #dee2e6;
            background-color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
          }

          .thumbnail-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-loading {
            padding: 20px;
            text-align: center;
            color: #666;
          }

          .image-label {
            font-size: 14px;
            color: #495057;
            font-weight: 500;
          }

          .image-actions {
            text-align: center;
          }

          .no-images-message {
            text-align: center;
            padding: 40px;
            color: #6c757d;
            font-style: italic;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px dashed #dee2e6;
          }

          /* Image Modal Styles */
          .image-modal {
            max-width: 90%;
            max-height: 90%;
          }

          .image-modal-content {
            display: flex;
            flex-direction: column;
            height: calc(100% - 60px);
          }

          .image-display {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
            margin-bottom: 20px;
          }

          .full-image {
            max-width: 100%;
            max-height: 500px;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }

          .image-info {
            text-align: center;
            margin-top: 10px;
            color: #495057;
            font-size: 14px;
          }

          .image-navigation {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 20px;
            margin-bottom: 20px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }

          .nav-btn {
            padding: 8px 16px;
            background-color: #4caf50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 14px;
            transition: background-color 0.2s;
          }

          .nav-btn:hover:not(:disabled) {
            background-color: #45a049;
          }

          .nav-btn:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
          }

          .image-counter {
            font-weight: 600;
            color: #333;
            font-size: 16px;
          }

          .image-thumbnails-row {
            display: flex;
            justify-content: center;
            gap: 10px;
            padding: 15px;
            background-color: #f8f9fa;
            border-radius: 8px;
          }

          .thumbnail-item {
            width: 80px;
            height: 80px;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            border: 2px solid #dee2e6;
            transition: border-color 0.2s;
          }

          .thumbnail-item:hover,
          .thumbnail-item.active {
            border-color: #4caf50;
          }

          .thumbnail-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .thumbnail-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #e9ecef;
            color: #6c757d;
            font-weight: bold;
            font-size: 20px;
          }

          .image-slide {
            width: 100%;
            text-align: center;
          }

          .related-items-summary {
            margin-top: 30px;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #dee2e6;
          }

          .summary-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 15px;
            border-bottom: 2px solid #dee2e6;
          }

          .summary-header h3 {
            margin: 0;
            color: #2c3e50;
            font-size: 1.4rem;
          }

          .summary-icon {
            margin-right: 10px;
          }

          .item-count {
            margin-left: 10px;
            font-size: 1rem;
            color: #6c757d;
            font-weight: normal;
          }

          .summary-stats {
            display: flex;
            gap: 20px;
          }

          .stat-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            padding: 8px 15px;
            background-color: white;
            border-radius: 6px;
            border: 1px solid #dee2e6;
          }

          .stat-label {
            font-size: 12px;
            color: #6c757d;
            margin-bottom: 4px;
          }

          .stat-value {
            font-size: 18px;
            font-weight: bold;
          }

          .stat-value.total {
            color: #007bff;
          }

          .stat-value.approved {
            color: #28a745;
          }

          .stat-value.rejected {
            color: #dc3545;
          }

          .related-items-table {
            overflow-x: auto;
            max-height: 400px;
            overflow-y: auto;
          }

          .status-badge {
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            text-transform: uppercase;
          }

          .status-1 {
            background-color: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
          }

          .status-0 {
            background-color: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
          }

          .view-mode-indicator {
            background-color: #6c757d !important;
            cursor: not-allowed;
          }

          .form-input:read-only,
          .form-select:disabled,
          .form-textarea:read-only {
            background-color: #f8f9fa;
            cursor: not-allowed;
            opacity: 0.8;
          }
          /* Image Modal Styles */
          .image-modal-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.9);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 2000;
            padding: 20px;
          }

          .image-modal-content {
            background-color: #2c3e50;
            border-radius: 12px;
            width: 90%;
            height: 90%;
            max-width: 1200px;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
          }

          .image-modal-content .modal-header {
            background-color: rgba(0, 0, 0, 0.3);
            padding: 15px 20px;
          }

          .modal-body {
            flex: 1;
            display: flex;
            flex-direction: column;
            padding: 0;
            overflow: hidden;
          }

          .main-image-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
            background-color: #1a252f;
            overflow: hidden;
          }

          .main-image-wrapper {
            max-width: 100%;
            max-height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .main-image {
            max-width: 100%;
            max-height: 80vh;
            object-fit: contain;
            border-radius: 8px;
            box-shadow: 0 5px 20px rgba(0, 0, 0, 0.5);
            background-color: white;
            padding: 5px;
          }

          .image-loading-placeholder {
            text-align: center;
            color: #ecf0f1;
            padding: 40px;
            background-color: rgba(0, 0, 0, 0.2);
            border-radius: 8px;
            min-width: 300px;
            min-height: 300px;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .loading-text {
            font-size: 18px;
            margin-bottom: 20px;
            color: #bdc3c7;
          }

          .no-image-available {
            text-align: center;
            color: #95a5a6;
            font-style: italic;
            padding: 40px;
            background-color: rgba(0, 0, 0, 0.1);
            border-radius: 8px;
            min-width: 300px;
            min-height: 300px;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .image-thumbnails-row {
            display: flex;
            justify-content: center;
            gap: 15px;
            padding: 20px;
            background-color: rgba(0, 0, 0, 0.3);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }

          .thumbnail-item {
            width: 80px;
            height: 80px;
            border-radius: 6px;
            overflow: hidden;
            cursor: pointer;
            border: 3px solid transparent;
            transition: all 0.3s ease;
            background-color: #34495e;
          }

          .thumbnail-item:hover {
            border-color: #3498db;
            transform: translateY(-2px);
          }

          .thumbnail-item.active {
            border-color: #2ecc71;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(46, 204, 113, 0.3);
          }

          .thumbnail-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .thumbnail-placeholder {
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #34495e, #2c3e50);
            color: #ecf0f1;
            font-weight: bold;
            font-size: 24px;
          }

          .modal-navigation {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 15px 20px;
            background-color: rgba(0, 0, 0, 0.4);
            border-top: 1px solid rgba(255, 255, 255, 0.1);
          }

          .nav-btn {
            padding: 10px 20px;
            background-color: #3498db;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 600;
            transition: background-color 0.2s;
            min-width: 120px;
          }

          .nav-btn:hover:not(:disabled) {
            background-color: #2980b9;
          }

          .nav-btn:disabled {
            background-color: #7f8c8d;
            cursor: not-allowed;
            opacity: 0.7;
          }

          .image-counter {
            font-weight: 600;
            color: #ecf0f1;
            font-size: 16px;
          }

          /* Close button styling */
          .image-modal-content .modal-close-btn {
            background-color: rgba(231, 76, 60, 0.8);
            border-radius: 50%;
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background-color 0.2s;
          }

          .image-modal-content .modal-close-btn:hover {
            background-color: #e74c3c;
          }

          /* Responsive adjustments for image modal */
          @media (max-width: 768px) {
            .image-modal-content {
              width: 95%;
              height: 95%;
            }

            .main-image {
              max-height: 60vh;
            }

            .thumbnail-item {
              width: 60px;
              height: 60px;
            }

            .nav-btn {
              padding: 8px 15px;
              min-width: 100px;
              font-size: 12px;
            }

            .image-counter {
              font-size: 14px;
            }
          }
          /* Image Preview Styles */
          .image-preview-section {
            margin: 20px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #dee2e6;
          }

          .image-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }

          .image-preview-item {
            text-align: center;
            transition: transform 0.2s;
          }

          .image-preview-item:hover {
            transform: translateY(-5px);
          }

          .image-thumbnail {
            width: 150px;
            height: 150px;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid #dee2e6;
            background-color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 10px;
            cursor: pointer;
            transition: border-color 0.2s;
          }

          .image-thumbnail:hover {
            border-color: #4caf50;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          }

          .thumbnail-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .image-label {
            font-size: 14px;
            color: #495057;
            font-weight: 500;
          }

          .no-images-message {
            text-align: center;
            padding: 40px;
            color: #6c757d;
            font-style: italic;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px dashed #dee2e6;
          }
          /* Image Preview Header */
          .image-preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding: 10px;
            background-color: #e9ecef;
            border-radius: 6px;
            font-weight: 500;
          }

          /* Loading spinner */
          .loading-spinner-small {
            width: 40px;
            height: 40px;
            border: 3px solid #f3f3f3;
            border-top: 3px solid #3498db;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 10px;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          /* Image loading state */
          .image-loading {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            padding: 20px;
            text-align: center;
            color: #666;
          }

          .image-loading button {
            font-size: 12px;
            padding: 4px 8px;
          }

          /* Image path */
          .image-path {
            font-family: monospace;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }

          /* Debug info */
          .image-debug-info {
            background-color: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 4px;
            padding: 10px;
            margin-top: 10px;
          }

          .image-debug-info div {
            margin-bottom: 5px;
          }

          /* No images message */
          .no-images-message {
            text-align: center;
            padding: 40px;
            color: #6c757d;
            font-style: italic;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px dashed #dee2e6;
            display: flex;
            flex-direction: column;
            align-items: center;
          }

          .no-images-message button {
            font-size: 14px;
            padding: 6px 12px;
          }

          @keyframes spin {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }

          .image-preview-section {
            margin: 20px 0;
            padding: 20px;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px solid #dee2e6;
            transition: all 0.3s ease;
          }

          .image-grid {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
            gap: 20px;
            margin-bottom: 20px;
          }

          .image-preview-item {
            text-align: center;
            transition: transform 0.2s ease;
          }

          .image-preview-item:hover {
            transform: translateY(-5px);
          }

          .image-thumbnail {
            width: 150px;
            height: 150px;
            border-radius: 8px;
            overflow: hidden;
            border: 2px solid #dee2e6;
            background-color: white;
            margin: 0 auto 10px;
            transition: border-color 0.2s ease, box-shadow 0.2s ease;
          }

          .image-thumbnail:hover {
            border-color: #4caf50;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          }

          .thumbnail-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
            transition: transform 0.3s ease;
          }

          .thumbnail-image:hover {
            transform: scale(1.05);
          }

          .image-label {
            font-size: 14px;
            color: #495057;
            font-weight: 500;
            word-break: break-word;
          }

          .no-images-message {
            text-align: center;
            padding: 40px;
            color: #6c757d;
            font-style: italic;
            background-color: #f8f9fa;
            border-radius: 8px;
            border: 1px dashed #dee2e6;
          }

          .image-preview-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding: 15px;
            background-color: #e9ecef;
            border-radius: 6px;
            font-weight: 500;
          }

          .image-info-text {
            text-align: center;
            font-size: 12px;
            color: #666;
            margin-top: 10px;
            padding: 10px;
            background-color: #f8f9fa;
            border-radius: 4px;
            border: 1px solid #dee2e6;
          }
          .file-preview-container {
            margin-top: 10px;
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 5px;
          }

          .image-preview-thumbnail {
            position: relative;
            width: 100px;
            height: 100px;
            border-radius: 6px;
            overflow: hidden;
            border: 2px solid #dee2e6;
            background-color: #f8f9fa;
          }

          .preview-image {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .preview-overlay {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s ease;
          }

          .image-preview-thumbnail:hover .preview-overlay {
            opacity: 1;
          }

          .preview-icon {
            color: white;
            font-size: 20px;
            font-weight: bold;
          }

          .file-type-indicator {
            font-size: 12px;
            color: #666;
            background-color: #f0f0f0;
            padding: 2px 8px;
            border-radius: 12px;
            margin-top: 5px;
          }

          /* Add to existing .file-uploads-section styles */
          .file-uploads-section .file-upload-group {
            padding: 15px;
            background-color: #f9f9f9;
            border-radius: 8px;
            border: 1px solid #eee;
            margin-bottom: 15px;
          }

          .file-input-wrapper {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .file-name {
            color: #333;
            font-weight: 500;
            word-break: break-all;
          }
        }
      `}</style>
    </div>
  );
};

export default ItemGRN;
