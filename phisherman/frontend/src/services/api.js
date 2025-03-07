import axios from "axios";

// Change the hosts file if running outside Docker.
const API_URL = "/api";

//console.log("VITE_API_URL:", import.meta.env.VITE_API_URL); // ✅ Debug log

// ✅ Setup Axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
});

// ✅ Automatically include JWT token in every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * ✅ Validates the JWT token by calling `/api/auth/validate-token`
 */
export const validateToken = async () => {
  try {
    const response = await api.get("/auth/validate-token");
    console.log("Token is valid:", response.data);
    return true;
  } catch (error) {
    console.warn("Invalid or expired token:", error.response?.data?.error || error.message);
    localStorage.removeItem("authToken"); // ✅ Remove invalid token
    return false;
  }
};

// ✅ User Authentication
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const registerUser = async (firstName, lastName, email, password) => {
  const response = await api.post("/auth/register", {
    firstName,
    lastName,
    email,
    password,
  });
  return response.data; // Includes QR Code URL & MFA Secret
};

export const verifyMFA = (email, mfaToken) => {
  return api.post("/mfa/verify-mfa", { email, mfaToken });
};


export const getSensitiveData = async () => {
  return api.get("/protected/sensitive-data");
};

export const createSensitiveData = async (data) => {
  return api.post("/protected/sensitive-data", data);
};

export const updateSensitiveData = async (id, data) => {
  return api.put(`/protected/sensitive-data/${id}`, data);
};

export const deleteSensitiveData = async (id) => {
  return api.delete(`/protected/sensitive-data/${id}`);
};


// ✅ Fetch All Users (User Management)
export const getAllUsers = async () => {
  return api.get("/user/users");
};

export const createUser = async (data) => {
  return api.post("/user/users", data);
};

export const updateUser = async (id, data) => {
  return api.put(`/user/users/${id}`, data);
};

export const deleteUser = async (id) => {
  return api.delete(`/user/users/${id}`);
};

export const sendPhishingEmail = async (from,subject,body)=> {
  return api.post("/email/send-phish", { from,subject,body });
};


// ✅ Phishing Simulation (Public)
export const triggerPhishingSimulation = async (emailBody) => {
  return api.post("/phishing/simulate", { emailBody });
};

export const connectToPhishingLogs = () => {
  return new EventSource("/api/phishing/logs"); // ✅ SSE connection to backend logs
};

// ✅ Logout User
export const logoutUser = () => {
  return api.post("/auth/logout");
};

export default api;
