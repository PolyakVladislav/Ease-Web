import React, { ChangeEvent } from "react";
import styles from "../../css/ProfilePage.module.css";

interface UserProfileHeaderProps {
  username: string;
  email: string;
  profilePicture?: string;
  previewUrl: string | null;
  editing: boolean;
  onEditClick: () => void;
  onSaveClick: () => void;
  onCancelClick: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({
  username,
  email,
  profilePicture,
  previewUrl,
  editing,
  onEditClick,
  onSaveClick,
  onCancelClick,
  onFileChange,
}) => {
  return (
    <div className={styles.heroSection}>
      <div className={styles.heroContent}>
        <div className={styles.avatarWrapper}>
          {previewUrl ? (
            <img src={previewUrl} alt="Preview" className={styles.avatar} />
          ) : profilePicture ? (
            <img src={profilePicture} alt="Avatar" className={styles.avatar} />
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
                  onChange={onFileChange}
                  style={{ display: "none" }}
                />
              </label>
            </div>
          )}
        </div>
        <div className={styles.userBasicInfo}>
          <h2 className={styles.userFullName}>{username}</h2>
          <p className={styles.userEmail}>{email}</p>
        </div>
        {!editing ? (
          <button className={styles.editButton} onClick={onEditClick}>
            Edit
          </button>
        ) : (
          <div className={styles.editButtons}>
            <button className={styles.saveButton} onClick={onSaveClick}>
              Save
            </button>
            <button className={styles.cancelButton} onClick={onCancelClick}>
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileHeader;