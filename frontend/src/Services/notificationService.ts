import api from "./axiosInstance";
import CONFIG from "../config";
import { AxiosError } from "axios";

export const getNotifications = async () => {
  try {
    const response = await api.get(`${CONFIG.SERVER_URL}/api/notifications`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const message =
        error?.response?.data?.message || "Failed to fetch notifications.";
      throw new Error(message);
    } else {
      throw new Error("Unknown error fetching notifications.");
    }
  }
};

export const markNotificationAsRead = async (notificationId: string) => {
  try {
    const response = await api.patch(
      `${CONFIG.SERVER_URL}/api/notifications/${notificationId}/read`,
      null,
      {
        withCredentials: true,
      }
    );
    return response.data;
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const message =
        error?.response?.data?.message || "Failed to mark notification as read.";
      throw new Error(message);
    } else {
      throw new Error("Unknown error marking notification as read.");
    }
  }
};

export const getUnreadNotificationCount = async (): Promise<number> => {
  try {
    const response = await api.get(`${CONFIG.SERVER_URL}/api/notifications`, {
      withCredentials: true,
    });
    return response.data.filter((n: any) => !n.isRead).length;
  } catch (error) {
    console.error("Failed to count unread notifications:", error);
    return 0;
  }
};

export const deleteNotification = async (notificationId: string) => {
  try {
    const response = await api.delete(
      `${CONFIG.SERVER_URL}/api/notifications/${notificationId}`,
      { withCredentials: true }
    );
    return response.data;
  } catch (error) {
    console.error("Failed to delete notification:", error);
    throw error;
  }
};

export const clearAllNotifications = async () => {
  try {
    const response = await api.delete(`${CONFIG.SERVER_URL}/api/notifications`, {
      withCredentials: true,
    });
    return response.data;
  } catch (error) {
    console.error("Failed to clear all notifications:", error);
    throw error;
  }
};



