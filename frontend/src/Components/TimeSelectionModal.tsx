import React, { useState } from "react";
import styles from "../css/TimeSelectionModal.module.css";

interface Props {
  onTimeSelect: (dateTime: string, isEmergency: boolean, notes: string) => void;
  onClose: () => void;
}

const TimeSelectionModal: React.FC<Props> = ({ onTimeSelect, onClose }) => {
  const [appointmentDateTime, setAppointmentDateTime] = useState("");
  const [isEmergency, setIsEmergency] = useState(false);
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!appointmentDateTime) {
      setError("Please select a date and time");
      setTimeout(() => setError(""), 2000);
      return;
    }
    onTimeSelect(appointmentDateTime, isEmergency, notes);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Select Appointment Date & Time</h3>
        </div>
        <div className={styles.modalBody}>
          <label className={styles.label}>Date & Time</label>
          <input
            type="datetime-local"
            value={appointmentDateTime}
            onChange={(e) => setAppointmentDateTime(e.target.value)}
            className={styles.dateTimeInput}
          />
          <div className={styles.emergencyRow}>
            <input
              type="checkbox"
              id="emergencyCheck"
              checked={isEmergency}
              onChange={(e) => setIsEmergency(e.target.checked)}
              className={styles.emergencyCheckbox}
            />
            <label
              htmlFor="emergencyCheck"
              className={isEmergency ? styles.emergencyLabelActive : styles.emergencyLabel}
            >
              Emergency
            </label>
          </div>
          <label className={styles.label}>Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className={styles.notesInput}
            placeholder="Enter any additional comments..."
            maxLength={15}
          />
          {error && <p className={styles.error}>{error}</p>}
        </div>
        <div className={styles.modalFooter}>
          <button onClick={handleConfirm} className={styles.confirmButton}>
            Confirm
          </button>
          <button onClick={onClose} className={styles.cancelButton}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default TimeSelectionModal;