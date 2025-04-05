import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/ManageAppointmentsPage.module.css";
import { Appointment } from "../../types/appointment";
import { getSummaryByAppointmentId } from "../../Services/appointmentService"; // ✅ import API function
import SessionSummaryModal from "../SessionSummaryModal";


interface HistoryAppointmentsProps {
  appointments: Appointment[];
}

const HistoryAppointments: React.FC<HistoryAppointmentsProps> = ({ appointments }) => {
  const navigate = useNavigate();

  const [showSummaryModal, setShowSummaryModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [summaryText, setSummaryText] = useState("");
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [errorSummary, setErrorSummary] = useState("");

  const historyAppointments = (appointments || []).filter((apt) => {
    return apt.status.toLowerCase() === "passed" || apt.status.toLowerCase() === "canceled";
  });

  const goToChatHistory = (appointmentId: string) => {
    navigate(`/meetings/${appointmentId}/chat`);
  };

  const handleOpenSummaryModal = async (appointmentId: string) => {
    setShowSummaryModal(true);
    setSelectedAppointmentId(appointmentId);
    setLoadingSummary(true);
    setErrorSummary("");
    setSummaryText("");

    try {
      const summary = await getSummaryByAppointmentId(appointmentId);
      setSummaryText(summary);
    } catch (err) {
      setErrorSummary("Error fetching summary");
      console.error("Summary fetch error:", err);
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleCloseSummaryModal = () => {
    setShowSummaryModal(false);
    setSelectedAppointmentId(null);
    setSummaryText("");
    setErrorSummary("");
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
                <button className={styles.chatButton} onClick={() => navigate(`/summary/${apt._id}`, {
              state: {
              patientName: apt.patientId?.username || "Unknown",
              date: apt.appointmentDate,
              },
             })
        }>   
             AI Summary
          </button>


              </td>
            </tr>
          ))}
        </tbody>
      </table>


{showSummaryModal && (
  <SessionSummaryModal
    summary={loadingSummary ? "Loading summary..." : errorSummary || summaryText}
    onClose={handleCloseSummaryModal}
  />
)}

    </div>
  );
};

export default HistoryAppointments;
