import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../css/ProfilePage.module.css";
import patientsStyles from "../../css/DoctorPatientsTable.module.css";

import { getPatientSessions, fetchStoredOverallSummary } from "../../Services/appointmentService";
import { formatDateShortFancy, formatSlot } from "../../utiles/dateUtils";

interface Session {
  _id: string;
  appointmentDate: string;
  status: string;
  summary?: string;
}

const PatientRecord: React.FC = () => {
  const { patientId } = useParams();
  const navigate = useNavigate();
  
  const [sessions, setSessions] = useState<Session[]>([]);
  const [patientName, setPatientName] = useState("");

  const [overallSummary, setOverallSummary] = useState<string>("");

  useEffect(() => {
    if (!patientId) return;
    const docId = localStorage.getItem("userId") || "";

    getPatientSessions(patientId, docId)
      .then((res) => {
        setSessions(res.sessions);
        setPatientName(res.patientName);
      })
      .catch((err) => console.error("Error fetching patient sessions:", err));

    fetchStoredOverallSummary(patientId, docId)
      .then((data) => {
        if (data.success) {
          setOverallSummary(data.overallSummary || "");
        }
      })
      .catch((err) => console.error("Error fetching overall summary:", err));
  }, [patientId]);

  const passedSessions = sessions.filter((s) => s.status === "passed");

  return (
    <div className={styles.patientsTableContainer}>
      <h3 className={styles.tableTitle}>Session Record for {patientName}</h3>

      <table className={patientsStyles.table}>
        <thead>
          <tr>
            <th>Date / Time</th>
            <th>Chat</th>
            <th>AI Summary</th>
          </tr>
        </thead>
        <tbody>
          {passedSessions.map((s) => {
            const fancyDate = formatDateShortFancy(s.appointmentDate);
            const fancyTime = formatSlot(s.appointmentDate);
            return (
              <tr key={s._id}>
                <td>
                  {fancyDate} {fancyTime}
                </td>
                <td>
                  <button
                    className={patientsStyles.actionButton}
                    onClick={() => navigate(`/meetings/${s._id}/chat`)}
                  >
                    Chat
                  </button>
                </td>
                <td>
                  <button
                    className={patientsStyles.actionButton}
                    onClick={() =>
                      navigate(`/summary/${s._id}`, {
                        state: {
                          patientName,
                          date: s.appointmentDate,
                        },
                      })
                    }
                  >
                    AI Summary
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <div style={{ marginTop: "30px" }}>
        <h3>Overall AI Summary</h3>
        {overallSummary ? (
          <div
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              whiteSpace: "pre-wrap",
            }}
          >
            {overallSummary}
          </div>
        ) : (
          <p>No overall summary available yet.</p>
        )}
      </div>
    </div>
  );
};

export default PatientRecord;