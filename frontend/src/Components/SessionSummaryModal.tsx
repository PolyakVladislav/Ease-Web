import React, { useEffect, useRef, useState } from "react";
import styles from "../css/SessionSummaryModal.module.css";
import axiosInstance from "../Services/axiosInstance";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import patientsStyles from "../css/DoctorPatientsTable.module.css"; 

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

  // ✅ Ref to target the summary block
  const summaryRef = useRef<HTMLDivElement>(null);

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

  // ✅ PDF Export Function
  const handleDownloadPdf = async () => {
    if (!summaryRef.current) return;

    const canvas = await html2canvas(summaryRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.text("AI Session Summary", 10, 10);
    pdf.addImage(imgData, "PNG", 10, 20, 190, 0);
    pdf.save(`session-summary-${appointmentId}.pdf`);
  };

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
            <div ref={summaryRef}>
              <pre className={styles.summaryText}>{summary}</pre>
            </div>
          )}
        </div>
        <div className={styles.modalFooter}>
          <div style={{ display: "flex", gap: "12px" }}>
            {!loading && !error && (
              <button
                onClick={handleDownloadPdf}
                className={patientsStyles.actionButton}
              >
                Download PDF
              </button>
            )}
            <button onClick={onClose} className={patientsStyles.actionButton}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionSummaryModal;
