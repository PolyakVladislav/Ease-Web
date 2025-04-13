import React from "react";
import { useNavigate } from "react-router-dom";
import { Appointment } from "../../types/appointment";
import { timeLeftUntil } from "../../utiles/dateUtils";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Typography,
  Chip,
} from "@mui/material";

type Props = {
  appointments: Appointment[];
};

const TodayAppointments: React.FC<Props> = ({ appointments }) => {
  const navigate = useNavigate();

  if (!appointments || appointments.length === 0) {
    return (
      <div style={{ marginTop: 16 }}>
        <Typography variant="h5" gutterBottom>
          Today's Appointments
        </Typography>
        <Typography variant="body2" fontStyle="italic" color="#666">
          No confirmed appointments for today
        </Typography>
      </div>
    );
  }

  function goToChat(apptId: string) {
    navigate(`/meetings/${apptId}/chat`);
  }

  return (
    <div style={{ marginTop: 16 }}>
      <Typography variant="h5" gutterBottom>
        Today's Appointments
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Time</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Patient</TableCell>
              <TableCell>Time Left</TableCell>
              <TableCell>Action</TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {appointments.map((appt) => {
              const dateObj = new Date(appt.appointmentDate);
              const timeStr = dateObj.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              const leftStr = timeLeftUntil(appt.appointmentDate);
              const diffMin = Math.floor(
                (dateObj.getTime() - Date.now()) / 60000
              );
              const canStartChat = diffMin <= 10;

              const patientName =
                appt.patientName || appt.patientId?.username || "Unknown";

              const chipLabel = appt.isEmergency ? "Emergency" : "Regular";
              const chipColor = appt.isEmergency ? "error" : "default";

              return (
                <TableRow key={appt._id}>
                  <TableCell>{timeStr}</TableCell>

                  <TableCell>
                    <Chip label={chipLabel} color={chipColor} size="small" />
                  </TableCell>

                  <TableCell>{patientName}</TableCell>

                  <TableCell>{leftStr}</TableCell>

                  <TableCell>
                    {canStartChat ? (
                      <Button
                        variant="outlined"
                        color="primary"
                        onClick={() => goToChat(appt._id)}
                      >
                        Go to Chat
                      </Button>
                    ) : (
                      <Typography variant="caption" color="textSecondary">
                        Available 10 min before
                      </Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
};

export default TodayAppointments;
