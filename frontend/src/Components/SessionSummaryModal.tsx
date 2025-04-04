import React from "react";
import styles from "../css/SessionSummaryModal.module.css";

interface SessionSummaryModalProps {
  summary: string;
  onClose: () => void;
}

const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({ summary, onClose }) => {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>AI Session Summary</h3>
        </div>
        <div className={styles.modalBody}>
          <pre className={styles.summaryText}>{summary}</pre>
        </div>
        <div className={styles.modalFooter}>
          <button onClick={onClose} className={styles.closeButton}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default SessionSummaryModal;
