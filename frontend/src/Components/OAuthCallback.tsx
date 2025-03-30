import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import setAccessToken from "../Services/axiosInstance";

const OAuthCallback: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("token");
    const userId = urlParams.get("userId");
    const username = urlParams.get("username");

    if (token) {
      localStorage.setItem("accessToken", token);
      setAccessToken(token);

      if (userId) localStorage.setItem("userId", userId);
      if (username) localStorage.setItem("username", username);

      navigate("/all-posts", { replace: true });
    } else {
      navigate("/login", { replace: true });
    }
  }, [location.search, navigate]);

  return <div>Loading...</div>;
};

export default OAuthCallback;
