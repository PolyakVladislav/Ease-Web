import React, { useEffect, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaClipboard,
  FaPlus,
  FaComments,
  FaRobot,
} from "react-icons/fa";
import styles from "../css/Layout.module.css";
import { handleLogout } from "../utiles/authHelpers";
import { fetchUserProfile } from "../Services/userService";
import { User } from "../types/user";

const Layout: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);

  const loadUserProfile = () => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchUserProfile(userId)
        .then((data) => {
          setUser(data.user);
        })
        .catch((err) => {
          console.error("Error fetching user profile", err);
        });
    }
  };

  useEffect(() => {
    loadUserProfile();
    window.addEventListener("userProfileUpdated", loadUserProfile);
    return () => {
      window.removeEventListener("userProfileUpdated", loadUserProfile);
    };
  }, []);

  const onLogout = async () => {
    await handleLogout(navigate);
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.topBar}>
        <h2 className={styles.title}>Ease Platform</h2>
        <button className={styles.logoutButton} onClick={onLogout}>
          Logout
        </button>
      </header>

      <aside className={styles.sidebar}>
        <div className={styles.userBlock}>
          {user?.profilePicture ? (
            <img
              src={user.profilePicture}
              alt="User avatar"
              className={styles.userAvatar}
            />
          ) : (
            <div className={styles.avatarPlaceholder} />
          )}
          <h3 className={styles.userName}>{user?.username}</h3>
          <p className={styles.userRole}>{user?.role}</p>
        </div>

        <ul className={styles.sidebarList}>
          <li className={styles.sidebarItem}>
            <Link to="/all-posts" className={styles.sidebarLink}>
              <FaClipboard className={styles.icon} /> Feed
            </Link>
          </li>
          <li className={styles.sidebarItem}>
            <Link to="/profile" className={styles.sidebarLink}>
              <FaUser className={styles.icon} /> Profile
            </Link>
          </li>
          <li className={styles.sidebarItem}>
            <Link to="/chat" className={styles.sidebarLink}>
              <FaComments className={styles.icon} /> Chat
            </Link>
          </li>
          <li className={styles.sidebarItem}>
            <Link to="/create-post" className={styles.sidebarLink}>
              <FaPlus className={styles.icon} /> Create Posts
            </Link>
          </li>
          <li className={styles.sidebarItem}>
            <Link to="/appointmens" className={styles.sidebarLink}>
              <FaRobot className={styles.icon} /> Appointments
            </Link>
          </li>
          <li className={styles.sidebarItem}>
            <Link to="/chatgpt" className={styles.sidebarLink}>
              <FaRobot className={styles.icon} /> AI Assistant
            </Link>
          </li>
        </ul>
      </aside>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
