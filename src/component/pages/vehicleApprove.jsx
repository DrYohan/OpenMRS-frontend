import React, { useEffect, useState } from "react";
import "../../css/pages.css";
import axios from "axios";
import Swal from "sweetalert2";

const VehicleApprove = () => {
  const [details, setDetails] = useState([]);

  useEffect(() => {
    const fetchPendingApprovalVehicles = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3000/api/vehicle/pendingVehicle"
        );


        console.log("response.data.data", response.data.data);
        setDetails(
          response.data.data.map(v => ({
            ...v,
            status: v.status ?? null,
          }))
        );
      } catch (error) {
        console.error("Error fetching vehicle:", error);
      }
    };

    fetchPendingApprovalVehicles();
  }, []);

  /* ---------- Select All ---------- */
  const allApproved =
    details.length > 0 && details.every(v => v.status === 1);

  const allRejected =
    details.length > 0 && details.every(v => v.status === 0);

  const handleSelectAll = (status) => {
    setDetails(prev => prev.map(v => ({ ...v, status })));
  };

  /* ---------- Row Status Change ---------- */
  const handleStatusChange = (registrationId, newStatus) => {
    setDetails(prev =>
      prev.map(item =>
        item.registration_id === registrationId
          ? { ...item, status: newStatus }
          : item
      )
    );
  };

  /* ---------- Approve ---------- */
  const handleApprove = async () => {
    try {
      const selected = details.filter(v => v.status !== null);

      if (selected.length === 0) {
        Swal.fire(
          "No selection",
          "Please approve or reject the vehicle before saving",
          "warning"
        );
        return;
      }

          // Show confirmation dialog
    const result = await Swal.fire({
      title: "Are you sure?",
      text: "Do you want to save these changes?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Yes, save it",
      cancelButtonText: "Cancel",
    });

    if (!result.isConfirmed) return;


      const payload = {
        vehicles: selected.map(v => ({
          registration_id: v.registration_id,
          status: v.status,
        })),
      };

      console.log("payload", payload)
      await axios.post(
        "http://localhost:3000/api/vehicle/approve",
        payload
      );

      Swal.fire("Success", "Vehicle status updated", "success");

      setDetails(prev => prev.filter(v => v.status === null));
    } catch (error) {
      console.error("Error approving vehicles:", error);
    }
  };

  return (
    <div className="page">
      <div className="container">
        <h1 className="title">Vehicle Approval</h1>

      <div className="form-actions-section w-full p-4">
              <div className="table-responsive">
                <table className="table table-bordered table-hover">
                  <thead className="bg-blue">
                    <tr>
                      <th className="text-white">No</th>
                      <th className="text-white">Category</th>
                      <th className="text-white">Registration ID</th>
                      <th className="text-white">Model</th>
                      <th className="text-white">Make</th>
                      <th className="text-white">Price</th>
                      <th className="text-white">Purchased Date</th>

                      <th className="text-white text-center">
                        Approve
                        <input
                          type="checkbox"
                          className="form-check-input ms-2"
                          checked={allApproved}
                          onChange={() =>
                            handleSelectAll(allApproved ? null : 1)
                          }
                        />
                      </th>

                      <th className="text-white text-center">
                        Reject
                        <input
                          type="checkbox"
                          className="form-check-input ms-2"
                          checked={allRejected}
                          onChange={() =>
                            handleSelectAll(allRejected ? null : 0)
                          }
                        />
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {details.length === 0 ? (
                      <tr>
                        <td colSpan="9" className="text-center">
                          No records found
                        </td>
                      </tr>
                    ) : (
                      details.map((item, index) => (
                        <tr key={item.registration_id}>
                          <td>{index + 1}</td>
                          <td>{item.sub_category || "-"}</td>
                          <td>{item.registration_id}</td>
                          <td>{item.model}</td>
                          <td>{item.make}</td>
                          <td>{item.purchased_price}</td>
                          <td>
                            {item.purchased_date
                              ? new Date(item.purchased_date)
                                  .toISOString()
                                  .split("T")[0]
                              : "-"}
                          </td>

                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={item.status === 1}
                              onChange={() =>
                                handleStatusChange(
                                  item.registration_id,
                                  item.status === 1 ? null : 1
                                )
                              }
                            />
                          </td>

                          <td className="text-center">
                            <input
                              type="checkbox"
                              className="form-check-input"
                              checked={item.status === 0}
                              onChange={() =>
                                handleStatusChange(
                                  item.registration_id,
                                  item.status === 0 ? null : 0
                                )
                              }
                            />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
      </div>
        <div className="d-flex justify-content-center gap-2 mt-3">
          <button
            className="button button-submit"
            type="button"
            onClick={handleApprove}
          >
            Save
          </button>

        <button className="button button-cancel" 
                type="button"
               /*  onClick={handleReset} */
              >
                Cancel
              </button>
        </div>

      </div>
    </div>
  );
};

export default VehicleApprove;
