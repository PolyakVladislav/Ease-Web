import React, { useEffect, useRef, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../Services/axiosInstance";
import styles from "../css/SessionSummary.module.css";
import patientsStyles from "../css/DoctorPatientsTable.module.css"; // ✅ for blue button
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const SessionSummaryPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { patientName, date } = location.state || {};

  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const summaryRef = useRef<HTMLDivElement>(null); // ✅ reference to export block

  useEffect(() => {
    if (!meetingId) return;
    api
      .get(`/api/summary/${meetingId}`)
      .then((res) => setSummary(res.data.summary))
      .catch(() => setError("Failed to load summary."))
      .finally(() => setLoading(false));
  }, [meetingId]);

  // ✅ Download function
  const handleDownloadPdf = async () => {
    if (!summaryRef.current) return;

    const canvas = await html2canvas(summaryRef.current);
    const imgData = canvas.toDataURL("image/png");

    const pdf = new jsPDF();
    pdf.text("AI Session Summary", 10, 10);
    pdf.addImage(imgData, "PNG", 10, 20, 190, 0);
    pdf.save(`session-summary-${meetingId}.pdf`);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>AI Session Summary</h2>

      <div className={styles.metaBlock} ref={summaryRef}>
        <p>👤 <strong>Patient:</strong> {patientName || "Unknown"}</p>
        <p>📅 <strong>Date:</strong> {date ? new Date(date).toLocaleDateString() : "Unknown"}</p>
        <p>⏰ <strong>Time:</strong> {date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Unknown"}</p>
        <p>🧠 <strong>Summary:</strong></p>
        <hr />
        {loading ? (
          <p>Loading...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <pre className={styles.summary}>{summary}</pre>
        )}
      </div>

      <div className={styles.backButtonWrapper} style={{ display: "flex", gap: "12px" }}>
        <button
          className={patientsStyles.actionButton}
          onClick={handleDownloadPdf}
        >
          Download PDF
        </button>
        <button
          className={patientsStyles.actionButton}
          onClick={() =>
            navigate("/appointmens", {
              state: { defaultTab: "history" },
            })
          }
        >
          Back to Appointment History
        </button>
      </div>
    </div>
  );
};

export default SessionSummaryPage;
