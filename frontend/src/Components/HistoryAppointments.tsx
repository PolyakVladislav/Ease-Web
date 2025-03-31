import React from "react";
import styles from "../css/ManageAppointmentsPage.module.css";
import { Appointment } from "../types/appointment";

interface HistoryAppointmentsProps {
  appointments: Appointment[];
}

const HistoryAppointments: React.FC<HistoryAppointmentsProps> = ({
  appointments,
}) => {
  const historyAppointments = (appointments || []).filter((apt) => {
    const aptTime = new Date(apt.appointmentDate).getTime();
    const now = Date.now();
    return aptTime < now || apt.status.toLowerCase() === "canceled";
  });

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
          {historyAppointments.map((apt) => {
            const now = Date.now();
            const aptTime = new Date(apt.appointmentDate).getTime();
            const displayStatus =
              aptTime < now && apt.status.toLowerCase() !== "canceled"
                ? "passed"
                : apt.status.toLowerCase();
            return (
              <tr
                key={apt._id}
                className={apt.isEmergency ? styles.emergencyRow : ""}
              >
                <td>{apt.patientId && apt.patientId.username}</td>
                <td>
                  <span
                    className={`${styles.statusBadge} ${
                      styles[
                        "status" +
                          displayStatus.charAt(0).toUpperCase() +
                          displayStatus.slice(1)
                      ]
                    }`}
                  >
                    {displayStatus}
                  </span>
                </td>
                <td>{new Date(apt.appointmentDate).toLocaleString()}</td>
                <td>
                  {displayStatus === "passed" ? (
                    <button className={styles.chatButton}>Chat History</button>
                  ) : (
                    <span>Appointment was canceled</span>
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
