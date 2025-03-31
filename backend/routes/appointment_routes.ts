import { Router } from "express";
import { createAppointment, updateAppointment, getAppointmentsByDoctor, getAppointmentDetails } from "../controllers/appointment_controller";
import { authMiddleware } from "../controllers/auth_controller";
const router = Router();

router.post("/appointments", authMiddleware, createAppointment);

router.put("/appointments/:appointmentId", authMiddleware, updateAppointment);

router.get("/appointments", authMiddleware, getAppointmentsByDoctor);

router.get("/appointments/:appointmentId", authMiddleware, getAppointmentDetails);

export default router;