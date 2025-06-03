import express from "express";
import { getNotificationsForUser, markNotificationRead,deleteNotification,clearAllNotifications  } from "../controllers/notification_controller";
import { authMiddleware } from "../controllers/auth_controller"; 

const router = express.Router();

router.get("/notifications", authMiddleware, getNotificationsForUser);
router.patch("/notifications/:id/read", authMiddleware, markNotificationRead);
router.delete("/notifications/:id", authMiddleware, deleteNotification);
router.delete("/notifications", authMiddleware, clearAllNotifications);


export default router;
