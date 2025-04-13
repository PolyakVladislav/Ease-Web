import { Router } from "express";
import { createAppointment, updateAppointment, getAppointmentsByDoctor, getAppointmentDetails,getTherapistPatientSessions,getSessionsByPatientId, deleteAppointment, claimUrgentAppointment,getUnassignedUrgentAppointments } from "../controllers/appointment_controller";
import { authMiddleware } from "../controllers/auth_controller";
import { getRecentPatients } from "../controllers/appointment_controller";

const router = Router();

router.post("/appointments", authMiddleware, createAppointment);

router.get("/analytics/therapist-patient-sessions", authMiddleware, getTherapistPatientSessions);

router.put("/appointments/:appointmentId", authMiddleware, updateAppointment);

router.get("/appointments", authMiddleware, getAppointmentsByDoctor);

router.get("/appointments/urgent",authMiddleware,getUnassignedUrgentAppointments);

router.get("/appointments/:appointmentId", authMiddleware, getAppointmentDetails);

router.get("/doctors/:doctorId/recent-patients", authMiddleware, getRecentPatients);

router.get("/patients/:patientId/sessions", authMiddleware, getSessionsByPatientId);

router.delete("/appointments/:appointmentId",authMiddleware, deleteAppointment);

router.patch("/appointments/:appointmentId/claim",authMiddleware,claimUrgentAppointment);




// router.get("/doctors/:doctorId/recent-patients", getRecentPatients);



export default router;