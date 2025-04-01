import React, { useEffect, useState } from "react";
import styles from "../css/AdminPanel.module.css";
import { getAllUsers, updateUserRole } from "../Services/adminService";
import { User } from "../types/user";

const AdminPanel: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<"doctor" | "patient">("patient");
  const [newIsAdmin, setNewIsAdmin] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    getAllUsers()
      .then((data) => setUsers(data.users))
      .catch((err) => {
        console.error("Error fetching users:", err);
        setError("Failed to fetch users.");
      })
      .finally(() => setLoading(false));
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
      )}

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