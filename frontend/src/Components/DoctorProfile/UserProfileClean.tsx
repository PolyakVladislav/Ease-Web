import React, { useState, useEffect, ChangeEvent } from "react";
import styles from "../../css/ProfilePage.module.css";
import {
  fetchUserProfile,
  updateUserProfileWithImage,
} from "../../Services/userService";
import { fetchAppointments } from "../../Services/appointmentService";
import { User } from "../../types/user";
import { Appointment } from "../../types/appointment";
import PatientsTable from "./PatientsTable";
import ScheduleEditor from "./ScheduleEditor";
import DayOffEditor from "./DayOffEditor";

const UserProfileClean: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    const userId = localStorage.getItem("userId");
    if (userId) {
      fetchUserProfile(userId)
        .then((data) => {
          const fetchedUser = data.user;
          setUser(fetchedUser);
          setFullName(fetchedUser.username);
          setPhoneNumber(fetchedUser.phoneNumber || "");
          setGender(fetchedUser.gender || "");
          if (fetchedUser.dateOfBirth) {
            const dob = new Date(fetchedUser.dateOfBirth);
            setDateOfBirth(dob.toISOString().split("T")[0]);
          }
        })
        .catch((err) => console.error("Error fetching user profile", err));

      // Получаем встречи для формирования списка пациентов
      fetchAppointments()
        .then((data) => setAppointments(data.appointments))
        .catch((err) => console.error("Error fetching appointments", err));
    }
  }, []);

  const handleEditClick = () => setEditing(true);

  const handleCancelClick = () => {
    if (!user) return;
    setFullName(user.username);
    setPhoneNumber(user.phoneNumber || "");
    setGender(user.gender || "");
    if (user.dateOfBirth) {
      const dob = new Date(user.dateOfBirth);
      setDateOfBirth(dob.toISOString().split("T")[0]);
    } else {
      setDateOfBirth("");
    }
    setSelectedFile(null);
    setPreviewUrl(null);
    setEditing(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPreviewUrl(URL.createObjectURL(e.target.files[0]));
    }
  };

  const handleSaveClick = async () => {
    if (!user) return;
    const userId = localStorage.getItem("userId");
    if (!userId) return;
    try {
      const updatedData = {
        username: fullName,
        phoneNumber,
        gender: gender as "male" | "female" | "other",
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : undefined,
      };
      const res = await updateUserProfileWithImage(
        userId,
        updatedData,
        selectedFile
      );
      setUser(res.user);
      setFullName(res.user.username);
      setPhoneNumber(res.user.phoneNumber || "");
      setGender(res.user.gender || "");
      if (res.user.dateOfBirth) {
        const dob = new Date(res.user.dateOfBirth);
        setDateOfBirth(dob.toISOString().split("T")[0]);
      } else {
        setDateOfBirth("");
      }
      setSelectedFile(null);
      setPreviewUrl(null);
      setEditing(false);
      window.dispatchEvent(new Event("userProfileUpdated"));
    } catch (err) {
      console.error("Error updating profile", err);
    }
  };

  if (!user) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.profilePage}>
      {/* Секция редактирования профиля */}
      <div className={styles.heroSection}>
        <div className={styles.heroContent}>
          <div className={styles.avatarWrapper}>
            {previewUrl ? (
              <img src={previewUrl} alt="Preview" className={styles.avatar} />
            ) : user.profilePicture ? (
              <img
                src={user.profilePicture}
                alt="Avatar"
                className={styles.avatar}
              />
            ) : (
              <div className={styles.avatarPlaceholder} />
            )}
            {editing && (
              <div className={styles.editPictureWrapper}>
                <label className={styles.editPictureButton}>
                  Edit Picture
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    style={{ display: "none" }}
                  />
                </label>
              </div>
            )}
          </div>
          <div className={styles.userBasicInfo}>
            <h2 className={styles.userFullName}>{user.username}</h2>
            <p className={styles.userEmail}>{user.email}</p>
          </div>
          {!editing ? (
            <button className={styles.editButton} onClick={handleEditClick}>
              Edit
            </button>
          ) : (
            <div className={styles.editButtons}>
              <button className={styles.saveButton} onClick={handleSaveClick}>
                Save
              </button>
              <button
                className={styles.cancelButton}
                onClick={handleCancelClick}
              >
                Cancel
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label>Full Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!editing}
              placeholder="Your Full Name"
            />
          </div>
          <div className={styles.formField}>
            <label>Phone Number</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              disabled={!editing}
              placeholder="Your Phone Number"
            />
          </div>
        </div>
        <div className={styles.formRow}>
          <div className={styles.formField}>
            <label>Date of Birth</label>
            <input
              type="date"
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              disabled={!editing}
              placeholder="Your Date of Birth"
            />
          </div>
          <div className={styles.formField}>
            <label>Gender</label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={!editing}
            >
              <option value="">Your Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
        </div>
      </div>
      {user && user.role === "doctor" && (
        <div className={styles.scheduleSection}>
          <PatientsTable appointments={appointments} />
          <ScheduleEditor doctorId={user._id} />
          <DayOffEditor doctorId={user._id} />
        </div>
      )}
    </div>
  );
};

export default UserProfileClean;
