import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/ManageAppointmentsPage.module.css";
import {
  updateAppointment,
  deleteAppointment,
} from "../../Services/appointmentService";
import { Appointment } from "../../types/appointment";

interface CurrentAppointmentsProps {
  appointments: Appointment[];
  setAppointments: React.Dispatch<React.SetStateAction<Appointment[]>>;
  onEditClick?: (apt: Appointment) => void;
}

const CurrentAppointments: React.FC<CurrentAppointmentsProps> = ({
  appointments,
  setAppointments,
  onEditClick,
}) => {
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [alertMessage, setAlertMessage] = useState<string>("");
  const navigate = useNavigate();

  // Активные встречи определяются по статусу (не passed и не canceled)
  const activeAppointments = (appointments || []).filter((apt) => {
    return (
      apt &&
      apt.status.toLowerCase() !== "passed" &&
      apt.status.toLowerCase() !== "canceled"
    );
  });

  const showAlert = (message: string) => {
    setAlertMessage(message);
    setTimeout(() => setAlertMessage(""), 1000);
  };

  const handleEditClick = (apt: Appointment) => {
    if (apt.initiator === "patient") {
      showAlert("Cannot edit an appointment created by the patient");
      return;
    }
    onEditClick?.(apt);
  };

  const handleCancel = (appointmentId: string) => {
    setCancelConfirmId(appointmentId);
  };

  const confirmCancel = async (appointmentId: string) => {
    try {
      //const res = await updateAppointment(appointmentId, {
      //   status: "canceled",
      // });
      const res = await deleteAppointment(appointmentId, "doctor");
      setAppointments((prev) =>
        prev.filter((apt) => apt._id !== appointmentId)
      );
      setCancelConfirmId(null);
    } catch (error) {
      console.error("Error canceling appointment:", error);
    }
  };

  // Функция для перехода в чат (доступна только если встреча активна)
  const goToChat = (appointmentId: string) => {
    navigate(`/meetings/${appointmentId}/chat`);
  };

  return (
    <>
      {alertMessage && (
        <div
          style={{
            position: "fixed",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "10px 20px",
            borderRadius: "8px",
            zIndex: 9999,
          }}
        >
          {alertMessage}
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Status</th>
            <th>Appointment Date</th>
            <th>Notes</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {activeAppointments.map((apt) => (
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
                        apt.status.charAt(0).toUpperCase() +
                        apt.status.slice(1)
                    ]
                  }`}
                >
                  {apt.status}
                </span>
              </td>
              <td>{new Date(apt.appointmentDate).toLocaleString()}</td>
              <td>{apt.notes || "-"}</td>
              <td
                style={{ position: "relative" }}
                className={styles.actionsContainer}
              >
                <>
                  <button
                    onClick={() => handleEditClick(apt)}
                    className={styles.editBtn}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleCancel(apt._id)}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  {/* Кнопка перехода в чат отображается только для активных встреч */}
                  {apt.status.toLowerCase() !== "passed" && (
                    <button
                      className={styles.chatButton}
                      onClick={() => goToChat(apt._id)}
                    >
                      Go to Chat
                    </button>
                  )}
                </>
                {cancelConfirmId === apt._id && (
                  <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                      <p>Are you sure you want to cancel the appointment?</p>
                      <div className={styles.modalButtons}>
                        <button onClick={() => confirmCancel(apt._id)}>
                          Yes
                        </button>
                        <button onClick={() => setCancelConfirmId(null)}>
                          No
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
};

export default CurrentAppointments;
