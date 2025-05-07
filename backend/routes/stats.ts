import { Router } from "express";
import { getSessionStatus, getAppointmentsByWeek } from "../controllers/statsController";

const router = Router();

router.get("/appointmentsByWeek", getAppointmentsByWeek);
router.get("/sessionStatus",     getSessionStatus);  

export default router;