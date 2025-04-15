import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/ManageAppointmentsPage.module.css";
import { updateAppointment } from "../../Services/appointmentService";
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
  const [selectedNotes, setSelectedNotes] = useState<string[] | null>(null);
  const [showNotesPopup, setShowNotesPopup] = useState<boolean>(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(0);
  const navigate = useNavigate();

  const activeAppointments = (appointments || []).filter((apt) => {
    return apt.status.toLowerCase() !== "passed" && apt.status.toLowerCase() !== "canceled";
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
      const res = await updateAppointment(appointmentId, {
        status: "canceled",
      });
      setAppointments((prev) =>
        prev.map((apt) => (apt._id === appointmentId ? res.appointment : apt))
      );
      setCancelConfirmId(null);
    } catch (error) {
      console.error("Error canceling appointment:", error);
    }
  };

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
            <th>Actions</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {activeAppointments.map((apt) => (
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
              <td style={{ position: "relative" }} className={styles.actionsContainer}>
                <>
                  <button onClick={() => handleEditClick(apt)} className={styles.editBtn}>
                    Edit
                  </button>
                  <button onClick={() => handleCancel(apt._id)} className={styles.cancelBtn}>
                    Cancel
                  </button>
                  {apt.status.toLowerCase() !== "passed" && (
                    <button className={styles.chatButton} onClick={() => goToChat(apt._id)}>
                      Go to Chat
                    </button>
                  )}
                </>
                {cancelConfirmId === apt._id && (
                  <div className={styles.modalOverlay}>
                    <div className={styles.modal}>
                      <p>Are you sure you want to cancel the appointment?</p>
                      <div className={styles.modalButtons}>
                        <button onClick={() => confirmCancel(apt._id)}>Yes</button>
                        <button onClick={() => setCancelConfirmId(null)}>No</button>
                      </div>
                    </div>
                  </div>
                )}
              </td>
              <td>
                <span
                  style={{ cursor: "pointer" }}
                  onClick={() => {
                    const notesList = Array.isArray(apt.notes) ? apt.notes : [];
                    setSelectedNotes(notesList);
                    setCurrentNoteIndex(0);
                    setShowNotesPopup(true);
                  }}
                >
                  📝
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showNotesPopup && selectedNotes && selectedNotes.length > 0 && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Diary Notes</h3>
            <div style={{ minHeight: "120px", marginBottom: "10px" }}>
              {selectedNotes[currentNoteIndex]}
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "15px",
              }}
            >
              <button
                onClick={() => setCurrentNoteIndex((prev) => prev - 1)}
                disabled={currentNoteIndex === 0}
              >
                Previous
              </button>

              <span>
                {currentNoteIndex + 1} / {selectedNotes.length}
              </span>

              <button
                onClick={() => setCurrentNoteIndex((prev) => prev + 1)}
                disabled={currentNoteIndex === selectedNotes.length - 1}
              >
                Next
              </button>
            </div>

            <button
              onClick={() => {
                setShowNotesPopup(false);
                setCurrentNoteIndex(0);
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default CurrentAppointments;
