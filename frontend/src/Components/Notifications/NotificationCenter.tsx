import React, { useEffect, useState } from "react";
import styles from "../../css/NotificationCenter.module.css";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../../Services/notificationService";
import { FaTrash } from "react-icons/fa";

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch (error) {
        console.error("Failed to load notifications:", error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev ? prev.map((n) => (n._id === id ? { ...n, isRead: true } : n)) : []
      );
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Could not mark notification as read");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications((prev) =>
        prev ? prev.filter((n) => n._id !== id) : []
      );
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Could not delete notification");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch (err) {
      console.error("Could not clear all notifications");
    }
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Notification Center</h2>
      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : !notifications || notifications.length === 0 ? (
        <div className={styles.empty}>No notifications yet.</div>
      ) : (
        <div className={styles.list}>
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`${styles.message} ${
                notification.isRead ? styles.read : styles.unread
              }`}
            >
              <div className={styles.notificationContent}>
                <div className={styles.notificationDetails}>
                  <div className={styles.topRow}>
                    {!notification.isRead && (
                      <span
                        className={styles.unreadDot}
                        title="Unread"
                      />
                    )}
                    <div className={styles.text}>{notification.message}</div>
                  </div>
                  <div className={styles.date}>
                    {new Date(notification.createdAt).toLocaleString()}
                  </div>
                </div>

                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                  {!notification.isRead && (
                    <button
                      className={styles.markReadBtn}
                      onClick={() => handleMarkRead(notification._id)}
                    >
                      Mark as read
                    </button>
                  )}
                  <FaTrash
                    onClick={() => handleDelete(notification._id)}
                    style={{ cursor: "pointer", color: "#d32f2f" }}
                    title="Delete notification"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* ✅ Clear All Button */}
          {notifications.length > 0 && (
            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <button
                onClick={handleClearAll}
                className={styles.clearAllBtn}
              >
                Clear All
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
