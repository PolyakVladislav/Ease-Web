import { Request, Response } from "express";
import Appointment from "../models/Appointment";
import { getChatHistory, saveConsultationSummary } from "./chat_controller";
import aiService from "./aiService";

/**
 * Get meeting (appointment) details.
 */
export const getMeeting = async (req: Request, res: Response): Promise<void> => {
  const { meetingId } = req.params;
  try {
    const appointment = await Appointment.findById(meetingId).lean();
    if (!appointment) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }
    res.json({ appointment });
  } catch (error) {
    console.error("Error retrieving meeting data:", error);
    res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get chat history for the meeting.
 */
export const getMeetingHistory = async (req: Request, res: Response): Promise<void> => {
  const { meetingId } = req.params;
  try {
    const history = await getChatHistory(meetingId);
    res.json({ meetingId, history });
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    res.status(500).json({ message: "Error retrieving chat history" });
  }
};

/**
 * End the consultation:
 * - Retrieve chat history
 * - Get final summary from AI
 * - Save the summary
 * Only available for the doctor.
 */
export const endMeeting = async (req: Request, res: Response): Promise<void> => {
  const { meetingId } = req.params;
  const user = (req as any).user; // Set by authMiddleware

  try {
    const appointment = await Appointment.findById(meetingId).lean();
    if (!appointment) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }
    if (user._id.toString() !== appointment.doctorId.toString()) {
      res.status(403).json({ message: "Only the doctor can end the consultation" });
      return;
    }

    const history = await getChatHistory(meetingId);
    let summary: string;
    try {
      summary = await aiService.getSummary(history);
    } catch (error) {
      summary = "Failed to generate consultation summary";
    }
    await saveConsultationSummary(meetingId, user._id.toString(), summary);
    res.json({ meetingId, summary });
  } catch (error) {
    console.error("Error ending consultation:", error);
    res.status(500).json({ message: "Error ending consultation" });
  }
};
