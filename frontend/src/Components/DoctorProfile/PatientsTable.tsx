import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/ProfilePage.module.css";
import { Appointment } from "../../types/appointment";
import { Patient } from "../../types/user";

interface PatientsTableProps {
  appointments: Appointment[];
}

const PatientsTable: React.FC<PatientsTableProps> = ({ appointments }) => {
  const navigate = useNavigate();

  const patientsMap = new Map<string, Patient>();

  appointments.forEach((apt) => {
    if (!apt.patientId) return;

    const patientId =
      typeof apt.patientId === "string"
        ? apt.patientId
        : (apt.patientId as { _id?: string })._id || "unknown";
    const patientName =
      typeof apt.patientId === "object"
        ? (apt.patientId as { username?: string }).username || "Unknown"
        : "Unknown";
    const meetingDate = new Date(apt.appointmentDate).toISOString();

    if (!patientsMap.has(patientId)) {
      patientsMap.set(patientId, {
        _id: patientId,
        fullName: patientName,
        lastSessionDate: meetingDate,
        nextAppointment: apt.status === "confirmed" ? meetingDate : undefined,
      });
    } else {
      const existing = patientsMap.get(patientId)!;
      if (new Date(meetingDate) > new Date(existing.lastSessionDate || 0)) {
        existing.lastSessionDate = meetingDate;
      }
      if (apt.status === "confirmed" && !existing.nextAppointment) {
        existing.nextAppointment = meetingDate;
      }
    }
  });

  const patients = Array.from(patientsMap.values());

  const handleSchedule = (patientId: string) => {
    navigate("/appointmens", { state: { patientId } });
  };

  const handleHistory = (patientId: string) => {
    alert(`Show history for patient ${patientId}`);
  };

  return (
    <div className={styles.patientsTableContainer}>
      <h3 className={styles.tableTitle}>My Patients</h3>
      <table className={styles.patientsTable}>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Last Session</th>
            <th>Next Appointment</th>
            <th>History</th>
          </tr>
        </thead>
        <tbody>
          {patients.map((patient) => (
            <tr key={patient._id}>
              <td>{patient.fullName}</td>
              <td>
                {patient.lastSessionDate
                  ? new Date(patient.lastSessionDate).toLocaleDateString()
                  : "-"}
              </td>
              <td>
                {patient.nextAppointment ? (
                  new Date(patient.nextAppointment).toLocaleDateString()
                ) : (
                  <button
                    className={styles.chatButton}
                    onClick={() => handleSchedule(patient._id)}
                  >
                    Schedule Appointment
                  </button>
                )}
              </td>
              <td>
                <button
                  className={styles.chatButton}
                  onClick={() => handleHistory(patient._id)}
                >
                  History
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PatientsTable;
