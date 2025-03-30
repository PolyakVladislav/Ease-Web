import api from "./axiosInstance";
import CONFIG from "../config";
import { User } from "../types/user";

export const fetchUserProfile = async (userId: string) => {
  const response = await api.get(`${CONFIG.SERVER_URL}/api/users/profile`, {
    params: { userId },
    withCredentials: true,
  });
  return response.data;
};

export const updateUserProfileWithImage = async (
  userId: string,
  updatedData: Partial<User>,
  file?: File | null
) => {
  const formData = new FormData();
  formData.append("username", updatedData.username || "");
  formData.append("phoneNumber", updatedData.phoneNumber || "");
  formData.append("gender", updatedData.gender || "");
  if (updatedData.dateOfBirth) {
    formData.append("dateOfBirth", updatedData.dateOfBirth.toISOString());
  }
  if (file) {
    formData.append("profilePicture", file);
  }

  const response = await api.put(`${CONFIG.SERVER_URL}/api/users/profile`, formData, {
    params: { userId },
    withCredentials: true,
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
