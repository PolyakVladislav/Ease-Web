// PatientsWithSessionsTable.tsx
import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/ProfilePage.module.css";

interface SessionData {
  appointmentDate: string;
}

interface PatientData {
  _id: string;
  username: string;
}

interface PatientsWithSessionsEntry {
  patient: PatientData;
  sessions: SessionData[];
}

interface PatientsWithSessionsTableProps {
  patientsWithSessions: PatientsWithSessionsEntry[];
}

const PatientsWithSessionsTable: React.FC<PatientsWithSessionsTableProps> = ({
  patientsWithSessions,
}) => {
  const navigate = useNavigate();

  return (
    <div className={styles.patientsTableContainer}>
      <h3 className={styles.tableTitle}>My Patients</h3>
      <table className={styles.patientsTable}>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Last Session</th>
            <th>Next Appointment</th>
            <th>Patient Record</th>
          </tr>
        </thead>
        <tbody>
          {patientsWithSessions.map((entry) => {
            const sessions = entry.sessions || [];
            // Сортируем по дате, чтобы определить последнюю и ближайшую сессии
            const sorted = [...sessions].sort(
              (a, b) =>
                new Date(b.appointmentDate).getTime() -
                new Date(a.appointmentDate).getTime()
            );
            const last = sorted.find(
              (s) => new Date(s.appointmentDate) < new Date()
            );
            const next = sorted.find(
              (s) => new Date(s.appointmentDate) > new Date()
            );

            return (
              <tr key={entry.patient._id}>
                <td>{entry.patient.username}</td>
                <td>
                  {last
                    ? new Date(last.appointmentDate).toLocaleString()
                    : "N/A"}
                </td>
                <td>
                  {next
                    ? new Date(next.appointmentDate).toLocaleString()
                    : "N/A"}
                </td>
                <td>
                  <button
                    className={styles.chatButton}
                    onClick={() =>
                      navigate(`/patients/${entry.patient._id}/record`)
                    }
                  >
                    Patient Record
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

export default PatientsWithSessionsTable;