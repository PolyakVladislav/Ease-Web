import React, { useState, useEffect } from "react";
import styles from "../css/ManageAppointmentsPage.module.css";
import { Appointment } from "../types/appointment";
import PatientSearchModal from "./PatientSearchModal";
import TimeSelectionModal from "./TimeSelectionModal";
import { fetchAppointments, createAppointment, updateAppointment } from "../Services/appointmentService";

const ManageAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<{ _id: string; username: string } | null>(null);

  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [editDateTime, setEditDateTime] = useState("");
  const [editStatus, setEditStatus] = useState<"pending" | "confirmed" | "canceled" | "completed">("pending");

  useEffect(() => {
    fetchAppointments()
      .then((data) => setAppointments(data.appointments))
      .catch((err) => {
        console.error("Error fetching appointments:", err);
        setError("Failed to fetch appointments.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleAssignAppointment = () => {
    setShowPatientModal(true);
  };

  const handlePatientSelect = (patient: { _id: string; username: string; email?: string }) => {
    setSelectedPatient({ _id: patient._id, username: patient.username });
    setShowPatientModal(false);
    setShowTimeModal(true);
  };

  const handleTimeSelect = async (dateTime: string, isEmergency: boolean, notes: string) => {
    if (!selectedPatient) return;
    try {
      const doctorId = localStorage.getItem("userId");
      if (!doctorId) throw new Error("Doctor ID not found");
  
      const res = await createAppointment({
        patientId: selectedPatient._id,
        doctorId,
        appointmentDate: new Date(dateTime),
        isEmergency,
        notes,
      });
  
      const newAppointments = [...appointments, res.appointment].sort((a, b) => {
        if (a.isEmergency !== b.isEmergency) {
          return b.isEmergency ? 1 : -1;
        }
        return new Date(a.appointmentDate).getTime() - new Date(b.appointmentDate).getTime();
      });
      setAppointments(newAppointments);
      setShowTimeModal(false);
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error creating appointment:", error);
      setError("Failed to create appointment.");
    }
  };

  const handleEditClick = (apt: Appointment) => {
    setEditingAppointment(apt);
    setEditDateTime(new Date(apt.appointmentDate).toISOString().slice(0,16));
    setEditStatus(apt.status);
  };

  const handleUpdateAppointment = async () => {
    if (!editingAppointment) return;
    try {
      const res = await updateAppointment(editingAppointment._id, {
        appointmentDate: new Date(editDateTime),
        status: editStatus,
      });
      setAppointments(appointments.map((apt) => apt._id === res.appointment._id ? res.appointment : apt));
      setEditingAppointment(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
      setError("Failed to update appointment.");
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const res = await updateAppointment(appointmentId, { status: "canceled" });
      setAppointments(appointments.map((apt) => apt._id === res.appointment._id ? res.appointment : apt));
    } catch (error) {
      console.error("Error canceling appointment:", error);
      setError("Failed to cancel appointment.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Appointments</h2>
        <button className={styles.addButton} onClick={handleAssignAppointment}>
          + Assign Appointment
        </button>
      </div>

      {loading ? (
        <p>Loading appointments...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
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
            {appointments.map((apt) => (
              <tr key={apt._id} className={apt.isEmergency ? styles.emergencyRow : ""}>
                <td>{apt.patientName || "Unknown"}</td>
                <td>{apt.status}</td>
                <td>{new Date(apt.appointmentDate).toLocaleString()}</td>
                <td>{apt.notes || "-"}</td>
                <td>
                  <button className={styles.editBtn} onClick={() => handleEditClick(apt)}>
                    Edit
                  </button>
                  <button className={styles.cancelBtn} onClick={() => handleCancelAppointment(apt._id)}>
                    Cancel
                  </button>
                  <button className={styles.chatButton} onClick={() => console.log("Go to chat for", apt.patientName)}>
                    Go to Chat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showPatientModal && (
        <PatientSearchModal 
          onPatientSelect={handlePatientSelect} 
          onClose={() => setShowPatientModal(false)} 
        />
      )}

      {showTimeModal && (
        <TimeSelectionModal 
          onTimeSelect={handleTimeSelect} 
          onClose={() => { setShowTimeModal(false); setSelectedPatient(null); }} 
        />
      )}

      {editingAppointment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h3>Edit Appointment</h3>
            <div className={styles.formRow}>
              <label>Date & Time</label>
              <input
                type="datetime-local"
                value={editDateTime}
                onChange={(e) => setEditDateTime(e.target.value)}
                className={styles.input}
              />
            </div>
            <div className={styles.formRow}>
              <label>Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as "pending" | "confirmed" | "canceled" | "completed")}
                className={styles.input}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="canceled">Canceled</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.saveModalBtn} onClick={handleUpdateAppointment}>
                Save
              </button>
              <button className={styles.cancelModalBtn} onClick={() => setEditingAppointment(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageAppointmentsPage;
