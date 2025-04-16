import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/ManageAppointmentsPage.module.css";
import { Appointment } from "../../types/appointment";

import { formatDateShortFancy, formatSlot } from "../../utiles/dateUtils";

interface HistoryAppointmentsProps {
  appointments: Appointment[];
}

const HistoryAppointments: React.FC<HistoryAppointmentsProps> = ({ appointments }) => {
  const navigate = useNavigate();

  const historyAppointments = (appointments || []).filter((apt) => {
    return apt.status.toLowerCase() === "passed" || apt.status.toLowerCase() === "canceled";
  });

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
            <th>AI Summary</th>
          </tr>
        </thead>
        <tbody>
          {historyAppointments.map((apt) => {
            const statusLower = apt.status.toLowerCase();
            const isPassed = statusLower === "passed";

            const fancyDate = formatDateShortFancy(apt.appointmentDate); 
            const fancyTime = formatSlot(apt.appointmentDate);           

            return (
              <tr key={apt._id} className={apt.isEmergency ? styles.emergencyRow : ""}>
                <td>{apt.patientId?.username || "Unknown"}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      styles["status" + apt.status.charAt(0).toUpperCase() + apt.status.slice(1)]
                    }`}
                  >
                    {apt.status}
                  </span>
                </td>
                <td>
                  {fancyDate} {fancyTime}
                </td>
                <td>
                  {isPassed ? (
                    <button className={styles.chatButton} onClick={() => goToChatHistory(apt._id)}>
                      Chat History
                    </button>
                  ) : (
                    "N/A"
                  )}
                </td>
                <td>
                  {isPassed ? (
                    <button
                      className={styles.chatButton}
                      onClick={() =>
                        navigate(`/summary/${apt._id}`, {
                          state: {
                            patientName: apt.patientId?.username || "Unknown",
                            date: apt.appointmentDate,
                          },
                        })
                      }
                    >
                      AI Summary
                    </button>
                  ) : (
                    "N/A"
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default HistoryAppointments;