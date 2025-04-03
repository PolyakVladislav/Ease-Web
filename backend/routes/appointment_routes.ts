import { Router } from "express";
import { createAppointment, updateAppointment, getAppointmentsByDoctor, getAppointmentDetails } from "../controllers/appointment_controller";
import { authMiddleware } from "../controllers/auth_controller";
import { getRecentPatients } from "../controllers/appointment_controller";

const router = Router();

router.post("/appointments", authMiddleware, createAppointment);

router.put("/appointments/:appointmentId", authMiddleware, updateAppointment);

router.get("/appointments", authMiddleware, getAppointmentsByDoctor);

router.get("/appointments/:appointmentId", authMiddleware, getAppointmentDetails);

router.get("/doctors/:doctorId/recent-patients", authMiddleware, getRecentPatients);

// router.get("/doctors/:doctorId/recent-patients", getRecentPatients);



export default router;