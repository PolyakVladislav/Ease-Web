import React, { useEffect, useState } from "react";
import styles from "../css/SessionSummaryModal.module.css";
import axiosInstance from "../Services/axiosInstance";

interface SessionSummaryModalProps {
  appointmentId: string;
  onClose: () => void;
}

const SessionSummaryModal: React.FC<SessionSummaryModalProps> = ({
  appointmentId,
  onClose,
}) => {
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);
        const res = await axiosInstance.get(`/api/summary/${appointmentId}`);
        setSummary(res.data.summary);
        setError(null);
      } catch (err: any) {
        console.error("Error fetching summary:", err);
        setError("Failed to load summary.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [appointmentId]);

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>AI Session Summary</h3>
        </div>
        <div className={styles.modalBody}>
          {loading ? (
            <p>Loading...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : (
            <pre className={styles.summaryText}>{summary}</pre>
          )}
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
