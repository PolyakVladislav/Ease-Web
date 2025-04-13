import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import styles from "../../css/ProfilePage.module.css";
import patientsStyles from "../../css/DoctorPatientsTable.module.css";

import { getPatientSessions } from "../../Services/appointmentService";
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

  useEffect(() => {
    if (!patientId) return;

    const docId = localStorage.getItem("userId") || undefined;
    getPatientSessions(patientId, docId)
      .then((res) => {
        setSessions(res.sessions);
        setPatientName(res.patientName);
      })
      .catch((err) => console.error("Error fetching patient sessions:", err));
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
    </div>
  );
};

export default PatientRecord;