import React, { useEffect, useState } from "react";
import styles from "../../css/ManageAppointmentsPage.module.css";
import {
  fetchAppointments,
  createAppointment,
  updateAppointment,
} from "../../Services/appointmentService";
import PatientSearchModal from "../PatientSearchModal";
import TimeSelectionModal from "./TimeSelectionModal"; 
import CurrentAppointments from "./CurrentAppointments";
import HistoryAppointments from "./HistoryAppointments";
import { Appointment } from "../../types/appointment";

type ModalMode = "create" | "edit";

const ManageAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const [showPatientModal, setShowPatientModal] = useState<boolean>(false);
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);

  const [timeModalMode, setTimeModalMode] = useState<ModalMode>("create");

  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);

  const [selectedPatient, setSelectedPatient] = useState<{ _id: string; username: string } | null>(null);
  const [viewMode, setViewMode] = useState<"active" | "history">("active");

  useEffect(() => {
    fetchAppointments()
      .then((data) => {
        setAppointments(data.appointments);
      })
      .catch((err) => {
        console.error("Error fetching appointments:", err);
        setError("Failed to fetch appointments.");
      })
      .finally(() => setLoading(false));
  }, []);


  const handleAssignAppointment = () => {
    setSelectedPatient(null);
    setEditingAppointment(null);
    setTimeModalMode("create");
    setShowPatientModal(true);
  };

  const handlePatientSelect = (patient: { _id: string; username: string }) => {
    setSelectedPatient(patient);
    setShowPatientModal(false);
    setTimeModalMode("create");
    setShowTimeModal(true);
  };

  const handleTimeSelectCreate = async (dateTime: string, isEmergency: boolean, notes: string) => {
    if (!selectedPatient) return;
    try {
      const doctorId = localStorage.getItem("userId");
      if (!doctorId) throw new Error("Doctor ID not found");

      const initiator = "doctor";
      const res = await createAppointment({
        patientId: selectedPatient._id,
        doctorId,
        appointmentDate: new Date(dateTime),
        notes,
        isEmergency,
        initiator,
      });

      setAppointments((prev) => [...prev, res.appointment]);
      setShowTimeModal(false);  
      setSelectedPatient(null);
    } catch (error) {
      console.error("Error creating appointment:", error);
      setError("Failed to create appointment.");
    }
  };


  const handleEditClick = (apt: Appointment) => {
    setEditingAppointment(apt);
    setTimeModalMode("edit");
    setShowTimeModal(true);
  };

  const handleTimeSelectEdit = async (dateTime: string, isEmergency: boolean, notes: string) => {
    if (!editingAppointment) return;

    try {
      const res = await updateAppointment(editingAppointment._id, {
        appointmentDate: new Date(dateTime),
        isEmergency,
        notes,
      });
      setAppointments((prev) =>
        prev.map((apt) => (apt._id === editingAppointment._id ? res.appointment : apt))
      );
      setShowTimeModal(false);
      setEditingAppointment(null);
    } catch (error) {
      console.error("Error updating appointment:", error);
      setError("Failed to update appointment.");
    }
  };


  const handleTimeSelect = (dateTime: string, isEmergency: boolean, notes: string) => {
    if (timeModalMode === "create") {
      handleTimeSelectCreate(dateTime, isEmergency, notes);
    } else {
      handleTimeSelectEdit(dateTime, isEmergency, notes);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Appointments</h2>
        <div>
          <button onClick={handleAssignAppointment} className={styles.addButton}>
            Assign Appointment
          </button>
          <button onClick={() => setViewMode("active")} className={styles.addButton}>
            Active
          </button>
          <button onClick={() => setViewMode("history")} className={styles.addButton}>
            History
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading appointments...</p>
      ) : error ? (
        <p>{error}</p>
      ) : viewMode === "active" ? (
        <CurrentAppointments
          appointments={appointments}
          setAppointments={setAppointments}
          onEditClick={handleEditClick}
        />
      ) : (
        <HistoryAppointments appointments={appointments} />
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
          onClose={() => {
            setShowTimeModal(false);
            setEditingAppointment(null);
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default ManageAppointmentsPage;
