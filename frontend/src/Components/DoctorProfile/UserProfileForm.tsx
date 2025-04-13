// UserProfileForm.tsx
import React from "react";
import styles from "../../css/ProfilePage.module.css";

interface UserProfileFormProps {
  editing: boolean;
  fullName: string;
  phoneNumber: string;
  dateOfBirth: string;
  gender: string;
  onFullNameChange: (value: string) => void;
  onPhoneNumberChange: (value: string) => void;
  onDateOfBirthChange: (value: string) => void;
  onGenderChange: (value: string) => void;
}

const UserProfileForm: React.FC<UserProfileFormProps> = ({
  editing,
  fullName,
  phoneNumber,
  dateOfBirth,
  gender,
  onFullNameChange,
  onPhoneNumberChange,
  onDateOfBirthChange,
  onGenderChange,
}) => {
  return (
    <div className={styles.formContainer}>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label>Full Name</label>
          <input
            type="text"
            value={fullName}
            onChange={(e) => onFullNameChange(e.target.value)}
            disabled={!editing}
          />
        </div>
        <div className={styles.formField}>
          <label>Phone Number</label>
          <input
            type="text"
            value={phoneNumber}
            onChange={(e) => onPhoneNumberChange(e.target.value)}
            disabled={!editing}
          />
        </div>
      </div>
      <div className={styles.formRow}>
        <div className={styles.formField}>
          <label>Date of Birth</label>
          <input
            type="date"
            value={dateOfBirth}
            onChange={(e) => onDateOfBirthChange(e.target.value)}
            disabled={!editing}
          />
        </div>
        <div className={styles.formField}>
          <label>Gender</label>
          <select
            value={gender}
            onChange={(e) => onGenderChange(e.target.value)}
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
  );
};

export default UserProfileForm;