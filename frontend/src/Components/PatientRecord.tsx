import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../css/ProfilePage.module.css";
import patientsStyles from "../css/DoctorPatientsTable.module.css";

import { getPatientSessions } from "../Services/appointmentService";
import SessionSummaryModal from "../Components/SessionSummaryModal";

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
  const [activeSummaryId, setActiveSummaryId] = useState<string | null>(null);

  useEffect(() => {
    if (!patientId) return;
    getPatientSessions(patientId)
      .then((res) => {
        setSessions(res.sessions);
        setPatientName(res.patientName);
      })
      .catch((err) => console.error("Error fetching patient sessions:", err));
  }, [patientId]);

  return (
    <div className={styles.patientsTableContainer}>
      <h3 className={styles.tableTitle}>Session Record for {patientName}</h3>
      <table className={patientsStyles.table}>
        <thead>
          <tr>
            <th>Date</th>
            <th>Status</th>
            <th>Chat</th>
            <th>AI Summary</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => (
            <tr key={s._id}>
              <td>{new Date(s.appointmentDate).toLocaleString()}</td>
              <td>{s.status}</td>
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
                  onClick={() => setActiveSummaryId(s._id)}
                >
                  AI Summary
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {activeSummaryId && (
        <SessionSummaryModal
          appointmentId={activeSummaryId}
          onClose={() => setActiveSummaryId(null)}
        />
      )}
    </div>
  );
};

export default PatientRecord;
