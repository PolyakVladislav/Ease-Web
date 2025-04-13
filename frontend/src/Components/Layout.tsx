import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaUserMd,
  FaUserShield,
  FaCalendarCheck,
  FaBrain,
} from "react-icons/fa";
import layoutStyles from "../css/Layout.module.css";
import loadingStyles from "../css/Loading.module.css";
import { handleLogout } from "../utiles/authHelpers";
import { fetchUserProfile } from "../Services/userService";
import { User } from "../types/user";

const Layout: React.FC = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState<boolean>(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const loadUserProfile = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchUserProfile(userId)
        .then((data) => {
          setUser(data.user);
        })
        .catch((err) => {
          console.error("Error fetching user profile", err);
        })
        .finally(() => {
          setLoadingUser(false);
        });
    } else {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    loadUserProfile();
    window.addEventListener("userProfileUpdated", loadUserProfile);
    return () => {
      window.removeEventListener("userProfileUpdated", loadUserProfile);
    };
  }, []);

  const onLogoutClick = () => {
    setShowLogoutConfirm(true);
  };

  const onConfirmLogout = async () => {
    setShowLogoutConfirm(false);
    await handleLogout(navigate);
  };

  const onCancelLogout = () => {
    setShowLogoutConfirm(false);
  };

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