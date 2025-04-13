import React, { useEffect, useState } from "react";
import { Appointment } from "../../types/appointment";
import { fetchAppointments } from "../../Services/appointmentService";
import UrgentAppointments from "./UrgentAppointments";
import TodayAppointments from "./TodayAppointments";
import styles from "../../css/DoctorDashboard/DoctorDashboard.module.css";

const DoctorDashboard: React.FC = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setLoading(true);
      setError("");
      const resp = await fetchAppointments();
      const all = resp.appointments as Appointment[];
      const todayStr = new Date().toISOString().slice(0, 10);

      const filtered = all.filter(
        (appt) =>
          appt.status === "confirmed" &&
          appt.appointmentDate.slice(0, 10) === todayStr
      );
      setTodayAppointments(filtered);
    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorMessage}>{error}</div>;
  }

  return (
    <div className={styles.rootContainer}>
      <div className={styles.dashboardHeroSection}>
        <div className={styles.dashboardHeroContent}>
          <h2 className={styles.dashboardHeroTitle}>Doctor Dashboard</h2>
        </div>
      </div>

      <div className={styles.dashboardMainContainer}>
        <UrgentAppointments />

        <div style={{ marginTop: "20px" }}>
          <TodayAppointments appointments={todayAppointments} />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;