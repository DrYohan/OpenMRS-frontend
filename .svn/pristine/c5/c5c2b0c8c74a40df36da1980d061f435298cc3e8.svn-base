import axios from "axios";

const API_BASE_URL = "http://localhost:5055/api/v1"; 

// Login Account
export const adminLogin = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/adminLogin`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};


export const getAllUsers = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getAllUsers`, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response;
  } catch (error) {
    console.error("error in fetching users:", error);
    throw error; 
  }
}



export const changeUserStatus = async (id, status) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/changeUserStatus/${id}`, {status}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response;
  } catch (error) {
    console.error("error in fetching users:", error);
    throw error; 
  }
}


export const resetUserPassword = async (id, password) => {
  try {
    const response = await axios.patch(`${API_BASE_URL}/resetPassword/${id}`, {password}, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
    return response;
  } catch (error) {
    console.error("error in updating password:", error);
    throw error; 
  }
}


// InsertThresholdLevel
export const InsertThresholdLevel = async (formData) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/addThresholdLevel`, formData, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response;
  } catch (error) {
    console.error("addThresholdLevel error:", error);
    throw error;
  }
};


export const getAllDatabySensorType = async (sensortype) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getAllBySensorType/${sensortype}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response || [];
  } catch (error) {
    console.error("addThresholdLevel error:", error);
    throw error;
  }
};


export const deleteById = async (id) => {
  try {
    const response = await axios.delete(`${API_BASE_URL}/deleteThresoldlevel/${id}`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response;
  } catch (error) {
    console.error("delete ThresholdLevel error:", error);
    throw error;
  }
};


export const getSensorTypes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getSensorTypes`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("error in fetching sensor types:", error);
    throw error; 
  }
}

export const getUnitTypes = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/getUnitTypes`, {
      headers: {
        "Content-Type": "application/json",
      },
    });
    return response;
  } catch (error) {
    console.error("error in fetching unit types:", error);
    throw error; 
  }
}

