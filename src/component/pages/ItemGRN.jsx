import React, { useState, useEffect } from "react";
import "../../css/ItemGRN.css";

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
      ]);
    };

    initializeDropdowns();
    fetchExistingGrnNumbers();
  }, []);

  useEffect(() => {
    return () => {
      // Clean up object URLs to prevent memory leaks
      Object.values(imagePreviews).forEach((url) => {
        if (url && url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
  }, [imagePreviews]);

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

  // Load item images
  const loadItemImages = async (itemSerial) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/item-grn/${itemSerial}/check-images`
      );
      const result = await response.json();

      if (result.success) {
        setSelectedItemImages({
          hasImages: result.data.count > 0,
          imageCount: result.data.count,
          imagePaths: result.data.has_images,
        });
      } else {
        setSelectedItemImages({
          hasImages: false,
          imageCount: 0,
          imagePaths: {},
        });
      }
    } catch (error) {
      console.error("Error loading item images:", error);
      setSelectedItemImages({
        hasImages: false,
        imageCount: 0,
        imagePaths: {},
      });
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

  // Get image URL
  const getImageUrl = (itemSerial, imageNumber) => {
    return `http://localhost:3000/api/item-grn/${itemSerial}/images/${imageNumber}`;
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
      }
    } catch (error) {
      console.error(`Error loading image ${imageNumber}:`, error);
    }

    return null;
  };

  // Auto-load image previews when images are available
  useEffect(() => {
    if (
      isEditingMode &&
      selectedItemImages.hasImages &&
      selectedItemSerials[0]
    ) {
      const itemSerial = selectedItemSerials[0];

      // Load all available images
      [1, 2, 3, 4].forEach((imageNum) => {
        if (selectedItemImages.imagePaths[`Item${imageNum}Pic`]) {
          loadImagePreview(itemSerial, imageNum);
        }
      });
    }
  }, [isEditingMode, selectedItemImages.hasImages, selectedItemSerials]);

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
          alert(
            `GRN number ${newGrnNo} already exists. Please select it from the dropdown.`
          );
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
        alert("Error generating GRN number: " + result.message);
      }
    } catch (error) {
      console.error("Error generating GRN number:", error);
      alert("Error generating GRN number. Please try again.");
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
        alert("Please enter a valid quantity first.");
        return;
      }

      const firstRow = assetRows[0];
      if (!firstRow.center || !firstRow.department || !firstRow.serialNo) {
        alert(
          "Please fill in Center, Department, and Serial No in the first row before creating replicate rows."
        );
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
      alert(
        "Cannot remove individual rows in Replicate mode. Uncheck Replicate first to remove rows."
      );
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
      const response = await fetch(
        `http://localhost:3000/api/item-grn?page=${page}&limit=${itemsPerPage}&search=${encodeURIComponent(
          searchQuery
        )}`
      );
      const result = await response.json();

      if (result.success) {
        setSearchResults(result.data || []);
        setTotalPages(result.pagination?.pages || 1);
        setTotalItems(result.pagination?.total || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error("Error fetching search results:", error);
      alert("Error fetching data. Please try again.");
    } finally {
      setLoading(false);
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
      alert("No item selected to delete.");
      return;
    }

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedItemSerials.length} item(s) with GRN ${formData.grnNo}?`
      )
    ) {
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
          alert(`${selectedItemSerials.length} item(s) deleted successfully!`);
          handleReset();
        } else {
          alert("Some items could not be deleted. Please try again.");
        }
      } catch (error) {
        console.error("Error deleting items:", error);
        alert("Error deleting items. Please try again.");
      }
    }
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
  const handleRowClick = async (item) => {
    try {
      // Get the GRN number from the clicked item
      const grnNo = item.GrnNo;

      if (!grnNo) {
        alert("No GRN number found for this item");
        return;
      }

      // Fetch all items with this GRN number
      const response = await fetch(
        `http://localhost:3000/api/item-grn/by-grn/${grnNo}`
      );
      const result = await response.json();

      if (result.success) {
        const grnData = result.data;
        setSelectedItem(grnData);
        setSelectedGrnData(grnData);

        const itemSerials = grnData.items.map((item) => item.item_serial);
        setSelectedItemSerials(itemSerials);

        const firstItem = grnData.items[0];
        const commonInfo = grnData.common_info;
        const itemCount = grnData.total_items;

        const formatDateForInput = (dateString) => {
          if (!dateString) return "";
          try {
            const date = new Date(dateString);
            if (isNaN(date.getTime())) return "";
            return date.toISOString().split("T")[0];
          } catch (error) {
            console.error("Error formatting date:", dateString, error);
            return "";
          }
        };

        if (grnData.items && grnData.items.length > 0) {
          const firstItemSerial = grnData.items[0].item_serial;
          await loadItemImages(firstItemSerial);

          // Preload first image if available
          if (result.data.has_images) {
            setTimeout(async () => {
              // Load departments for each unique center/location combination
              const uniqueCombinations = new Set();
              assetRowsData.forEach((row) => {
                if (row.center && row.location) {
                  uniqueCombinations.add(`${row.center}_${row.location}`);
                }
              });

              // Load all departments
              const deptPromises = Array.from(uniqueCombinations).map(
                async (combo) => {
                  const [centerId, locationId] = combo.split("_");
                  return await loadFilteredDepartmentsForLocation(
                    centerId,
                    locationId
                  );
                }
              );

              try {
                const allDeptsArrays = await Promise.all(deptPromises);
                const allDepartments = allDeptsArrays.flat();

                setFilteredDepartments((prev) => {
                  const newDepartments = [...prev];
                  allDepartments.forEach((dept) => {
                    if (!newDepartments.some((d) => d.id === dept.id)) {
                      newDepartments.push(dept);
                    }
                  });
                  return newDepartments;
                });
              } catch (error) {
                console.error("Error loading departments:", error);
              }
            }, 100);
          }
        }

        // IMPORTANT: Find the matching middle category from dropdownOptions
        const middleCategoryFromApi = firstItem.middle_category_id;
        let mappedMiddleCategory = "";

        // Try to find matching middle category by middle_category_id from API
        const foundMiddleCategory = dropdownOptions.middleCategories.find(
          (cat) => cat.middleCategoryId === middleCategoryFromApi
        );

        if (foundMiddleCategory) {
          mappedMiddleCategory = foundMiddleCategory.id.toString();
        } else {
          // If not found by middleCategoryId, try by id
          const foundById = dropdownOptions.middleCategories.find(
            (cat) => cat.id.toString() === middleCategoryFromApi
          );
          if (foundById) {
            mappedMiddleCategory = foundById.id.toString();
          } else {
            console.warn(
              "Middle category not found in dropdown:",
              middleCategoryFromApi
            );
            // Set as is and let the user see it's not matching
            mappedMiddleCategory = middleCategoryFromApi;
          }
        }

        // IMPORTANT: Find the matching sub category from dropdownOptions
        const subCategoryFromApi = firstItem.sub_category_id;
        let mappedSubCategory = "";

        // First filter subcategories by the selected middle category
        const filteredSubCats = dropdownOptions.subCategories.filter(
          (subCat) => {
            // Try to match by middleCategoryId
            return (
              subCat.middleCategoryId == mappedMiddleCategory ||
              subCat.id == mappedMiddleCategory ||
              // Also check if this subcategory belongs to the found middle category
              (foundMiddleCategory &&
                subCat.middleCategoryId == foundMiddleCategory.middleCategoryId)
            );
          }
        );

        // Now find the specific subcategory
        const foundSubCategory =
          filteredSubCats.find(
            (sub) => sub.subCategoryId === subCategoryFromApi
          ) ||
          filteredSubCats.find(
            (sub) => sub.id.toString() === subCategoryFromApi
          );

        if (foundSubCategory) {
          mappedSubCategory = foundSubCategory.id.toString();
        } else {
          console.warn(
            "Sub category not found in dropdown:",
            subCategoryFromApi
          );
          mappedSubCategory = subCategoryFromApi;
        }

        // Map backend data to frontend form structure
        const formDataUpdate = {
          // Left Column - Section 1
          middleCategory: mappedMiddleCategory,
          subCategory: mappedSubCategory,
          itemName: firstItem.item_name || "",
          poNo: commonInfo.po_no || "",
          brand: commonInfo.brand || "",
          model: firstItem.model || "",

          // Right Column - Section 1
          supplier: commonInfo.supplier || "",
          qty: itemCount.toString(),
          date: formatDateForInput(commonInfo.purchase_date),
          invoiceNo: commonInfo.invoice_no || "",
          unitPrice: commonInfo.unit_price || "",
          invTotal: commonInfo.invoice_total || "",

          // Left Column - Section 3
          manufacturer: commonInfo.manufacture || "",
          type: commonInfo.type || "",
          source: commonInfo.source || "",
          receiveType: commonInfo.in_type || "",
          remarks: commonInfo.remarks || "",

          // Right Column - Section 3
          grnDate: formatDateForInput(commonInfo.grn_date),
          grnNo: grnData.grn_no || "",
          warrantyExp: formatDateForInput(commonInfo.warranty_expire_date),
          serviceStart: formatDateForInput(
            commonInfo.service_agreement_start_date
          ),
          serviceEnd: formatDateForInput(commonInfo.service_agreement_end_date),
          salvageValue: commonInfo.salvage_value || "",

          // Checkbox
          replicate: itemCount > 1 ? true : false,
        };

        setFormData(formDataUpdate);

        // Create asset allocation rows for ALL items
        const assetRowsData = grnData.items.map((itemData, index) => {
          const assetRowsData = grnData.items.map((itemData, index) => {
            const centerId = itemData.center_id || itemData.station_id || "";
            const location = itemData.location || "";
            const departmentId = itemData.department_serial || "";
            const employeeId = itemData.employee_serial || "";

            return {
              id: itemData.item_serial || index + 1,
              center: centerId,
              location: location,
              department: departmentId,
              employee: employeeId?.toString() || "",
              serialNo: itemData.serial_no || "",
              bookNoLocalId: itemData.book_no || "",
              barcodeNo: itemData.barcode_no || "",
            };
          });

          setAssetRows(assetRowsData);

          // Load filtered data for each row after setting state
          setTimeout(() => {
            assetRowsData.forEach((row, index) => {
              if (row.center) {
                // Load locations for this center
                loadFilteredLocationsForCenter(row.center).then((locations) => {
                  setFilteredLocations((prev) => {
                    const newLocations = [...prev];
                    // Add locations for this specific center
                    locations.forEach((loc) => {
                      if (!newLocations.find((l) => l.id === loc.id)) {
                        newLocations.push(loc);
                      }
                    });
                    return newLocations;
                  });
                });

                if (row.location) {
                  // Load departments for this center/location
                  loadFilteredDepartmentsForLocation(
                    row.center,
                    row.location
                  ).then((depts) => {
                    setFilteredDepartments((prev) => {
                      const newDepartments = [...prev];
                      depts.forEach((dept) => {
                        if (!newDepartments.find((d) => d.id === dept.id)) {
                          newDepartments.push(dept);
                        }
                      });
                      return newDepartments;
                    });
                  });
                }
              }
            });
          }, 100);
          // Get center ID - check both center_id and station_id
          const centerId = itemData.center_id || itemData.station_id || "";

          // Find matching center in dropdown
          const matchedCenter = dropdownOptions.centers.find(
            (center) => center.id === centerId || center.name.includes(centerId)
          );

          // Get location
          const location = itemData.location || "";

          // Find matching location in filtered locations
          const filteredLocs = getFilteredLocations(
            matchedCenter?.id || centerId
          );
          const matchedLocation = filteredLocs.find(
            (loc) => loc.id === location || loc.name.includes(location)
          );

          // Get department
          const departmentId = itemData.department_serial || "";

          // Find matching department
          const filteredDepts = getFilteredDepartments(
            matchedCenter?.id || centerId,
            matchedLocation?.id || location
          );
          const matchedDepartment = filteredDepts.find(
            (dept) =>
              dept.id === departmentId || dept.name.includes(departmentId)
          );

          // Get employee
          const employeeId = itemData.employee_serial || "";

          // Find matching employee
          const filteredEmps = getFilteredEmployees(
            matchedDepartment?.id || departmentId
          );
          const matchedEmployee = filteredEmps.find(
            (emp) => emp.id.toString() === employeeId.toString()
          );

          return {
            id: index + 1,
            center: matchedCenter?.id || centerId || "",
            location: matchedLocation?.id || location || "",
            department: matchedDepartment?.id || departmentId || "",
            employee:
              matchedEmployee?.id?.toString() || employeeId?.toString() || "",
            serialNo: itemData.serial_no || "",
            bookNoLocalId: itemData.book_no || "",
            barcodeNo: itemData.barcode_no || "",
          };
        });

        setAssetRows(assetRowsData);
        setIsEditingMode(true);

        if (
          !existingGrnNumbers.some(
            (grn) =>
              grn.grn_no === grnData.grn_no || grn.GrnNo === grnData.grn_no
          )
        ) {
          setExistingGrnNumbers((prev) => [
            { grn_no: grnData.grn_no, GrnNo: grnData.grn_no },
            ...prev,
          ]);
        }

        closeBrowseModal();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } catch (error) {
      console.error("Error fetching item details:", error);
      alert("Error loading item details. Please try again.");
    }
  };

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
      alert(`Please fill in the following required fields: ${fieldNames}`);
      return;
    }

    if (formData.replicate) {
      const quantity = parseInt(formData.qty) || 0;
      if (assetRows.length !== quantity) {
        alert(
          `When Replicate is checked, you need exactly ${quantity} asset allocation rows. Currently you have ${assetRows.length} rows. Please click the "+" button to create all ${quantity} rows.`
        );
        return;
      }

      const invalidRows = assetRows.filter(
        (row) => !row.center || !row.department || !row.serialNo
      );

      if (invalidRows.length > 0) {
        alert(
          `Please fill in Center, Department, and Serial No for all ${quantity} asset allocation rows.`
        );
        return;
      }
    }

    try {
      const formDataToSend = new FormData();

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
        alert(
          `Item GRN saved successfully! ${
            result.data.is_existing
              ? "Added to existing GRN"
              : "New GRN created"
          }`
        );
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

  // Handle update form submission
  const handleUpdate = async (e) => {
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
      alert(`Please fill in the following required fields: ${fieldNames}`);
      return;
    }

    if (formData.replicate) {
      const quantity = parseInt(formData.qty) || 0;
      if (assetRows.length !== quantity) {
        alert(
          `When Replicate is checked, you need exactly ${quantity} asset allocation rows. Currently you have ${assetRows.length} rows.`
        );
        return;
      }

      const invalidRows = assetRows.filter(
        (row) => !row.center || !row.department || !row.serialNo
      );

      if (invalidRows.length > 0) {
        alert(
          `Please fill in Center, Department, and Serial No for all ${quantity} asset allocation rows.`
        );
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

      // Send update request with GRN number
      const response = await fetch(
        `http://localhost:3000/api/item-grn/by-grn/${grnNo}/update-all`,
        {
          method: "PUT",
          body: updateData,
          // Note: Do NOT set Content-Type header for FormData
        }
      );

      const result = await response.json();
      console.log("Update response:", result);

      // Restore button state
      saveButton.innerHTML = originalText;
      saveButton.disabled = false;

      if (result.success) {
        alert(
          `${result.data.updated_count || 1} item(s) updated successfully!\n` +
            `GRN: ${grnNo}\n` +
            `Items updated: ${result.data.updated_count}`
        );
        handleReset();
      } else {
        alert("Error: " + result.message);
        if (result.errors) {
          console.log("Validation errors:", result.errors);
        }
      }
    } catch (error) {
      console.error("Error updating form:", error);
      alert("Error updating form. Please try again.");

      // Restore button state in case of error
      const saveButton = e.target.querySelector('button[type="submit"]');
      if (saveButton) {
        saveButton.innerHTML = '<span class="btn-icon">✓</span> UPDATE';
        saveButton.disabled = false;
      }
    }
  };

  // Handle form submission (create or update)
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isEditingMode) {
      await handleUpdate(e);
    } else {
      await handleCreate(e);
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
                    >
                      Selected:{" "}
                      {findMiddleCategoryById(formData.middleCategory)?.name ||
                        `ID: ${formData.middleCategory} (Not found in dropdown)`}
                    </div>
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
                    >
                      Selected:{" "}
                      {findSubCategoryById(
                        formData.subCategory,
                        formData.middleCategory
                      )?.name ||
                        `ID: ${formData.subCategory} (Not found in dropdown)`}
                    </div>
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

            {/* Image Display Section */}
            <div className="form-section">
              <h2 className="form-section-title">Item Images</h2>

              {isEditingMode && selectedItemImages.hasImages ? (
                <div className="image-preview-section">
                  <div className="image-grid">
                    {[1, 2, 3, 4].map((imageNum) => {
                      if (selectedItemImages.imagePaths[`Item${imageNum}Pic`]) {
                        const imageUrl = getImageUrl(
                          selectedItemSerials[0] || selectedItem?.ItemSerial,
                          imageNum
                        );
                        const previewKey = `${
                          selectedItemSerials[0] || selectedItem?.ItemSerial
                        }_${imageNum}`;
                        const previewUrl = imagePreviews[previewKey];

                        return (
                          <div key={imageNum} className="image-preview-item">
                            <div
                              className="image-thumbnail"
                              onClick={() => openImageModal(imageNum - 1)}
                              style={{ cursor: "pointer" }}
                            >
                              {previewUrl ? (
                                <img
                                  src={previewUrl}
                                  alt={`Item Image ${imageNum}`}
                                  className="thumbnail-image"
                                  onError={(e) => {
                                    e.target.src = "/placeholder-image.jpg";
                                  }}
                                />
                              ) : (
                                <div className="image-loading">
                                  Loading Image {imageNum}...
                                  <button
                                    type="button"
                                    className="btn-action btn-small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      loadImagePreview(
                                        selectedItemSerials[0],
                                        imageNum
                                      );
                                    }}
                                  >
                                    Load
                                  </button>
                                </div>
                              )}
                            </div>
                            <div className="image-label">Image {imageNum}</div>
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <div className="image-actions"></div>
                </div>
              ) : isEditingMode ? (
                <div className="no-images-message">
                  No images uploaded for this item
                </div>
              ) : null}
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
                              handleAssetChange(
                                row.id,
                                "department",
                                e.target.value
                              )
                            }
                            className="form-select table-select"
                            disabled={!row.center || !row.location}
                          >
                            <option value="">Select Department</option>
                            {(() => {
                              // Get filtered departments - ensure it's always an array
                              const departments =
                                getFilteredDepartments(
                                  row.center,
                                  row.location
                                ) || [];

                              // If no departments found and we have a department ID set
                              if (departments.length === 0 && row.department) {
                                // Try to find the department in all available departments
                                const allDepts = [
                                  ...dropdownOptions.departments,
                                  ...filteredDepartments,
                                ];
                                const foundDept = allDepts.find(
                                  (d) => d.id === row.department
                                );

                                if (foundDept) {
                                  // Return the found department plus an empty option
                                  return [
                                    <option
                                      key={foundDept.id}
                                      value={foundDept.id}
                                    >
                                      {foundDept.name} ({foundDept.id})
                                    </option>,
                                    <option key="empty" value="">
                                      Select Department
                                    </option>,
                                  ];
                                }
                              }

                              // Map departments to options
                              return departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                  {dept.name} ({dept.id})
                                </option>
                              ));
                            })()}
                          </select>
                          <div className="select-arrow"></div>
                        </div>
                        {row.department && (
                          <div
                            className="field-info"
                            style={{
                              fontSize: "12px",
                              color: "#666",
                              marginTop: "5px",
                            }}
                          ></div>
                        )}
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
                              title={
                                formData.replicate && assetRows.length === 1
                                  ? `Create ${formData.qty || 0} replicate rows`
                                  : "Add Row"
                              }
                              style={
                                formData.replicate && assetRows.length === 1
                                  ? { backgroundColor: "#4CAF50" }
                                  : {}
                              }
                            >
                              <span className="btn-icon">+</span>
                              {formData.replicate && assetRows.length === 1 && (
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

                          {!formData.replicate && assetRows.length > 1 && (
                            <button
                              type="button"
                              className="btn-action btn-remove"
                              onClick={() => removeAssetRow(row.id)}
                              title="Remove Row"
                            >
                              <span className="btn-icon">×</span>
                            </button>
                          )}

                          {formData.replicate && assetRows.length > 1 && (
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
                    if (
                      window.confirm(
                        "Are you sure you want to delete this item?"
                      )
                    ) {
                      handleDelete();
                    }
                  }}
                >
                  <span className="btn-icon">🗑️</span>
                  DELETE
                </button>
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
                onClick={handleReset}
              >
                <span className="btn-icon">✕</span>
                CANCEL
              </button>
            </div>

            <div className="form-info">
              <p className="info-text">
                <span className="required">*</span> Required fields
                {isEditingMode && (
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
              <h2 className="modal-title">Browse Item GRN Records</h2>
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
                    placeholder="Search by Item Name, Invoice No, GRN No, Serial No, Barcode No, PONo, Manufacture..."
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

              {/* Results Table */}
              <div className="results-table-container">
                {loading ? (
                  <div className="loading-spinner">Loading...</div>
                ) : (
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Item Serial</th>
                        <th>Center</th>
                        <th>Department</th>
                        <th>Invoice No</th>
                        <th>Item Name</th>
                        <th>GRN No</th>
                        <th>Barcode No</th>
                        <th>Book No</th>
                        <th>Serial No</th>
                        <th>PO No</th>
                        <th>Created Date</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchResults.length > 0 ? (
                        searchResults.map((item) => (
                          <tr
                            key={item.id || item.ItemSerial || index}
                            className="result-row"
                            onClick={() => handleRowClick(item)}
                            style={{ cursor: "pointer" }}
                          >
                            <td>{item.ItemSerial || "N/A"}</td>
                            <td>{item.StationId || "N/A"}</td>
                            <td>{item.DepartmentSerial || "N/A"}</td>
                            <td>{item.InvoiceNo || "N/A"}</td>
                            <td>{item.ItemName || "N/A"}</td>
                            <td>{item.GrnNo || "N/A"}</td>
                            <td>{item.BarcodeNo || "N/A"}</td>
                            <td>{item.BookNo || "N/A"}</td>
                            <td>{item.SerialNo || "N/A"}</td>
                            <td>{item.PONo || "N/A"}</td>
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
                          <td colSpan="12" className="no-results">
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
                    Page {currentPage} of {totalPages}
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
              <button className="modal-close-btn" onClick={closeImageModal}>
                ×
              </button>
            </div>

            <div className="modal-body">
              {loadingImage ? (
                <div className="modal-image-container">
                  <div className="loading-spinner"></div>
                </div>
              ) : (
                <>
                  <div className="modal-image-container">
                    {[1, 2, 3, 4].map((imageNum, index) => {
                      if (selectedItemImages.imagePaths[`Item${imageNum}Pic`]) {
                        const imageUrl = getImageUrl(
                          selectedItemSerials[0] || selectedItem?.ItemSerial,
                          imageNum
                        );

                        return (
                          <div
                            key={imageNum}
                            className="image-slide"
                            style={{
                              display:
                                index === currentImageIndex ? "block" : "none",
                            }}
                          >
                            <img
                              src={imageUrl}
                              alt={`Item Image ${imageNum}`}
                              className="modal-image"
                              onLoad={() => setLoadingImage(false)}
                              onError={(e) => {
                                console.error(
                                  `Error loading image ${imageNum}`
                                );
                                e.target.src = "/placeholder-image.jpg";
                                setLoadingImage(false);
                              }}
                            />
                          </div>
                        );
                      }
                      return null;
                    })}
                  </div>

                  {/* Thumbnail Navigation */}
                  <div className="image-thumbnails-row">
                    {[1, 2, 3, 4].map((imageNum, index) => {
                      if (selectedItemImages.imagePaths[`Item${imageNum}Pic`]) {
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
        }
      `}</style>
    </div>
  );
};

export default ItemGRN;
