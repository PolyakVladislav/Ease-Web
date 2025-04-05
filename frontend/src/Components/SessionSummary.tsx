import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import api from "../Services/axiosInstance";
import styles from "../css/SessionSummary.module.css";

const SessionSummaryPage: React.FC = () => {
  const { meetingId } = useParams<{ meetingId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { patientName, date } = location.state || {};

  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!meetingId) return;
    api
      .get(`/api/summary/${meetingId}`)
      .then((res) => setSummary(res.data.summary))
      .catch(() => setError("Failed to load summary."))
      .finally(() => setLoading(false));
  }, [meetingId]);

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>AI Session Summary</h2>

      <div className={styles.metaBlock}>
        <p>👤 <strong>Patient:</strong> {patientName || "Unknown"}</p>
        <p>📅 <strong>Date:</strong> {date ? new Date(date).toLocaleDateString() : "Unknown"}</p>
        <p>⏰ <strong>Time:</strong> {date ? new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Unknown"}</p>
        <p>🧠 <strong>Summary:</strong></p>
        <hr />
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className={styles.error}>{error}</p>
      ) : (
        <pre className={styles.summary}>{summary}</pre>
      )}

      <div className={styles.backButtonWrapper}>
        <button
          className={styles.chatButton}
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
