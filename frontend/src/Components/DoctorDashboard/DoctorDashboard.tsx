import React, { useEffect, useState } from "react";
import { Appointment } from "../../types/appointment";

import { fetchAppointments } from "../../Services/appointmentService";
import {
  fetchAppointmentsByWeek,
  AppointmentsByWeek,
  fetchSessionStatus,
  SessionStatus,
} from "../../Services/statsService";

import UrgentAppointments from "./UrgentAppointments";
import TodayAppointments from "./TodayAppointments";
import AppointmentsByWeekChart from "./AppointmentsByWeekChart";
import SessionStatusDonut from "./SessionStatusDonut";

import styles from "../../css/DoctorDashboard/DoctorDashboard.module.css";

const DoctorDashboard: React.FC = () => {
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([]);
  const [weekStats, setWeekStats] = useState<AppointmentsByWeek[]>([]);
  const [statusStats, setStatusStats] = useState<SessionStatus>({});
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
      const doctorId = resp.doctorId as string;

      const todayStr = new Date().toISOString().slice(0, 10);
      setTodayAppointments(
        all.filter(
          (a) =>
            a.status === "confirmed" &&
            a.appointmentDate.slice(0, 10) === todayStr
        )
      );

      const weeks = await fetchAppointmentsByWeek(doctorId);
      setWeekStats(weeks);

      const status = await fetchSessionStatus(doctorId);
      setStatusStats(status);
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
  if (error) return <div className={styles.errorMessage}>{error}</div>;

  return (
    <div className={styles.rootContainer}>
      <div className={styles.dashboardHeroSection}>
        <div className={styles.dashboardHeroContent}>
          <h2 className={styles.dashboardHeroTitle}>Doctor Dashboard</h2>
        </div>
      </div>

      <div className={styles.dashboardMainContainer}>
        <div className={styles.urgentBlock}>
          <UrgentAppointments />
        </div>

        <div className={styles.todayBlock}>
          <TodayAppointments appointments={todayAppointments} />
        </div>

        <div className={styles.chartBlock}>
          <h3>Appointments per Week</h3>
          <AppointmentsByWeekChart data={weekStats} />
        </div>

        <div className={styles.chartBlock}>
          <h3>Session Status</h3>
          <SessionStatusDonut data={statusStats} />
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;