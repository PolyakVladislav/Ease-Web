import React, { useEffect, useState } from "react";
import socketClient from "socket.io-client";
import styles from "../../css/NotificationCenter.module.css";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  clearAllNotifications,
} from "../../Services/notificationService";
import { FaTrash } from "react-icons/fa";
import CONFIG from "../../config";

interface Notification {
  id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// use the default export
const socket = socketClient(CONFIG.SERVER_URL);


const NotificationCenter: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  // fetch existing notifications
  useEffect(() => {
    (async () => {
      try {
        const data = await getNotifications();
        setNotifications(data);
      } catch {
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // join room & listen for real-time
  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) socket.emit("joinUser", { userId });

    socket.on("newNotification", (notif: any) => {
      setNotifications(prev => [
        {
          id: notif.notificationId,
          message: notif.message,
          isRead: false,
          createdAt: notif.createdAt,
        },
        ...prev,
      ]);
      window.dispatchEvent(new Event("notificationsUpdated"));
    });

    return () => {
      socket.off("newNotification");
    };
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch {}
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch {}
  };

  const handleClearAll = async () => {
    try {
      await clearAllNotifications();
      setNotifications([]);
      window.dispatchEvent(new Event("notificationsUpdated"));
    } catch {}
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>Notification Center</h2>

      {loading ? (
        <div className={styles.loading}>Loading...</div>
      ) : notifications.length === 0 ? (
        <div className={styles.empty}>No notifications yet.</div>
      ) : (
        <div className={styles.list}>
          {notifications.map(notification => (
            <div
              key={notification.id}
              className={`${styles.message} ${
                notification.isRead ? styles.read : styles.unread
              }`}
            >
              <div className={styles.notificationContent}>
                <div className={styles.notificationDetails}>
                  <div className={styles.topRow}>
                    {!notification.isRead && (
                      <span className={styles.unreadDot} title="Unread" />
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
                      onClick={() => handleMarkRead(notification.id)}
                    >
                      Mark as read
                    </button>
                  )}
                  <FaTrash
                    onClick={() => handleDelete(notification.id)}
                    style={{ cursor: "pointer", color: "#d32f2f" }}
                    title="Delete notification"
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Clear All Button */}
          {notifications.length > 0 && (
            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <button onClick={handleClearAll} className={styles.clearAllBtn}>
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
