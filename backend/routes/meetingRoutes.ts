import { Router } from "express";
import { getMeeting, getMeetingHistory, endMeeting } from "../controllers/meeting_controller";
import { saveConsultationSummaryAPI,getSummaryByAppointmentId } from "../controllers/consultation_controller";
import { authMiddleware } from "../controllers/auth_controller"; 
import { verifyMeetingAccess } from "../Middlewares/verifyMeetingAccess";

const router = Router();

router.get("/meetings/:meetingId", authMiddleware, verifyMeetingAccess, getMeeting);
router.get("/meetings/:meetingId/history", authMiddleware, verifyMeetingAccess, getMeetingHistory);
router.post("/meetings/:meetingId/end", authMiddleware, verifyMeetingAccess, endMeeting);
router.post("/consultation/save-summary", authMiddleware, verifyMeetingAccess, saveConsultationSummaryAPI);
//router.get( "/summary/:appointmentId", authMiddleware, verifyMeetingAccess, getSummaryByAppointmentId );
router.get( "/summary/:appointmentId", getSummaryByAppointmentId );


export default router;
