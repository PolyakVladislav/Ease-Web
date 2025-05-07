import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { fetchProtectedData } from "../Services/authService";
import { fetchUserProfile } from "../Services/userService";
import styles from "../css/Loading.module.css";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
 // const [isDoctor, setIsDoctor] = useState(false);

  useEffect(() => {
    const checkAuthAndRole = async () => {      const res = await fetchProtectedData();
            if (res.success) {
        setIsAuthenticated(true);
        const userId = localStorage.getItem("userId");
        if (userId) {
          try {
            const data = await fetchUserProfile(userId);
            if (data.user.role === "doctor") {
         //     setIsDoctor(true);
            }
          } catch (err) {
            console.error("Error fetching user profile:", err);
          }
        }
      }
      setLoading(false);
    };

    checkAuthAndRole();
  }, []);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading, please wait...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // if (!isDoctor) {
  //   return <Navigate to="/not-allowed" replace />;
  // }

  return <>{children}</>;
}

export default PrivateRoute;
