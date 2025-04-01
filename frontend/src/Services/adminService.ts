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