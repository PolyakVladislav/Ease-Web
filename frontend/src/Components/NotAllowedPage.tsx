import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../css/NotAllowed.module.css";

const NotAllowedPage: React.FC = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className={styles.notAllowedContainer}>
      <h1 className={styles.title}>
        Access Restricted
      </h1>
      <p className={styles.message}>
        We’re sorry, but you do not have permission to access this platform.
        Please use the designated application or contact support for assistance.
      </p>
      <p className={styles.extraMessage}>
        Thank you for your understanding.
      </p>
      <button onClick={handleLogout} className={styles.logoutButton}>
        Logout
      </button>
    </div>
  );
};

export default NotAllowedPage;