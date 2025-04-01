import { Router } from "express";
import { getMeeting, getMeetingHistory, endMeeting } from "../controllers/meeting_controller";
import { authMiddleware } from "../controllers/auth_controller"; 
import { verifyMeetingAccess } from "../Middlewares/verifyMeetingAccess";

const router = Router();

router.get("/meetings/:meetingId", authMiddleware, verifyMeetingAccess, getMeeting);
router.get("/meetings/:meetingId/history", authMiddleware, verifyMeetingAccess, getMeetingHistory);
router.post("/meetings/:meetingId/end", authMiddleware, verifyMeetingAccess, endMeeting);

export default router;
