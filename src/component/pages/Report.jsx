import React, { useState, useEffect } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../../css/Report.css";

const Report = () => {
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

  // API Base URL
  const API_URL = "http://localhost:3000/api";

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setIsLoading(true);
    try {
      const [
        centersRes,
        locationsRes,
        departmentsRes,
        mainCatsRes,
        midCatsRes,
        subCatsRes,
        assetsRes,
      ] = await Promise.all([
        axios.get(`${API_URL}/centers`),
        axios.get(`${API_URL}/locations`),
        axios.get(`${API_URL}/departments`),
        axios.get(`${API_URL}/asset-categories/main-categories`),
        axios.get(`${API_URL}/asset-categories/middle-categories`),
        axios.get(`${API_URL}/asset-categories/sub-categories`),
        axios.get(`${API_URL}/item-grn-approve/assets/all`),
      ]);

      setDropdownOptions((prev) => ({
        ...prev,
        centers: centersRes.data.success ? centersRes.data.data : [],
        stations: centersRes.data.success ? centersRes.data.data : [],
        locations: locationsRes.data.success ? locationsRes.data.data : [],
        departments: departmentsRes.data.success ? departmentsRes.data.data : [],
        mainCategories: mainCatsRes.data.success ? mainCatsRes.data.data : [],
        middleCategories: midCatsRes.data.success ? midCatsRes.data.data : [],
        subCategories: subCatsRes.data.success ? subCatsRes.data.data : [],
      }));

      if (assetsRes.data.success) {
        setAssets(assetsRes.data.data);
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
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
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateReport = () => {
    setIsLoading(true);
    // Simulate processing time
    setTimeout(() => {
      let filtered = assets;

      if (filters.station !== "All") {
        filtered = filtered.filter((a) => a.StationId === filters.station);
      }
      if (filters.center !== "All") {
        // Filter logic for center if available in asset data
      }
      if (filters.location !== "All") {
          // Filter logic for location
      }
      if (filters.department !== "All") {
        filtered = filtered.filter((a) => a.DepartmentSerial === filters.department);
      }
      if (filters.mainCategory !== "All") {
          // Filter logic for main category
      }
      if (filters.middleCategory !== "All") {
        filtered = filtered.filter((a) => a.MiddleCategory === filters.middleCategory);
      }
      if (filters.subCategory !== "All") {
        filtered = filtered.filter((a) => a.SubCategoryId === filters.subCategory);
      }
      if (filters.employee !== "All") {
        filtered = filtered.filter((a) => a.EmployeeSerial === Number(filters.employee));
      }

      setFilteredAssets(filtered);
      setShowResults(true);
      setIsLoading(false);
      
      if (filtered.length === 0) {
        Swal.fire({
          icon: "info",
          title: "No Results",
          text: "No assets found matching the selected filters.",
        });
      }
    }, 500);
  };

  const exportJsReport = async (recipe) => {
    if (filteredAssets.length === 0) {
      Swal.fire("Error", "Please generate the report first with data.", "error");
      return;
    }

    try {
      setIsLoading(true);
      
      // Template for jsreport
      const htmlContent = `
        <html>
          <head>
            <style>
              table { width: 100%; border-collapse: collapse; margin-top: 20px; font-family: Arial, sans-serif; }
              th, td { border: 1px solid #ddd; padding: 12px; text-align: left; font-size: 12px; }
              th { background-color: #f2f2f2; font-weight: bold; }
              .header { text-align: center; margin-bottom: 20px; }
              .header h1 { margin: 0; color: #333; }
              .filters { margin-bottom: 20px; font-size: 14px; color: #666; }
              .footer { margin-top: 30px; text-align: right; font-size: 10px; color: #999; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>Fixed Asset Inventory Report</h1>
              <p>Western Provincial Council - Asset Management System</p>
            </div>
            <div class="filters">
              <strong>Filters Applied:</strong><br/>
              Station: ${filters.station}, Location: ${filters.location}, Center: ${filters.center}, Department: ${filters.department}
            </div>
            <table>
              <thead>
                <tr>
                  <th>Item Serial</th>
                  <th>Item Code</th>
                  <th>Item Name</th>
                  <th>Brand</th>
                  <th>Model</th>
                  <th>Purchase Date</th>
                  <th>Unit Price</th>
                </tr>
              </thead>
              <tbody>
                ${filteredAssets.map(asset => `
                  <tr>
                    <td>${asset.ItemSerial || ''}</td>
                    <td>${asset.ItemCode || ''}</td>
                    <td>${asset.ItemName || ''}</td>
                    <td>${asset.Brand || ''}</td>
                    <td>${asset.Model || ''}</td>
                    <td>${asset.PurchaseDate ? new Date(asset.PurchaseDate).toLocaleDateString() : 'N/A'}</td>
                    <td style="text-align: right">${asset.UnitPrice ? asset.UnitPrice.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div class="footer">
              Generated on: ${new Date().toLocaleString()}
            </div>
          </body>
        </html>
      `;

      // Assuming jsreport server is running on default port 3000
      // If not, this can be configured to any remote server
      const response = await axios.post("http://localhost:3000/api/report", {
        template: {
          content: htmlContent,
          recipe: recipe,
          engine: "handlebars"
        },
        data: {
          assets: filteredAssets,
          filters: filters
        }
      }, {
        responseType: 'blob'
      });

      // Download the file
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      let extension = 'pdf';
      if (recipe === 'html-to-xlsx') extension = 'xlsx';
      if (recipe === 'html-to-docx') extension = 'docx';
      
      link.setAttribute('download', `AssetReport_${new Date().getTime()}.${extension}`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      Swal.fire({
        icon: "success",
        title: "Exported",
        text: `Report exported as ${extension.toUpperCase()} successfully.`,
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
  };

  return (
    <div className="item-grn-page">
      <div className="item-grn-container">
        <h1 className="item-grn-title">Asset Inventory Report</h1>

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
                        <option key={s.id} value={s.center_id}>
                          {s.center_name}
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
                      {dropdownOptions.subCategories.map((c) => (
                        <option key={c.id} value={c.sub_category_id}>
                          {c.sub_category_name}
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
                        .filter(d => filters.center === "All" || d.center_id === filters.center)
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
                        .filter(c => filters.mainCategory === "All" || c.main_category_id == filters.mainCategory)
                        .map((c) => (
                          <option key={c.id} value={c.middle_category_id}>
                            {c.middle_category_name}
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
                    onClick={() => exportJsReport('chrome-pdf')}
                    disabled={isLoading}
                  >
                    <span className="btn-icon">PDF</span>
                  </button>
                  <button
                    className="btn-action btn-browse"
                    onClick={() => exportJsReport('html-to-xlsx')}
                    disabled={isLoading}
                    style={{backgroundColor: '#28a745'}}
                  >
                    <span className="btn-icon">EXCEL</span>
                  </button>
                  <button
                    className="btn-action btn-browse"
                    onClick={() => exportJsReport('html-to-docx')}
                    disabled={isLoading}
                  >
                    <span className="btn-icon">WORD</span>
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
          <div className="form-section" style={{marginTop: '2rem'}}>
            <h2 className="form-section-title">Report Data (${filteredAssets.length} Items Found)</h2>
            <div className="asset-table-container">
              <table className="asset-allocation-table">
                <thead>
                  <tr>
                    <th>Item Serial</th>
                    <th>Item Code</th>
                    <th>Item Name</th>
                    <th>Brand</th>
                    <th>Model</th>
                    <th>Purchase Date</th>
                    <th>Unit Price</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAssets.length > 0 ? (
                    filteredAssets.map((asset) => (
                      <tr key={asset.ItemSerial}>
                        <td>{asset.ItemSerial}</td>
                        <td>{asset.ItemCode}</td>
                        <td>{asset.ItemName}</td>
                        <td>{asset.Brand}</td>
                        <td>{asset.Model}</td>
                        <td>{asset.PurchaseDate ? new Date(asset.PurchaseDate).toLocaleDateString() : 'N/A'}</td>
                        <td style={{textAlign: 'right'}}>{asset.UnitPrice ? asset.UnitPrice.toLocaleString(undefined, {minimumFractionDigits: 2}) : '0.00'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="7" style={{textAlign: 'center', padding: '2rem'}}>No assets found for the selected filters.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Report;
