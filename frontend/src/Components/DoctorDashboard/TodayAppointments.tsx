import React from "react";
import { useNavigate } from "react-router-dom";
import { Appointment } from "../../types/appointment";
import { timeLeftUntil } from "../../utiles/dateUtils";
import styles from "../../css/DoctorDashboard/TodayAppointments.module.css";

type Props = {
  appointments: Appointment[];
};

const TodayAppointments: React.FC<Props> = ({ appointments }) => {
  const navigate = useNavigate();

  if (!appointments || appointments.length === 0) {
    return (
      <div className={styles.container}>
        <h3 className={styles.title}>Today's Appointments</h3>
        <p className={styles.noData}>No confirmed appointments for today</p>
      </div>
    );
  }

  function goToChat(apptId: string) {
    navigate(`/meetings/${apptId}/chat`);
  }

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Today's Appointments</h3>

      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Type</th>
              <th>Patient</th>
              <th>Time Left</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => {
              const dateObj = new Date(appt.appointmentDate);
              const timeStr = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              const leftStr = timeLeftUntil(appt.appointmentDate);
              const diffMin = Math.floor((dateObj.getTime() - Date.now()) / 60000);
              const canStartChat = diffMin <= 10;

              const patientName = appt.patientName || appt.patientId?.username || "Unknown";

              const isEmergency = appt.isEmergency;
              const chipClass = isEmergency ? styles.chipEmergency : "";

              return (
                <tr key={appt._id}>
                  <td>{timeStr}</td>
                  <td>
                    <span className={`${styles.chip} ${chipClass}`}>
                      {isEmergency ? "Emergency" : "Regular"}
                    </span>
                  </td>
                  <td>{patientName}</td>
                  <td>{leftStr}</td>
                  <td>
                    {canStartChat ? (
                      <button
                        className={styles.actionButton}
                        onClick={() => goToChat(appt._id)}
                      >
                        Go to Chat
                      </button>
                    ) : (
                      <span className={styles.infoText}>
                        Available 10 min before
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TodayAppointments;