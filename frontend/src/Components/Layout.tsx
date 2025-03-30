import React from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaClipboard,
  FaPlus,
  FaComments,
  FaRobot,
} from "react-icons/fa";
import { MdArticle } from "react-icons/md";
import styles from "../css/Layout.module.css";
import { handleLogout } from "../utiles/authHelpers";

const Layout: React.FC = () => {
  const navigate = useNavigate();

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
        <ul className={styles.sidebarList}>
          <li className={styles.sidebarItem}>
            <Link to="/profile" className={styles.sidebarLink}>
              <FaUser className={styles.icon} /> Profile
            </Link>
          </li>
          <li className={styles.sidebarItem}>
            <Link to="/all-posts" className={styles.sidebarLink}>
              <FaClipboard className={styles.icon} /> Posts
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
            <Link to="/articles" className={styles.sidebarLink}>
              <MdArticle className={styles.icon} /> Articles
            </Link>
          </li>
          <li className={styles.sidebarItem}>
            <Link to="/chatgpt" className={styles.sidebarLink}>
              <FaRobot className={styles.icon} /> ChatGPT
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
