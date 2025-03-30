import api from "../Services/axiosInstance";
import { NavigateFunction } from "react-router-dom";

export async function handleLogin(
  e: React.FormEvent,
  email: string,
  password: string,
  setErrorMessage: (msg: string) => void,
  navigate: NavigateFunction
) {
  e.preventDefault();
  setErrorMessage("");

  if (!email || !password) {
    setErrorMessage("Please fill in both email and password.");
    return;
  }

  try {
    const response = await api.post("/auth/login", { email, password });
    if (response.status === 200 && response.data && response.data.accessToken) {
      localStorage.setItem("accessToken", response.data.accessToken);

      if (response.data._id) localStorage.setItem("userId", response.data._id);
      if (response.data.username) localStorage.setItem("username", response.data.username);

      navigate("/all-posts");
    } else {
      setErrorMessage(response.data?.message || "Login failed");
    }
  } catch {
      setErrorMessage("An unexpected error occurred");
    }
  
}

export function handleKeyDown(
  e: React.KeyboardEvent,
  submitFunc: () => void
) {
  if (e.key === "Enter") {
    e.preventDefault();
    submitFunc();
  }
}

export function handleGoogleLogin(serverUrl: string) {
  window.location.href = `${serverUrl}/auth/google`;
}

export async function handleLogout(navigate: NavigateFunction) {
  try {
    await api.post("/auth/logout"); 
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("username");
    navigate("/login");
  } catch (err) {
    console.error("Error logging out:", err);
    navigate("/login");
  }
}

