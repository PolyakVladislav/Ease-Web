import React, { useEffect, useState } from "react";
import { Appointment } from "../../types/appointment";
import { fetchAppointments } from "../../Services/appointmentService";
import { Box, Typography, CircularProgress } from "@mui/material";
import UrgentAppointments from "./UrgentAppointments";
import TodayAppointments from "./TodayAppointments";

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
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }
  if (error) {
    return (
      <Box textAlign="center" color="red" mt={2}>
        {error}
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, bgcolor: "#f5f5f5", minHeight: "100vh" }}>
      <Typography variant="h4" gutterBottom>
        Doctor Dashboard
      </Typography>

      <UrgentAppointments />

      <Box mt={3}>
        <TodayAppointments appointments={todayAppointments} />
      </Box>
    </Box>
  );
};

export default DoctorDashboard;