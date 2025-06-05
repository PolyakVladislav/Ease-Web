import { Request, Response } from "express";
import Notification from "../models/Notification";

export const getNotificationsForUser = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(100);
    res.status(200).json(
  notifications.map(n => ({
    id: n._id,
    userId: n.userId,
    message: n.message,
    appointmentId: n.appointmentId,
    isRead: n.isRead,
    createdAt: n.createdAt,
  }))
);

  } catch (err) {
    console.error("Failed to fetch notifications", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const markNotificationRead = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndUpdate(id, { isRead: true });
    res.status(200).json({ message: "Notification marked as read" });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await Notification.findByIdAndDelete(id);
    res.status(200).json({ message: "Notification deleted" });
  } catch (err) {
    console.error("Failed to delete notification:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const clearAllNotifications = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user._id;
    await Notification.deleteMany({ userId });
    res.status(200).json({ message: "All notifications deleted" });
  } catch (err) {
    console.error("Failed to clear notifications:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

