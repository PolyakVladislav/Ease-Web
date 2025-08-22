import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/ManageAppointmentsPage.module.css";
import { updateAppointment } from "../../Services/appointmentService";
import { Appointment } from "../../types/appointment";
import { getAppointmentNotes } from "../../Services/appointmentService";

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
  const [selectedNotes, setSelectedNotes] = useState<any[] | null>(null);
  const [showNotesPopup, setShowNotesPopup] = useState<boolean>(false);
  const [currentNoteIndex, setCurrentNoteIndex] = useState<number>(0);
  const navigate = useNavigate();

  const activeAppointments = (appointments || []).filter((apt) => {
    return (
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

  const fetchNotes = async (patientId: string) => {
    try {
      const response = await getAppointmentNotes(patientId); 
      setSelectedNotes(response.notes || []);
      setCurrentNoteIndex(0);
      setShowNotesPopup(true);
    } catch (error) {
      console.error("Failed to fetch notes:", error);
      showAlert("Failed to load notes");
    }
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

  // Helper function to check if notes exist and have content
  const hasNotes = (notes: any): boolean => {
    if (!notes) return false;
    if (Array.isArray(notes)) return notes.length > 0;
    if (typeof notes === 'string') return notes.trim().length > 0;
    return false;
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
          {activeAppointments.map((apt) => {
            return (
              <tr
                key={apt._id}
                className={apt.isEmergency ? styles.emergencyRow : ""}
              >
                <td>{apt.patientId?.username}</td>
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
                <td>
                  {`${apt.appointmentDate.slice(0, 10)} ${apt.appointmentDate.slice(
                    11,
                    16
                  )}`}
                </td>
                <td style={{ position: "relative" }} className={styles.actionsContainer}>
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
                <td>
                  {hasNotes(apt.notes) ? (
                    <span
                      style={{ cursor: "pointer" }}
                      onClick={() => fetchNotes(apt.patientId?._id || "")}
                    >
                      📝
                    </span>
                  ) : (
                    <span
                      style={{
                        color: "#666",
                        fontStyle: "italic",
                        fontSize: "0.9rem",
                      }}
                    >
                      No diary yet
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {showNotesPopup && selectedNotes && selectedNotes.length > 0 && (
        <div className={styles.modalOverlay}>
          <div className={`${styles.modal} ${styles.diaryModal}`}>
            <h2>🗒️ Diary Notes</h2>

            <div className={styles.diaryNoteContent}>
              {selectedNotes[currentNoteIndex] && (
                <>
                  <div style={{ marginBottom: '10px' }}>
                    <strong>Date:</strong> {new Date(selectedNotes[currentNoteIndex].date).toLocaleDateString()}
                  </div>
                  <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                    {selectedNotes[currentNoteIndex].nlpSummary || 'No NLP summary available'}
                  </div>
                </>
              )}
            </div>

            <div className={styles.diaryPagination}>
              <button
                onClick={() =>
                  setCurrentNoteIndex((prev) => Math.max(prev - 1, 0))
                }
                disabled={currentNoteIndex === 0}
              >
                ◀ Previous
              </button>

              <span>
                {currentNoteIndex + 1} / {selectedNotes.length}
              </span>

              <button
                onClick={() =>
                  setCurrentNoteIndex((prev) =>
                    Math.min(prev + 1, selectedNotes.length - 1)
                  )
                }
                disabled={currentNoteIndex === selectedNotes.length - 1}
              >
                Next ▶
              </button>
            </div>

            <div className={styles.diaryCloseContainer}>
              <button
                onClick={() => {
                  setShowNotesPopup(false);
                  setCurrentNoteIndex(0);
                }}
                className={styles.diaryCloseBtn}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CurrentAppointments;