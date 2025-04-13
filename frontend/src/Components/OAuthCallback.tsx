import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import setAccessToken from "../Services/axiosInstance";
import { fetchUserProfile } from "../Services/userService";
import styles from "../css/Loading.module.css";

const OAuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("token");
    const userId = urlParams.get("userId");
    const username = urlParams.get("username");

    if (token && userId) {
      localStorage.setItem("accessToken", token);
      setAccessToken(token);
      localStorage.setItem("userId", userId);
      if (username) localStorage.setItem("username", username);

      fetchUserProfile(userId)
        .then((data) => {
          if (data.user.role !== "doctor") {
            navigate("/not-allowed", { replace: true });
          } else {
            navigate("/doctor/dashboard", { replace: true });
          }
        })
        .catch((err) => {
          console.error("Error fetching user profile:", err);
          navigate("/login", { replace: true });
        })
        .finally(() => setLoading(false));
    } else {
      navigate("/login", { replace: true });
      setLoading(false);
    }
  }, [location.search, navigate]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p className={styles.loadingText}>Loading, please wait...</p>
      </div>
    );
  }

  return null;
};

export default OAuthCallback;
