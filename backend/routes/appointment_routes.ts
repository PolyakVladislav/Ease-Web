import express from "express";
import { authMiddleware } from "../controllers/auth_controller";
import {
  createAppointment,
  getAppointmentsByDoctor,
  updateAppointment,
  getAppointmentDetails,
} from "../controllers/appointment_controller";

const router = express.Router();

router.post("/appointments", createAppointment);

router.get("/appointments", authMiddleware, getAppointmentsByDoctor);

router.put("/appointments/:appointmentId", updateAppointment);

router.get("/appointments/:appointmentId", getAppointmentDetails);

export default router;
