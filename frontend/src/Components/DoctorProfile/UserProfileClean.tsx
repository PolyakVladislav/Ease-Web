import React, { useState, useEffect, ChangeEvent } from "react";
import styles from "../../css/ProfilePage.module.css";
import stylesLoading from "../../css/Loading.module.css";

import {
  fetchUserProfile,
  updateUserProfileWithImage,
} from "../../Services/userService";
import { fetchPatientsWithSessions } from "../../Services/appointmentService";
import { User } from "../../types/user";

import UserProfileHeader from "./UserProfileHeader";
import UserProfileForm from "./UserProfileForm";
import PatientsWithSessionsTable from "./PatientsWithSessionsTable";
import ScheduleEditor from "./ScheduleEditor";
import DayOffEditor from "./DayOffEditor";


interface PatientSessionsEntry {
  patient: {
    _id: string;
    username: string;
  };
  sessions: {
    appointmentDate: string;
  }[];
}

const UserProfileClean: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [editing, setEditing] = useState(false);

  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const [patientsWithSessions, setPatientsWithSessions] = useState<
    PatientSessionsEntry[]
  >([]);

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

          fetchPatientsWithSessions(userId)
            .then((res) => setPatientsWithSessions(res))
            .catch((err) => console.error("Error fetching patients:", err));
        })
        .catch((err) => console.error("Error fetching user profile", err));
    }
  }, []);

  const handleEditClick = () => {
    setEditing(true);
  };

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
    return (
      <div className={stylesLoading.loadingContainer}>
        <div className={stylesLoading.spinner}></div>
        <p className={stylesLoading.loadingText}>Loading, please wait...</p>
      </div>
    );
  }

  return (
    <div className={styles.profilePage}>
      <UserProfileHeader
        username={user.username}
        email={user.email || ""}
        profilePicture={user.profilePicture}
        previewUrl={previewUrl}
        editing={editing}
        onEditClick={handleEditClick}
        onSaveClick={handleSaveClick}
        onCancelClick={handleCancelClick}
        onFileChange={handleFileChange}
      />

      <UserProfileForm
        editing={editing}
        fullName={fullName}
        phoneNumber={phoneNumber}
        dateOfBirth={dateOfBirth}
        gender={gender}
        onFullNameChange={setFullName}
        onPhoneNumberChange={setPhoneNumber}
        onDateOfBirthChange={setDateOfBirth}
        onGenderChange={setGender}
      />
      <div className={styles.scheduleSection}>
        <PatientsWithSessionsTable
          patientsWithSessions={patientsWithSessions}
        />
        <ScheduleEditor doctorId={user._id} />
        <DayOffEditor doctorId={user._id} />
      </div>
    </div>
  );
};

export default UserProfileClean;
