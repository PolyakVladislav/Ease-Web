import React, { useEffect, useState } from "react";
import styles from "../css/AdminPanel.module.css";
import { getAllUsers, updateUserRole } from "../Services/adminService";
import { User } from "../types/user";
import api from "../Services/axiosInstance"; // Token-safe instance
import AdminCharts from "../Components/AdminCharts";

type TherapistSession = {
  therapist: string;
  patients: {
    name: string;
    count: number;
  }[];
};

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"doctor" | "patient">("patient");
  const [newIsAdmin, setNewIsAdmin] = useState<boolean>(false);
  const [therapistSessions, setTherapistSessions] = useState<TherapistSession[]>([]);

  useEffect(() => {
    setLoading(true);
    getAllUsers()
      .then((data) => setUsers(data.users))
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users.");
      })
      .finally(() => setLoading(false));

    api
      .get("/api/analytics/therapist-patient-sessions")
      .then((res) => {
        setTherapistSessions(res.data.data);
      })
      .catch((err) => {
        console.error("Error fetching therapist sessions:", err);
      });
  }, []);

  const handleRoleChange = (
    userId: string,
    baseRole: "doctor" | "patient",
    isAdmin: boolean
  ) => {
    updateUserRole(userId, baseRole, isAdmin)
      .then((data) => {
        setUsers((prev) => prev.map((u) => (u._id === userId ? data.user : u)));
        setEditingUser(null);
      })
      .catch((err) => {
        console.error("Error updating role:", err);
        alert("Failed to update role.");
      });
  };

  const handleEditClick = (user: User) => {
    setEditingUser(user);
    setNewRole(user.role as "doctor" | "patient");
    setNewIsAdmin(!!user.isAdmin);
  };

  const handleSave = () => {
    if (editingUser) {
      handleRoleChange(editingUser._id, newRole, newIsAdmin);
      window.dispatchEvent(new Event("userProfileUpdated"));
    }
  };

  const handleCancel = () => {
    setEditingUser(null);
  };

  return (
    <div className={styles.adminPanel}>
      <h2>Admin Panel</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        <div className={styles.userTableContainer}>
          <table className={styles.userTable}>
            <thead>
              <tr>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>{user.role}{user.isAdmin ? " (admin)" : ""}</td>
                  <td>
                    <button onClick={() => handleEditClick(user)}>Edit</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Therapist session section */}
      <h3 className={styles.therapistTitle}>Therapist Session History</h3>
      {therapistSessions.length === 0 ? (
        <p>No session data found.</p>
      ) : (
        <div className={styles.therapistTableContainer}>
          {therapistSessions.map((t, i) => (
            <div key={i} className={styles.therapistCard}>
              <h4>Dr' {t.therapist}</h4>
              <table className={styles.sessionTable}>
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Session Count</th>
                  </tr>
                </thead>
                <tbody>
                  {t.patients.map((p, j) => (
                    <tr key={j}>
                      <td>{p.name}</td>
                      <td>{p.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}

      {/* 🔥 Added charts rendering section here */}
      <AdminCharts />

      {editingUser && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Edit User Role</h3>
            <div className={styles.fieldGroup}>
              <label className={styles.fieldLabel}>Set Role:</label>
              <select
                value={newRole}
                onChange={(e) =>
                  setNewRole(e.target.value as "doctor" | "patient")
                }
                className={styles.selectInput}
              >
                <option value="patient">Patient</option>
                <option value="doctor">Doctor</option>
              </select>
            </div>
            <div className={styles.fieldGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={newIsAdmin}
                  onChange={(e) => setNewIsAdmin(e.target.checked)}
                />
                <span>Admin</span>
              </label>
            </div>
            <div className={styles.modalButtons}>
              <button onClick={handleSave}>Save</button>
              <button onClick={handleCancel}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
