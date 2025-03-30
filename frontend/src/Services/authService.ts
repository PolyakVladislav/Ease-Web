import axios from "axios";
import api from "./axiosInstance";


export const login = async (email: string, password: string) => {
  try {

    const response = await api.post("/auth/login", { email, password });

    if (response.status === 200) {

      return {
        success: true,
        data: response.data 

      };
    } else {
      return {
        success: false,
        message: response.data?.message || "Login failed",
      };
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      return {
        success: false,
        message: error.response.data.message,
      };
    } else {
      console.error("Axios error:", error);
      return {
        success: false,
        message: "An unexpected error occurred",
      };
    }
  }
};


export const fetchProtectedData = async () => {
  try {

    const response = await api.get("/auth/protected-route");
    if (response.status === 200) {

      return { success: true, message: response.data };
    } else {
      return {
        success: false,
        message: response.data?.message || "Failed to fetch data",
      };
    }
  } catch (error: unknown) {
    if (axios.isAxiosError(error) && error.response?.data?.message) {
      return {
        success: false,
        message: error.response.data.message,
      };
    } else {
      console.error("Axios error:", error);
      return { success: false, message: "An unexpected error occurred" };
    }
  }
};
