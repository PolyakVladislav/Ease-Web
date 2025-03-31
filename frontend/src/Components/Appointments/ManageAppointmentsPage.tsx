import React, { useState, useEffect } from "react";
import styles from "../../css/ManageAppointmentsPage.module.css";
import {
  fetchAppointments,
  createAppointment,
} from "../../Services/appointmentService";
import PatientSearchModal from "../PatientSearchModal";
import TimeSelectionModal from "./TimeSelectionModal";
import CurrentAppointments from "../Appointments/CurrentAppointments";
import HistoryAppointments from "./HistoryAppointments";
import { Appointment } from "../../types/appointment";

const ManageAppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");
  const [showPatientModal, setShowPatientModal] = useState<boolean>(false);
  const [showTimeModal, setShowTimeModal] = useState<boolean>(false);
  const [selectedPatient, setSelectedPatient] = useState<{
    _id: string;
    username: string;
  } | null>(null);
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
    setShowPatientModal(true);
  };

  const handlePatientSelect = (patient: { _id: string; username: string }) => {
    setSelectedPatient(patient);
    setShowPatientModal(false);
    setShowTimeModal(true);
  };

  const handleTimeSelect = async (
    dateTime: string,
    isEmergency: boolean,
    notes: string
  ) => {
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2>Manage Appointments</h2>
        <div>
          <button
            onClick={handleAssignAppointment}
            className={styles.addButton}
          >
            Assign Appointment
          </button>
          <button
            onClick={() => setViewMode("active")}
            className={styles.addButton}
          >
            Active
          </button>
          <button
            onClick={() => setViewMode("history")}
            className={styles.addButton}
          >
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
            setSelectedPatient(null);
          }}
        />
      )}
    </div>
  );
};

export default ManageAppointmentsPage;
