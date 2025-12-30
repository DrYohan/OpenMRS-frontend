const apiClient = async (url, options = {}) => {
  try {
    const token = localStorage.getItem("token"); // Retrieve token from localStorage

    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }), // Include token if available
    };

    const finalOptions = {
      ...options,
      headers: {
        ...headers,
        ...options.headers,
      },
    };

    const response = await fetch(url, finalOptions);

    // Check if response is ok, else throw an error to be caught below
    if (!response.ok) {  
      const errorData = await response.json();
      throw new Error(errorData.message || "An error occurred");
    }

    const data = await response.json();
    return data; // Return data on successful request
  } catch (error) {
    console.error("API request error:", error);
    throw error;
  }
};

export default apiClient;