import { Router } from "express";
import {
  createOrUpdateSchedule,
  getScheduleByDoctor,
  deleteScheduleEntry,
} from "../controllers/schedule_controller";
import {
  addDayOff,
  deleteDayOff,
  getAvailableSlots,
  getDayOffList, 
} from "../controllers/dayoff_controller";
import { authMiddleware } from "../controllers/auth_controller";

const router = Router();

router.post("/schedule", authMiddleware, createOrUpdateSchedule);
router.get("/schedule/:doctorId", authMiddleware, getScheduleByDoctor);
router.delete("/schedule/:scheduleId", authMiddleware, deleteScheduleEntry);

router.post("/schedule/dayoff", authMiddleware, addDayOff);
router.delete("/schedule/dayoff/:dayOffId", authMiddleware, deleteDayOff);

router.get("/schedule/:doctorId/dayoffs", authMiddleware, getDayOffList);

router.get("/schedule/:doctorId/free-slots", authMiddleware, getAvailableSlots);

export default router;
