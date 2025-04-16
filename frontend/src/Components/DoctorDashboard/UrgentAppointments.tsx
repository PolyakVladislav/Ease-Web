import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Appointment } from "../../types/appointment";
import {
  fetchUnassignedUrgentAppointments,
  claimUrgentAppointment,
} from "../../Services/appointmentService";
import { formatDateShortFancy, timeAgoFromNow } from "../../utiles/dateUtils";
import styles from "../../css/DoctorDashboard/UrgentAppointments.module.css";

const UrgentAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadUrgent();
  }, []);

  async function loadUrgent() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchUnassignedUrgentAppointments();
      setAppointments(data);
    } catch (err) {
      console.error("Error fetching urgent:", err);
      setError("Failed to load urgent appointments.");
    } finally {
      setLoading(false);
    }
  }

  async function handleClaim(appointmentId: string) {
    try {
      setLoading(true);
      await claimUrgentAppointment(appointmentId);
      const updated = await fetchUnassignedUrgentAppointments();
      setAppointments(updated);
      navigate(`/meetings/${appointmentId}/chat`);
    } catch (err) {
      console.error("Error claiming appointment:", err);
      alert("Failed to claim appointment");
    } finally {
      setLoading(false);
    }
  }

  function getWaitClass(createdAtStr: string) {
    const createdMs = new Date(createdAtStr).getTime();
    const nowMs = Date.now();
    const diffMin = Math.floor((nowMs - createdMs) / 60000);

    if (diffMin < 30) {
      return styles.shortWait; 
    } else if (diffMin < 90) {
      return styles.mediumWait;  
    } else {
      return styles.longWait;    
    }
  }

  return (
    <div className={styles.urgentContainer}>
      <h3 className={styles.title}>Urgent Appointments</h3>

      {error && <div className={styles.errorAlert}>{error}</div>}

      {loading ? (
        <div className={styles.loadingContainer}>
          <div className={styles.spinner}></div>
          <p>Loading urgent appointments...</p>
        </div>
      ) : (
        <>
          {appointments.length === 0 ? (
            <p style={{ fontStyle: "italic", color: "#666" }}>
              No urgent appointments
            </p>
          ) : (
            <div className={styles.list}>
              {appointments.map((appt) => {
                const dateStr = formatDateShortFancy(appt.appointmentDate);
                const createdAgo = appt.createdAt ? timeAgoFromNow(appt.createdAt) : "";
                const patientName =
                  appt.patientName || appt.patientId?.username || "Unknown";

                const waitClass = appt.createdAt ? getWaitClass(appt.createdAt) : "";

                return (
                  <div className={`${styles.card} ${waitClass}`} key={appt._id}>
                    <div className={styles.cardHeader}>
                      <div>
                        <span className={styles.urgentLabel}>URGENT</span>
                        <span className={styles.dateInfo}>
                          {dateStr}
                          {createdAgo && (
                            <span className={styles.createdAgo}>
                              ({createdAgo})
                            </span>
                          )}
                        </span>
                      </div>
                      <button
                        className={styles.claimButton}
                        onClick={() => handleClaim(appt._id)}
                      >
                        Claim
                      </button>
                    </div>

                    <p className={styles.patientInfo}>
                      Patient: {patientName}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default UrgentAppointments;