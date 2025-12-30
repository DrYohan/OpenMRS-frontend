const BASE_URL = "http://localhost:5055";
const API_PREFIX = "/api/v1";
const WebSocket_URL = "ws://localhost:5055";

const API_ROUTES = {
  websocket_url: WebSocket_URL,
  users: {
    CREATE: `${BASE_URL}${API_PREFIX}/users`,
    UPDATE: (userId) => `${BASE_URL}${API_PREFIX}/users/${userId}`,
    GET_ALL: `${BASE_URL}${API_PREFIX}/users`,
    DELETE: (userId) => `${BASE_URL}${API_PREFIX}/users/${userId}`,
  },
  login: {
    LOGIN: `${BASE_URL}${API_PREFIX}/auth/login`,
    CHANGE_PASSWORD: `${BASE_URL}${API_PREFIX}/auth/changepassword`,
    FORGOT_PASSWORD: `${BASE_URL}${API_PREFIX}/auth/forgotpassword`,
    REFRESH_TOKEN: `${BASE_URL}${API_PREFIX}/auth/refreshToken`,
  },
  userpermissions: {
    GET_USERGROUPS: `${BASE_URL}${API_PREFIX}/permissions/usergroups`,
    CREATE_USERGROUP: `${BASE_URL}${API_PREFIX}/permissions/usergroups`,
    CREATE_PERMISSION: `${BASE_URL}${API_PREFIX}/permissions/userpermissions`,
    GET_PERMISSIONS: `${BASE_URL}${API_PREFIX}/permissions/userpermissions`,
    CREATE_USERGROUPPERMISSION: `${BASE_URL}${API_PREFIX}/permissions/usergrouppermission`,

    GET_USERGROUPPERMISSION: (groupid) =>
      `${BASE_URL}${API_PREFIX}/permissions/usergrouppermissions/${groupid}`, //

    DELETE_USERGROUPPERMISSION: (groupid, permissionid) =>
      `${BASE_URL}${API_PREFIX}/permissions/usergrouppermissions/${groupid}/${permissionid}`,
    GET_USERDETAILS: (userid) =>
      `${BASE_URL}${API_PREFIX}/permissions/userdetails/${userid}`,
    GET_PERMISSIONSBYGROUPID: (usergroupid) =>
      `${BASE_URL}${API_PREFIX}/permissions/userpermissions/${usergroupid}`,
  },
  dashboard: {
    TEMPERATURE_SUMMARY: (duration) =>
      `${BASE_URL}${API_PREFIX}/gettemperaturesummary/${duration}`,
    HUMIDITY_SUMMARY: (duration) =>
      `${BASE_URL}${API_PREFIX}/gethumiditysummary/${duration}`,
    WIND_SUMMARY: (duration) =>
      `${BASE_URL}${API_PREFIX}/getwindsummary/${duration}`,
    SOLAR_SUMMARY: (duration) =>
      `${BASE_URL}${API_PREFIX}/getsolarsummary/${duration}`,
    WATER_LEVEL_SUMMARY: (duration) =>
      `${BASE_URL}${API_PREFIX}/getwaterlevelsummary/${duration}`,
    RAINFALL_SUMMARY: `${BASE_URL}${API_PREFIX}/getrainfallsummary`,
    RAINFALL_DEVICES: `${BASE_URL}${API_PREFIX}/getrainfalldevices`,
  },
  riverbasin: {
    GET_BASINS: `${BASE_URL}${API_PREFIX}/basins`,
    CREATE_BASINS: `${BASE_URL}${API_PREFIX}/basins`,
    DELETE_BASINS: (id) => `${BASE_URL}${API_PREFIX}/basins/${id}`,
    MAP_PATH: `${BASE_URL}${API_PREFIX}/maps`,
  },

  deviceregistry: {
    GET_INSTITUTES: `${BASE_URL}${API_PREFIX}/institutes`,
    GET_SUB_OFFICE_LEVEL_1: `${BASE_URL}${API_PREFIX}/subOfficeLevel1_Names`,
    GET_SELECTED_AFFECTED_AREA: (id) =>
      `${BASE_URL}${API_PREFIX}/selectedAffectedGnArea/${id}`,
    GET_SUB_OFFICE_LEVEL_2: `${BASE_URL}${API_PREFIX}/subOfficeLevel2_Names`,
    GET_DEVICE_CATEGORY: `${BASE_URL}${API_PREFIX}/deviceCategory`,
    GET_DISTRICTS: `${BASE_URL}${API_PREFIX}/districts`,
    GET_DESCRIPTION: (sensor_type) =>
      `${BASE_URL}${API_PREFIX}/getDescription/${sensor_type}`,
    CREATE_DEVICE_CATEGORY: `${BASE_URL}${API_PREFIX}/deviceCategory`,
    CREATE_DEVICE_REGISTRY: `${BASE_URL}${API_PREFIX}/deviceRegistry`,
    CREATE_GN_AFFECTED_AREA: `${BASE_URL}${API_PREFIX}/affectedGnArea`,
    DELETE_GN_AFFECTED_AREA: (id) =>
      `${BASE_URL}${API_PREFIX}/affectedGnArea/${id}`,
    GET_SELECTED_DEVICE: (id) =>
      `${BASE_URL}${API_PREFIX}/getSelectedDevice/${id}`,
    UPDATE_DEVICE_REGISTRY: `${BASE_URL}${API_PREFIX}/deviceRegistry`,
    UPDATE_GN_AFFECTED_AREA: (id) =>
      `${BASE_URL}${API_PREFIX}/affectedGnArea/${id}`,
    BACK_END_URL: `${BASE_URL}${API_PREFIX}`,
    GET_DEVICES_BY_INSTITUTE: (institute, searchTerm) =>
      `${BASE_URL}${API_PREFIX}/devices/${institute}?search=${searchTerm}`,
    DS_DIVISION: (id) => `${BASE_URL}${API_PREFIX}/dsdivisionByDistrict/${id}`,
    GN_DIVISION: (id) =>
      `${BASE_URL}${API_PREFIX}/gnDivisionByDsDivision/${id}`,
  },

  exportdata: {
    GET_DROP_DOWN_DATA: `${BASE_URL}${API_PREFIX}/exportDdl`,
    EXPORT_DATA_URL: `${BASE_URL}${API_PREFIX}/exportData`,
  },
  subofficelevel1: {
    GET_SUB_OFFICE_LEVEL_1: `${BASE_URL}${API_PREFIX}/sub-offices-level-1`,
    CREATE_SUB_OFFICE_LEVEL_1: `${BASE_URL}${API_PREFIX}/sub-office-level-1`,
    DELETE_SUB_OFFICE_LEVEL_1: (id) =>
      `${BASE_URL}${API_PREFIX}/sub-office-level-1/${id}`,
    BASE_URL: `${BASE_URL}`,
    MAP_PATH: `${BASE_URL}${API_PREFIX}`,
  },
  subofficelevel2: {
    GET_NAME: `${BASE_URL}${API_PREFIX}/subOfficeLevel1_Names`,
    GET_ALL_SUB_OFFICE_LEVEL_2: `${BASE_URL}${API_PREFIX}/sub-offices-level-2`,
    CREATE_SUB_OFFICE_LEVEL_2: `${BASE_URL}${API_PREFIX}/sub-office-level-2`,
    DELETE_SUB_OFFICE_LEVEL_2: (id) =>
      `${BASE_URL}${API_PREFIX}/sub-office-level-2/${id}`,
    MAP_PATH: `${BASE_URL}${API_PREFIX}`,
  },
  sensors: {
    GET_ALL: `${BASE_URL}${API_PREFIX}/sensor_type`,
  },
  unittypes: {
    GET_ALL: `${BASE_URL}${API_PREFIX}/unittypes`,
  },
  thresholdlevel: {
    GET_NAME: `${BASE_URL}${API_PREFIX}/subOfficeLevel1_Names`,
    GET_DATA_BY_SENSOR_TYPE: (sensor_type) =>
      `${BASE_URL}${API_PREFIX}/getAllBySensorType/${sensor_type}`,
    CREATE_THRESHOLDLEVEL: `${BASE_URL}${API_PREFIX}/addThresholdLevel`,
    DELETE_THRESHOLDLEVEL: (id) =>
      `${BASE_URL}${API_PREFIX}/deleteThresoldlevel/${id}`,
  },
  manualdatacorrection: {
    GET_INSTITUTES: `${BASE_URL}${API_PREFIX}/institutes`,
    GET_DEVICES: (instituteId, sensorType) =>
      `${BASE_URL}${API_PREFIX}/institutes/${instituteId}/sensor-types/${sensorType}/devices`,
    FETCH_DATA: (sensorTypeRoute, selectedDevice, date) =>
      `${BASE_URL}${API_PREFIX}/${sensorTypeRoute}/device-data?device=${selectedDevice}&date=${date}`,
    UPDATE: (sensorTypeRoute) =>
      `${BASE_URL}${API_PREFIX}/${sensorTypeRoute}/update`,
    CREATE_DATA: (sensorTypeRoute) =>
      `${BASE_URL}${API_PREFIX}/${sensorTypeRoute}/create-data`,
    UPDATE_STATUS: (sensorTypeRoute) =>
      `${BASE_URL}${API_PREFIX}/${sensorTypeRoute}/update-status`,
  },

  thresholdLevelReport: {
    GET_INSTITUTES: `${BASE_URL}${API_PREFIX}/institutes`,
    GET_THRESHOLD_VALUES: `${BASE_URL}${API_PREFIX}/threshold_values`,
    GET_COLOR: `${BASE_URL}${API_PREFIX}/getColor`,
  },

  assignstaion: {
    GET_INSTITUTE: `${BASE_URL}${API_PREFIX}/institutes`,
    GET_USERS: `${BASE_URL}${API_PREFIX}/users`,
    GET_DEVICES: `${BASE_URL}${API_PREFIX}/getalldevices`,
    GET_ASSIGNED_DEVICES: (userId) =>
      `${BASE_URL}${API_PREFIX}/assigned-devices/${userId}`,
    DELETE_ASSIGNED_DEVICE: (userId, deviceId) =>
      `${BASE_URL}${API_PREFIX}/assigned-devices/${userId}/${deviceId}`,
    ASSIGN_DEVICE: (userId) =>
      `${BASE_URL}${API_PREFIX}/assigned-devices/${userId}`,
  },
  waterdischarge: {
    GET_DEVICES: `${BASE_URL}${API_PREFIX}/devices`,
    GET_INSTITUTES: `${BASE_URL}${API_PREFIX}/institutes`,
    GET_DISCHARGES: (deviceId, date) =>
      `${BASE_URL}${API_PREFIX}/discharges?deviceId=${deviceId}&date=${date}`,
    CREATE_DISCHARGE: `${BASE_URL}${API_PREFIX}/discharges`,
    DELETE_DISCHARGE: (dischargeId) =>
      `${BASE_URL}${API_PREFIX}/discharges/${dischargeId}`,
    GET_DEVICES_BY_INSTITUTE: (instituteId) =>
      `${BASE_URL}${API_PREFIX}/devices/${instituteId}`,
  },
  searchdevices: {
    GET_ALL_DEVICES_DATA: `${BASE_URL}${API_PREFIX}/getAllDevicesData`, // Add this route
    GET_INSTITUTES: `${BASE_URL}${API_PREFIX}/institutes`, // Add this route
    GET_SENSOR_TYPES: `${BASE_URL}${API_PREFIX}/sensor_type`, // Add this route
  },
  usercreation: {
    ADD_USER: `${BASE_URL}${API_PREFIX}/addUser`,
  },
  usermanagement: {
    GET_ALL_USERS: `${BASE_URL}${API_PREFIX}/getAllUsers`,
    UPDATE_STATUS: (id) => `${BASE_URL}${API_PREFIX}/changeUserStatus/${id}`,
  },
  viewreceivedrequests: {
    GET_CUSTOMER: `${BASE_URL}${API_PREFIX}/customer-requests`,
    UPDATE_STATUS: (requestId) =>
      `${BASE_URL}${API_PREFIX}/customer-requests/${requestId}/status`,
  },

  approvedreqests: {
    GET_CUSTOMER_APPROVED: `${BASE_URL}${API_PREFIX}/customer-requests/approved`,
    COMPLETE_REQUEST: (requestId) =>
      `${BASE_URL}${API_PREFIX}/customer-requests/${requestId}/complete`,
  },

  customerrequest: {
    GET_INSTITUTES: `${BASE_URL}${API_PREFIX}/institutes`, // Add this route
    GET_BASINS: `${BASE_URL}${API_PREFIX}/basins`,
    GET_SENSOR_TYPES: `${BASE_URL}${API_PREFIX}/sensor_type`, // Add this route
    GET_ESTIMATED_PRICE: (dateCount) =>
      `${BASE_URL}${API_PREFIX}/estimated-price?dateCount=${dateCount}`, // Add this route
    SUBMIT_REQUEST: `${BASE_URL}${API_PREFIX}/customer-requests`, // Add this route
  },

  paymentslip: {
    GET_PAYMENT_DETAILS: (token) => `${BASE_URL}${API_PREFIX}/payment/${token}`,
    UPLOAD_RECEIPT: (token) =>
      `${BASE_URL}${API_PREFIX}/upload-receipt/${token}`,
  },

  paymenthistory: {
    GET_CUSTOMER: `${BASE_URL}${API_PREFIX}/customer-requests`,
    SEND_HISTORY: `${BASE_URL}${API_PREFIX}/payment-history/send`,
  },
};

export default API_ROUTES;
