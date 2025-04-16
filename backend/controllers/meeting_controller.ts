import { Request, Response } from "express";
import Appointment from "../models/Appointment";
import { getChatHistory, saveConsultationSummary } from "./chat_controller";


export const getMeeting = async (
  req: Request,
  res: Response
): Promise<void> => {
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

export const getMeetingHistory = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { meetingId } = req.params;
  try {
    const history = await getChatHistory(meetingId);
    const appointment = await Appointment.findById(meetingId).lean();
    const aiMessages = appointment?.aiMessages || [];
    res.json({ meetingId, history, aiMessages });
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    res.status(500).json({ message: "Error retrieving chat history" });
  }
};

