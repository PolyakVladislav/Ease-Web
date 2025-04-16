import React from "react";
import styles from "../css/NotFoundPage.module.css";

const NotFoundPage: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.errorCode}>404</div>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.subtitle}>
        Oops! The page you are looking for does not exist.
      </p>
      <a href="/doctor/dashboard" className={styles.homeLink}>
        Return to Home
      </a>
    </div>
  );
};

export default NotFoundPage;
