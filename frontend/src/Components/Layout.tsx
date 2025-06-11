import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaUserMd,
  FaUserShield,
  FaCalendarCheck,
  FaBrain,
  FaBell,
} from "react-icons/fa";
import socketClient from "socket.io-client";
import CONFIG from "../config";
import layoutStyles from "../css/Layout.module.css";
import loadingStyles from "../css/Loading.module.css";
import { handleLogout } from "../utiles/authHelpers";
import { fetchUserProfile } from "../Services/userService";
import { getUnreadNotificationCount } from "../Services/notificationService";
import { User } from "../types/user";

// establish a single Socket.IO connection
const socket = socketClient(CONFIG.SERVER_URL);

const Layout: React.FC = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const loadUserProfile = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchUserProfile(userId)
        .then((data) => setUser(data.user))
        .catch((err) => console.error("Error fetching user profile", err))
        .finally(() => setLoadingUser(false));
    } else {
      setLoadingUser(false);
    }
  };

  const fetchUnread = async () => {
    const count = await getUnreadNotificationCount();
    setUnreadCount(count);
  };

  useEffect(() => {
    // initial load
    loadUserProfile();
    fetchUnread();

    // join this user's room for live pushes
    const userId = localStorage.getItem("userId");
    if (userId) {
      socket.emit("joinUser", { userId });  
    }

    // whenever a new notification arrives, re-fetch unread count
    socket.on("newNotification", () => {
      fetchUnread();
    });

    // also listen to our custom event (e.g. mark-as-read, delete)
    window.addEventListener("notificationsUpdated", fetchUnread);
    window.addEventListener("userProfileUpdated", loadUserProfile);

    return () => {
      socket.off("newNotification");
      window.removeEventListener("notificationsUpdated", fetchUnread);
      window.removeEventListener("userProfileUpdated", loadUserProfile);
    };
  }, []);

  const onLogoutClick = () => setShowLogoutConfirm(true);
  const onConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    await handleLogout(navigate);
  };
  const onCancelLogout = () => setShowLogoutConfirm(false);

  if (loadingUser) {
    return (
      <div className={loadingStyles.loadingContainer}>
        <div className={loadingStyles.spinner}></div>
        <p className={loadingStyles.loadingText}>Loading user data...</p>
      </div>
    );
  }

  return (
    <div className={layoutStyles.dashboardContainer}>
      <header className={layoutStyles.topBar}>
        <h2 className={layoutStyles.title}>Ease Platform</h2>
        <button className={layoutStyles.logoutButton} onClick={onLogoutClick}>
          Logout
        </button>
      </header>

      <aside className={layoutStyles.sidebar}>
        <div className={layoutStyles.userBlock}>
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="User avatar"
              className={layoutStyles.userAvatar}
            />
          ) : (
            <div className={layoutStyles.avatarPlaceholder} />
          )}
          <h3 className={layoutStyles.userName}>{user?.username}</h3>
          <p className={layoutStyles.userRole}>{user?.role}</p>
        </div>

        <ul className={layoutStyles.sidebarList}>
          <li className={layoutStyles.sidebarItem}>
            <Link to="/doctor/dashboard" className={layoutStyles.sidebarLink}>
              <FaUserMd className={layoutStyles.icon} /> Doctor Dashboard
            </Link>
          </li>
          {user?.isAdmin && (
            <li className={layoutStyles.sidebarItem}>
              <Link to="/admin" className={layoutStyles.sidebarLink}>
                <FaUserShield className={layoutStyles.icon} /> Admin Dashboard
              </Link>
            </li>
          )}
          <li className={layoutStyles.sidebarItem}>
            <Link to="/profile" className={layoutStyles.sidebarLink}>
              <FaUser className={layoutStyles.icon} /> Profile
            </Link>
          </li>
          <li className={layoutStyles.sidebarItem}>
            <Link to="/appointmens" className={layoutStyles.sidebarLink}>
              <FaCalendarCheck className={layoutStyles.icon} /> Appointments
            </Link>
          </li>
          <li className={layoutStyles.sidebarItem}>
            <Link to="/chatgpt" className={layoutStyles.sidebarLink}>
              <FaBrain className={layoutStyles.icon} /> AI Assistant
            </Link>
          </li>
          <li className={layoutStyles.sidebarItem}>
            <Link to="/notifications" className={layoutStyles.sidebarLink}>
              <FaBell className={layoutStyles.icon} /> Notification Center
            </Link>
            {unreadCount > 0 && (
              <p style={{ margin: "1px 0 0 45px", fontSize: "16px", color: "red" }}>
                {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </li>
        </ul>
      </aside>

      <main className={layoutStyles.mainContent}>
        <Outlet />
      </main>

      {showLogoutConfirm && (
        <div className={layoutStyles.modalOverlay}>
          <div className={layoutStyles.modalContent}>
            <p>Are you sure you want to logout?</p>
            <div className={layoutStyles.modalButtons}>
              <button onClick={onConfirmLogout}>Yes</button>
              <button onClick={onCancelLogout}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Layout;
