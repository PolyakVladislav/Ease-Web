import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Appointment } from "../../types/appointment";
import {
  fetchUnassignedUrgentAppointments,
  claimUrgentAppointment,
} from "../../Services/appointmentService";
import { formatDateShortFancy, timeAgoFromNow } from "../../utiles/dateUtils";

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Button,
  Alert,
  CircularProgress,
} from "@mui/material";

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
      await claimUrgentAppointment(appointmentId);
      const updated = await fetchUnassignedUrgentAppointments();
      setAppointments(updated);

      navigate(`/meetings/${appointmentId}/chat`);
    } catch (err) {
      console.error("Error claiming appointment:", err);
      alert("Failed to claim appointment");
    }
  }

  if (loading) {
    return (
      <Box mt={2} textAlign="center">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box mt={2}>
      <Typography variant="h5" gutterBottom>
        Urgent Appointments
      </Typography>
      {error && <Alert severity="error">{error}</Alert>}

      {appointments.length === 0 ? (
        <Typography variant="body1" sx={{ fontStyle: "italic", color: "#666" }}>
          No urgent appointments
        </Typography>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {appointments.map((appt) => {
            const dateStr = formatDateShortFancy(appt.appointmentDate);
            const createdAgo = appt.createdAt ? timeAgoFromNow(appt.createdAt) : "";
            const patientName =
              appt.patientName || appt.patientId?.username || "Unknown";

            return (
              <Card
                key={appt._id}
                sx={{
                  borderLeft: "6px solid #d9534f",
                  backgroundColor: "#fdeeee",
                }}
              >
                <CardContent>
                  <Box display="flex" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Chip label="URGENT" color="error" size="small" />
                      <Typography variant="subtitle1" sx={{ ml: 1, display: "inline" }}>
                        {dateStr}{" "}
                        <Typography variant="caption" sx={{ color: "#777" }}>
                          ({createdAgo})
                        </Typography>
                      </Typography>
                    </Box>

                    <Button
                      variant="contained"
                      color="error"
                      onClick={() => handleClaim(appt._id)}
                      sx={{ ml: 2 }}
                    >
                      Claim
                    </Button>
                  </Box>

                  <Typography variant="body1" sx={{ mt: 1 }}>
                    Patient: {patientName}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
};

export default UrgentAppointments;