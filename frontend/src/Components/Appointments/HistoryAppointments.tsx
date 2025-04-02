import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/ManageAppointmentsPage.module.css";
import { Appointment } from "../../types/appointment";

interface HistoryAppointmentsProps {
  appointments: Appointment[];
}

const HistoryAppointments: React.FC<HistoryAppointmentsProps> = ({ appointments }) => {
  const navigate = useNavigate();
  // В историю попадают встречи со статусом "passed" или "canceled"
  const historyAppointments = (appointments || []).filter((apt) => {
    return apt.status.toLowerCase() === "passed" || apt.status.toLowerCase() === "canceled";
  });

  // Функция для перехода в историю чата
  const goToChatHistory = (appointmentId: string) => {
    navigate(`/meetings/${appointmentId}/chat`);
  };

  return (
    <div className={styles.historyContainer}>
      <h3>Appointment History</h3>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Status</th>
            <th>Appointment Date</th>
            <th>Chat History</th>
          </tr>
        </thead>
        <tbody>
          {historyAppointments.map((apt) => (
            <tr key={apt._id} className={apt.isEmergency ? styles.emergencyRow : ""}>
              <td>{apt.patientId && apt.patientId.username}</td>
              <td>
                <span
                  className={`${styles.statusBadge} ${
                    styles["status" + apt.status.charAt(0).toUpperCase() + apt.status.slice(1)]
                  }`}
                >
                  {apt.status}
                </span>
              </td>
              <td>{new Date(apt.appointmentDate).toLocaleString()}</td>
              <td>
                <button className={styles.chatButton} onClick={() => goToChatHistory(apt._id)}>
                  Chat History
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryAppointments;
