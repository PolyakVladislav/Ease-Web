import { Router } from "express";
import { getMeeting, getMeetingHistory } from "../controllers/meeting_controller";
import { saveConsultationSummaryAPI,getSummaryByAppointmentId } from "../controllers/consultation_controller";
import { authMiddleware } from "../controllers/auth_controller"; 
import { verifyMeetingAccess } from "../Middlewares/verifyMeetingAccess";
import { getStoredOverallSummary } from "../controllers/overall_summary_controller";


const router = Router();

router.get("/meetings/:meetingId", authMiddleware, verifyMeetingAccess, getMeeting);
router.get("/meetings/:meetingId/history", authMiddleware, verifyMeetingAccess, getMeetingHistory);
router.post("/consultation/save-summary", authMiddleware, verifyMeetingAccess, saveConsultationSummaryAPI);
router.get( "/summary/:appointmentId", authMiddleware, verifyMeetingAccess, getSummaryByAppointmentId );
router.get("/patients/:patientId/doctor/:doctorId/overall-summary",authMiddleware,getStoredOverallSummary);


export default router;
