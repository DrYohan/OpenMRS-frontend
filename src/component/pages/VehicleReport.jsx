import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../css/Report.css";

const VehicleReport = () => {
  const [filters, setFilters] = useState({
    station: "All",
    location: "All",
    employee: "All",
    mainCategory: "All",
    subCategory: "All",
    center: "All",
    department: "All",
    middleCategory: "All",
  });

  const [dropdownOptions, setDropdownOptions] = useState({
    stations: [],
    locations: [],
    employees: [
      { id: 1, name: "Employee 1" },
      { id: 2, name: "Employee 2" },
      { id: 3, name: "Employee 3" },
    ],
    mainCategories: [],
    middleCategories: [],
    subCategories: [],
    centers: [],
    departments: [],
  });

  const [assets, setAssets] = useState([]);
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [pdfPreview, setPdfPreview] = useState({
    show: false,
    pdfUrl: null,
    pdfData: null,
    pdfBlob: null,
  });

  // API Base URL
  const API_URL = "http://localhost:3000/api";

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [
        stationsRes,
        centersRes,
        locationsRes,
        departmentsRes,
        mainCatsRes,
        midCatsRes,
        subCatsRes,
        assetsRes,
      ] = await Promise.all([
        axios.get(`${API_URL}/station`),
        axios.get(`${API_URL}/centers`),
        axios.get(`${API_URL}/locations`),
        axios.get(`${API_URL}/departments`),
        axios.get(`${API_URL}/asset-categories/main-categories`),
        axios.get(`${API_URL}/asset-categories/middle-categories`),
        axios.get(`${API_URL}/asset-categories/sub-categories`),
        axios.get(`${API_URL}/vehicle/all`),
      ]);

      setDropdownOptions((prev) => ({
        ...prev,
        stations: stationsRes.data.data || (Array.isArray(stationsRes.data) ? stationsRes.data : []),
        centers: centersRes.data.data || (Array.isArray(centersRes.data) ? centersRes.data : []),
        locations: locationsRes.data.data || (Array.isArray(locationsRes.data) ? locationsRes.data : []),
        departments: departmentsRes.data.data || (Array.isArray(departmentsRes.data) ? departmentsRes.data : []),
        mainCategories: mainCatsRes.data.data || (Array.isArray(mainCatsRes.data) ? mainCatsRes.data : []),
        middleCategories: midCatsRes.data.data || (Array.isArray(midCatsRes.data) ? midCatsRes.data : []),
        subCategories: subCatsRes.data.data || (Array.isArray(subCatsRes.data) ? subCatsRes.data : []),
      }));

      if (assetsRes.data.success) {
        setAssets(assetsRes.data.data);
      } else if (assetsRes.data.data) {
        setAssets(assetsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching vehicle report data:", error);
      Swal.fire({
        icon: "error",
        title: "Link Error",
        text: "Could not connect to the API server.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "mainCategory") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        middleCategory: "All",
        subCategory: "All",
      }));
    } else if (name === "middleCategory") {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
        subCategory: "All",
      }));
    } else {
      setFilters((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleGenerateReport = () => {
    setIsLoading(true);
    setTimeout(() => {
      let filtered = assets;

      if (filters.station !== "All") {
        filtered = filtered.filter(
          (a) =>
            String(a.StationId) === String(filters.station) ||
            String(a.station) === String(filters.station)
        );
      }
      if (filters.center !== "All") {
        filtered = filtered.filter(
          (a) =>
            String(a.CenterId) === String(filters.center) ||
            String(a.center) === String(filters.center)
        );
      }
      if (filters.location !== "All") {
        filtered = filtered.filter(
          (a) =>
            String(a.LocationId) === String(filters.location) ||
            String(a.location) === String(filters.location)
        );
      }
      if (filters.department !== "All") {
        filtered = filtered.filter(
          (a) =>
            String(a.DepartmentId) === String(filters.department) ||
            String(a.department) === String(filters.department)
        );
      }
      if (filters.mainCategory !== "All") {
        filtered = filtered.filter(
          (a) =>
            String(a.MainCategoryId) === String(filters.mainCategory) ||
            String(a.main_category_id) === String(filters.mainCategory)
        );
      }
      if (filters.middleCategory !== "All") {
        filtered = filtered.filter(
          (a) =>
            String(a.MiddleCategoryId) === String(filters.middleCategory) ||
            String(a.middle_category_id) === String(filters.middleCategory)
        );
      }
      if (filters.subCategory !== "All") {
        filtered = filtered.filter(
          (a) =>
            String(a.SubCategoryId) === String(filters.subCategory) ||
            String(a.sub_category_id) === String(filters.subCategory)
        );
      }
      if (filters.employee !== "All") {
        filtered = filtered.filter(
          (a) =>
            String(a.EmployeeId) === String(filters.employee) ||
            String(a.employee_id) === String(filters.employee)
        );
      }

      setFilteredAssets(filtered);
      setShowResults(true);
      setIsLoading(false);

      if (filtered.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Results",
          text: "No vehicles found matching the selected filters.",
        });
      }
    }, 500);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString();
    } catch (error) {
      return "N/A";
    }
  };

  // Helper function to format currency
  const formatCurrency = (amount) => {
    if (!amount) return "0.00";
    return new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const generatePdfPreview = async () => {
    if (filteredAssets.length === 0) {
      Swal.fire(
        "Error",
        "Please generate the report first with data.",
        "error"
      );
      return;
    }

    try {
      setIsLoading(true);

      // Get station name for display
      const selectedStation = dropdownOptions.stations.find(
        (s) => String(s.station_id) === String(filters.station)
      );
      const stationName = selectedStation
        ? selectedStation.station_name
        : "All Stations";

      // Generate HTML content for PDF
      const htmlContent = `
        <html>
          <head>
            <style>
              @page { size: A4 landscape; margin: 15px; }
              body { font-family: Arial, sans-serif; font-size: 10px; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h1 { color: #2c3e50; margin-bottom: 5px; font-size: 18px; }
              .header p { color: #7f8c8d; font-size: 12px; }
              .filters { margin-bottom: 15px; font-size: 10px; color: #555; }
              .filters strong { color: #333; }
              table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 9px; }
              th { background-color: #34495e; color: white; padding: 6px; text-align: left; border: 1px solid #ddd; }
              td { padding: 5px; border: 1px solid #ddd; }
              tr:nth-child(even) { background-color: #f9f9f9; }
              .footer { margin-top: 20px; text-align: right; font-size: 9px; color: #95a5a6; }
              .summary { margin-bottom: 10px; font-size: 11px; color: #2c3e50; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Vehicle Inventory Report</h1>
              
            </div>
            
            <div class="summary">
              <strong>Report Summary:</strong> ${
                filteredAssets.length
              } vehicles found
            </div>
            
            <div class="filters">
              <strong>Filters Applied:</strong><br/>
              ${
                Object.entries(filters)
                  .filter(([key, value]) => value !== "All")
                  .map(([key, value]) => {
                    let displayValue = value;
                    if (key === "station") {
                      displayValue = stationName;
                    }
                    return `${key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) =>
                        str.toUpperCase()
                      )}: ${displayValue}`;
                  })
                  .join(", ") || "No filters applied"
              }
            </div>
            
            <table>
              <thead>
                <tr>
                  <th>Reg. ID</th>
                  <th>Station</th>
                  <th>Year</th>
                  <th>Chasis No</th>
                  <th>Engine No</th>
                  <th>Color</th>
                  <th>Seating</th>
                  <th>Cylinder</th>
                  <th>Model</th>
                  <th>Body Type</th>
                  <th>Weight (Unl)</th>
                  <th>Weight (Gross)</th>
                  <th>Height</th>
                  <th>Length</th>
                  <th>Licence Renewal</th>
                  <th>Insurance Renewal</th>
                  <th>Purchase Type</th>
                  <th>Lease Start</th>
                  <th>Lease End</th>
                  <th>Invoice No</th>
                  <th>Purchase Date</th>
                  <th>Receive Type</th>
                  <th>Vote No</th>
                  <th>Total Amount</th>
                  <th>Purchase Price</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                ${filteredAssets
                  .map(
                    (asset) => `
                  <tr>
                    <td>${asset.registration_id || ""}</td>
                    <td>${asset.station || ""}</td>
                    <td>${asset.year || ""}</td>
                    <td>${asset.chasis_no || ""}</td>
                    <td>${asset.engine_no || ""}</td>
                    <td>${asset.color || ""}</td>
                    <td>${asset.seating_capacity || ""}</td>
                    <td>${asset.cylinder_capacity || ""}</td>
                    <td>${asset.model || ""}</td>
                    <td>${asset.body_type || ""}</td>
                    <td>${asset.weight_unlader || ""}</td>
                    <td>${asset.weight_gross || ""}</td>
                    <td>${asset.height || ""}</td>
                    <td>${asset.length || ""}</td>
                    <td class="text-center">${formatDate(
                      asset.licence_renewal
                    )}</td>
                    <td class="text-center">${formatDate(
                      asset.insurance_renewal
                    )}</td>
                    <td>${asset.purchase_type || ""}</td>
                    <td class="text-center">${formatDate(
                      asset.lease_period_start_date
                    )}</td>
                    <td class="text-center">${formatDate(
                      asset.lease_period_end_date
                    )}</td>
                    <td>${asset.invoice_no || ""}</td>
                    <td class="text-center">${formatDate(
                      asset.purchased_date
                    )}</td>
                    <td>${asset.receive_type || ""}</td>
                    <td>${asset.vote_no || ""}</td>
                    <td class="text-right">${formatCurrency(
                      asset.total_amount
                    )}</td>
                    <td class="text-right">${formatCurrency(
                      asset.purchased_price
                    )}</td>
                    <td class="text-center">${formatDate(asset.created_at)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            
            <div class="footer">
              Generated on: ${new Date().toLocaleString()}<br/>
              Total Vehicles: ${filteredAssets.length}<br/>
              
            </div>
          </body>
        </html>
      `;

      const response = await axios.post(
        "http://localhost:3000/api/report",
        {
          template: {
            content: htmlContent,
            recipe: "chrome-pdf",
            engine: "handlebars",
          },
          data: {
            assets: filteredAssets,
            filters: filters,
          },
        },
        {
          responseType: "blob",
        }
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const pdfUrl = URL.createObjectURL(blob);

      setPdfPreview({
        show: true,
        pdfUrl: pdfUrl,
        pdfData: response.data,
        pdfBlob: blob,
      });

      Swal.fire({
        icon: "success",
        title: "PDF Generated",
        text: "PDF preview is ready. Click Download to save.",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("PDF generation error:", error);
      Swal.fire({
        icon: "error",
        title: "PDF Generation Failed",
        text: "Make sure jsreport server is running on http://localhost:3000",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfDownload = () => {
    if (!pdfPreview.pdfBlob) return;

    const link = document.createElement("a");
    const url = URL.createObjectURL(pdfPreview.pdfBlob);

    link.href = url;
    link.setAttribute("download", `VehicleReport_${new Date().getTime()}.pdf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    Swal.fire({
      icon: "success",
      title: "Downloaded",
      text: "PDF has been downloaded successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  const exportJsReport = async (recipe) => {
    if (filteredAssets.length === 0) {
      Swal.fire(
        "Error",
        "Please generate the report first with data.",
        "error"
      );
      return;
    }

    try {
      setIsLoading(true);

      // Get station name for display
      const selectedStation = dropdownOptions.stations.find(
        (s) => String(s.station_id) === String(filters.station)
      );
      const stationName = selectedStation
        ? selectedStation.station_name
        : "All Stations";

      const htmlContent = `
        <html>
          <head>
            <style>
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-family: Arial, sans-serif; font-size: 11px; }
              th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h1 { margin: 0; color: #333; }
              .filters { margin-bottom: 20px; font-size: 12px; color: #666; }
              .footer { margin-top: 30px; text-align: right; font-size: 10px; color: #999; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Vehicle Inventory Report</h1>
              <p>Western Provincial Council - Asset Management System</p>
            </div>
            <div class="filters">
              <strong>Filters Applied:</strong><br/>
              ${
                Object.entries(filters)
                  .filter(([key, value]) => value !== "All")
                  .map(([key, value]) => {
                    let displayValue = value;
                    if (key === "station") {
                      displayValue = stationName;
                    }
                    return `${key
                      .replace(/([A-Z])/g, " $1")
                      .replace(/^./, (str) =>
                        str.toUpperCase()
                      )}: ${displayValue}`;
                  })
                  .join(", ") || "No filters applied"
              }
            </div>
            <table>
              <thead>
                <tr>
                  <th>Reg. ID</th>
                  <th>Station</th>
                  <th>Year</th>
                  <th>Chasis No</th>
                  <th>Engine No</th>
                  <th>Color</th>
                  <th>Seating</th>
                  <th>Cylinder</th>
                  <th>Model</th>
                  <th>Body Type</th>
                  <th>Weight (Unl)</th>
                  <th>Weight (Gross)</th>
                  <th>Height</th>
                  <th>Length</th>
                  <th>Licence Renewal</th>
                  <th>Insurance Renewal</th>
                  <th>Purchase Type</th>
                  <th>Lease Start</th>
                  <th>Lease End</th>
                  <th>Invoice No</th>
                  <th>Purchase Date</th>
                  <th>Receive Type</th>
                  <th>Vote No</th>
                  <th>Total Amount</th>
                  <th>Purchase Price</th>
                  <th>Created At</th>
                </tr>
              </thead>
              <tbody>
                ${filteredAssets
                  .map(
                    (asset) => `
                  <tr>
                    <td>${asset.registration_id || ""}</td>
                    <td>${asset.station || ""}</td>
                    <td>${asset.year || ""}</td>
                    <td>${asset.chasis_no || ""}</td>
                    <td>${asset.engine_no || ""}</td>
                    <td>${asset.color || ""}</td>
                    <td>${asset.seating_capacity || ""}</td>
                    <td>${asset.cylinder_capacity || ""}</td>
                    <td>${asset.model || ""}</td>
                    <td>${asset.body_type || ""}</td>
                    <td>${asset.weight_unlader || ""}</td>
                    <td>${asset.weight_gross || ""}</td>
                    <td>${asset.height || ""}</td>
                    <td>${asset.length || ""}</td>
                    <td class="text-center">${formatDate(
                      asset.licence_renewal
                    )}</td>
                    <td class="text-center">${formatDate(
                      asset.insurance_renewal
                    )}</td>
                    <td>${asset.purchase_type || ""}</td>
                    <td class="text-center">${formatDate(
                      asset.lease_period_start_date
                    )}</td>
                    <td class="text-center">${formatDate(
                      asset.lease_period_end_date
                    )}</td>
                    <td>${asset.invoice_no || ""}</td>
                    <td class="text-center">${formatDate(
                      asset.purchased_date
                    )}</td>
                    <td>${asset.receive_type || ""}</td>
                    <td>${asset.vote_no || ""}</td>
                    <td class="text-right">${formatCurrency(
                      asset.total_amount
                    )}</td>
                    <td class="text-right">${formatCurrency(
                      asset.purchased_price
                    )}</td>
                    <td class="text-center">${formatDate(asset.created_at)}</td>
                  </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>
            <div class="footer">
              Generated on: ${new Date().toLocaleString()}<br/>
              Total Vehicles: ${filteredAssets.length}<br/>
              Total Value: ${formatCurrency(
                filteredAssets.reduce(
                  (sum, v) => sum + (v.purchased_price || 0),
                  0
                )
              )}
            </div>
          </body>
        </html>
      `;

      const response = await axios.post(
        "http://localhost:3000/api/report",
        {
          template: {
            content: htmlContent,
            recipe: recipe,
            engine: "handlebars",
          },
          data: {
            assets: filteredAssets,
            filters: filters,
          },
        },
        {
          responseType: "blob",
        }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;

      let extension = "pdf";
      if (recipe === "html-to-xlsx") extension = "xlsx";
      if (recipe === "html-to-docx") extension = "docx";

      link.setAttribute(
        "download",
        `VehicleReport_${new Date().getTime()}.${extension}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();

      Swal.fire({
        icon: "success",
        title: "Exported",
        text: `Vehicle report exported as ${extension.toUpperCase()} successfully.`,
      });
    } catch (error) {
      console.error("jsreport export error:", error);
      Swal.fire({
        icon: "error",
        title: "Export Failed",
        text: "Make sure jsreport server is running on http://localhost:3000",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const closePdfPreview = () => {
    if (pdfPreview.pdfUrl) {
      URL.revokeObjectURL(pdfPreview.pdfUrl);
    }
    setPdfPreview({
      show: false,
      pdfUrl: null,
      pdfData: null,
      pdfBlob: null,
    });
  };

  const handleCancel = () => {
    setFilters({
      station: "All",
      location: "All",
      employee: "All",
      mainCategory: "All",
      subCategory: "All",
      center: "All",
      department: "All",
      middleCategory: "All",
    });
    setShowResults(false);
    closePdfPreview();
  };

  return (
    <div className="item-grn-page">
      <div className="item-grn-container">
        <h1 className="item-grn-title">Vehicle Inventory Report</h1>

        <div className="item-grn-form">
          <div className="form-section">
            <h2 className="form-section-title">Report Filters</h2>

            <div className="paired-section">
              <div className="paired-column">
                <div className="form-group">
                  <label className="form-label">Station</label>
                  <div className="input-wrapper">
                    <select
                      name="station"
                      value={filters.station}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="All">All Stations</option>
                      {dropdownOptions.stations.map((s) => (
                        <option key={s.id} value={s.station_id}>
                          {s.station_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Location</label>
                  <div className="input-wrapper">
                    <select
                      name="location"
                      value={filters.location}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="All">All Locations</option>
                      {dropdownOptions.locations.map((l) => (
                        <option key={l.id} value={l.location_id}>
                          {l.location_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Employee</label>
                  <div className="input-wrapper">
                    <select
                      name="employee"
                      value={filters.employee}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="All">All Employees</option>
                      {dropdownOptions.employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Main Category</label>
                  <div className="input-wrapper">
                    <select
                      name="mainCategory"
                      value={filters.mainCategory}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="All">All Main Categories</option>
                      {dropdownOptions.mainCategories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.category_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div className="paired-column">
                <div className="form-group">
                  <label className="form-label">Center</label>
                  <div className="input-wrapper">
                    <select
                      name="center"
                      value={filters.center}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="All">All Centers</option>
                      {dropdownOptions.centers.map((c) => (
                        <option key={c.id} value={c.center_id}>
                          {c.center_name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Department</label>
                  <div className="input-wrapper">
                    <select
                      name="department"
                      value={filters.department}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="All">All Departments</option>
                      {dropdownOptions.departments
                        .filter(
                          (d) =>
                            filters.center === "All" ||
                            d.center_id === filters.center
                        )
                        .map((d) => (
                          <option key={d.id} value={d.department_id}>
                            {d.department_name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Middle Category</label>
                  <div className="input-wrapper">
                    <select
                      name="middleCategory"
                      value={filters.middleCategory}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="All">All Middle Categories</option>
                      {dropdownOptions.middleCategories
                        .filter(
                          (c) =>
                            filters.mainCategory === "All" ||
                            String(c.main_category_id) ===
                              String(filters.mainCategory)
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.middle_category_name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Sub Category</label>
                  <div className="input-wrapper">
                    <select
                      name="subCategory"
                      value={filters.subCategory}
                      onChange={handleChange}
                      className="form-input"
                    >
                      <option value="All">All Sub Categories</option>
                      {dropdownOptions.subCategories
                        .filter(
                          (c) =>
                            filters.mainCategory === "All" ||
                            String(c.main_category_id) ===
                              String(filters.mainCategory)
                        )
                        .map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.sub_category_name}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="form-actions-section">
            <div className="action-buttons">
              <button
                className="btn-action btn-add"
                onClick={handleGenerateReport}
                disabled={isLoading}
              >
                <span className="btn-icon">{isLoading ? "⌛" : "📋"}</span>
                {isLoading ? "LOADING..." : "GENERATE REPORT"}
              </button>

              {showResults && (
                <>
                  <button
                    className="btn-action btn-save"
                    onClick={generatePdfPreview}
                    disabled={isLoading}
                  >
                    <span className="btn-icon">📄</span>
                    PDF PREVIEW
                  </button>
                  <button
                    className="btn-action btn-browse"
                    onClick={() => exportJsReport("html-to-xlsx")}
                    disabled={isLoading}
                    style={{ backgroundColor: "#28a745" }}
                  >
                    <span className="btn-icon">📊</span>
                    EXPORT EXCEL
                  </button>
                  <button
                    className="btn-action btn-browse"
                    onClick={() => exportJsReport("html-to-docx")}
                    disabled={isLoading}
                  >
                    <span className="btn-icon">📝</span>
                    EXPORT WORD
                  </button>
                </>
              )}

              <button
                className="btn-action btn-cancel"
                onClick={handleCancel}
                disabled={isLoading}
              >
                <span className="btn-icon">✕</span>
                CANCEL
              </button>
            </div>
          </div>
        </div>

        {showResults && (
          <div className="form-section" style={{ marginTop: "2rem" }}>
            <div className="report-summary" style={{ marginBottom: "20px" }}>
              <h2 className="form-section-title">
                Report Data ({filteredAssets.length} Vehicles Found)
              </h2>
              <div style={{ fontSize: "14px", color: "#2c3e50" }}>
                <strong>Total Value:</strong>{" "}
                {formatCurrency(
                  filteredAssets.reduce(
                    (sum, v) => sum + (v.purchased_price || 0),
                    0
                  )
                )}
              </div>
            </div>
            <div
              className="asset-table-container"
              style={{ overflowX: "auto" }}
            >
              <table className="asset-allocation-table">
                <thead>
                  <tr>
                    <th>Reg. ID</th>
                    <th>Station</th>
                    <th>Year</th>
                    <th>Chasis No</th>
                    <th>Engine No</th>
                    <th>Color</th>
                    <th>Seating</th>
                    <th>Cylinder</th>
                    <th>Model</th>
                    <th>Body Type</th>
                    <th>Weight (Unl)</th>
                    <th>Weight (Gross)</th>
                    <th>Height</th>
                    <th>Length</th>
                    <th>Licence Renewal</th>
                    <th>Insurance Renewal</th>
                    <th>Purchase Type</th>
                    <th>Lease Start</th>
                    <th>Lease End</th>
                    <th>Invoice No</th>
                    <th>Purchase Date</th>
                    <th>Receive Type</th>
                    <th>Vote No</th>
                    <th>Total Amount</th>
                    <th>Purchase Price</th>
                    <th>Created At</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset, index) => (
                      <tr key={asset.id || index}>
                        <td>{asset.registration_id || ""}</td>
                        <td>{asset.station || ""}</td>
                        <td>{asset.year || ""}</td>
                        <td>{asset.chasis_no || ""}</td>
                        <td>{asset.engine_no || ""}</td>
                        <td>{asset.color || ""}</td>
                        <td>{asset.seating_capacity || ""}</td>
                        <td>{asset.cylinder_capacity || ""}</td>
                        <td>{asset.model || ""}</td>
                        <td>{asset.body_type || ""}</td>
                        <td>{asset.weight_unlader || ""}</td>
                        <td>{asset.weight_gross || ""}</td>
                        <td>{asset.height || ""}</td>
                        <td>{asset.length || ""}</td>
                        <td>{formatDate(asset.licence_renewal)}</td>
                        <td>{formatDate(asset.insurance_renewal)}</td>
                        <td>{asset.purchase_type || ""}</td>
                        <td>{formatDate(asset.lease_period_start_date)}</td>
                        <td>{formatDate(asset.lease_period_end_date)}</td>
                        <td>{asset.invoice_no || ""}</td>
                        <td>{formatDate(asset.purchased_date)}</td>
                        <td>{asset.receive_type || ""}</td>
                        <td>{asset.vote_no || ""}</td>
                        <td style={{ textAlign: "right" }}>
                          {formatCurrency(asset.total_amount)}
                        </td>
                        <td style={{ textAlign: "right" }}>
                          {formatCurrency(asset.purchased_price)}
                        </td>
                        <td>{formatDate(asset.created_at)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan="26"
                        style={{ textAlign: "center", padding: "2rem" }}
                      >
                        No vehicles found for the selected filters.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* PDF Preview Modal */}
      {pdfPreview.show && (
        <div className="modal-overlay" onClick={closePdfPreview}>
          <div
            className="pdf-preview-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2 className="modal-title">Vehicle Report - PDF Preview</h2>
              <button className="modal-close-btn" onClick={closePdfPreview}>
                ×
              </button>
            </div>

            <div className="modal-body">
              <div className="pdf-preview-container">
                {pdfPreview.pdfUrl ? (
                  <iframe
                    src={pdfPreview.pdfUrl}
                    title="PDF Preview"
                    className="pdf-iframe"
                    style={{ width: "100%", height: "600px", border: "none" }}
                  />
                ) : (
                  <div className="loading-pdf">Loading PDF preview...</div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button
                className="btn-action btn-cancel"
                onClick={closePdfPreview}
                style={{ marginRight: "10px" }}
              >
                <span className="btn-icon">✕</span>
                CLOSE
              </button>
              <button
                className="btn-action btn-save"
                onClick={handlePdfDownload}
                style={{ backgroundColor: "#2196F3" }}
              >
                <span className="btn-icon">⏬</span>
                DOWNLOAD PDF
              </button>
            </div>
          </div>
        </div>
      )}

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

        .pdf-preview-modal {
          background-color: white;
          border-radius: 8px;
          width: 95%;
          height: 95%;
          max-width: 1400px;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: 0 5px 30px rgba(0, 0, 0, 0.3);
        }

        .modal-header {
          background-color: #2c3e50;
          color: white;
          padding: 15px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .modal-title {
          margin: 0;
          font-size: 1.3rem;
        }

        .modal-close-btn {
          background: none;
          border: none;
          color: white;
          font-size: 1.8rem;
          cursor: pointer;
          line-height: 1;
        }

        .modal-body {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
        }

        .pdf-preview-container {
          width: 100%;
          height: 100%;
          border: 1px solid #dee2e6;
          border-radius: 4px;
          overflow: hidden;
        }

        .loading-pdf {
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100%;
          font-size: 16px;
          color: #666;
        }

        .modal-footer {
          padding: 12px 20px;
          background-color: #f8f9fa;
          border-top: 1px solid #dee2e6;
          display: flex;
          justify-content: flex-end;
        }

        .report-summary {
          background-color: #f8f9fa;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #dee2e6;
        }

        @media (max-width: 768px) {
          .pdf-preview-modal {
            width: 98%;
            height: 98%;
          }

          .modal-body {
            padding: 10px;
          }

          .asset-allocation-table {
            font-size: 11px;
          }

          .asset-allocation-table th,
          .asset-allocation-table td {
            padding: 6px 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default VehicleReport;
