import React, { useEffect } from "react";
import styles from "../../css/MeetingChat.module.css";

interface ToastNotificationProps {
  message: string;
  onClose: () => void;
}

const ToastNotification: React.FC<ToastNotificationProps> = ({ message, onClose }) => {
  useEffect(() => {
    if (message) {
      const timer = setTimeout(onClose, 5000);
      return () => clearTimeout(timer);
    }
  }, [message, onClose]);

  if (!message) return null;
  return <div className={styles.toastNotification}>{message}</div>;
};

export default ToastNotification;
