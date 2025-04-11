import api from "./axiosInstance";
import CONFIG from "../config";

export const getAllUsers = async () => {
  const response = await api.get(`${CONFIG.SERVER_URL}/api/admin/users`, {
    withCredentials: true,
  });
  return response.data; 
};

export const updateUserRole = async (
  userId: string,
  role: "doctor" | "patient",
  isAdmin: boolean
) => {
  const response = await api.put(
    `${CONFIG.SERVER_URL}/api/admin/users/${userId}`,
    { role, isAdmin },
    {
      withCredentials: true,
    }
  );
  return response.data; 
};

// 1. Sessions per Doctor
export const fetchSessionsPerDoctor = async () => {
  const res = await api.get("/api/analytics/sessions-per-doctor");
  return res.data; // format: [{ doctor: "Aviv", count: 12 }]
};

// 2. Sessions per Month (last 12 months)
export const fetchSessionsPerMonth = async () => {
  const res = await api.get("/api/analytics/sessions-per-month");
  return res.data; // format: [{ month: "2024-03", count: 5 }]
};