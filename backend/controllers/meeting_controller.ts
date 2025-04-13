import { Request, Response } from "express";
import Appointment from "../models/Appointment";
import { getChatHistory, saveConsultationSummary } from "./chat_controller";
import aiService from "./aiService";
import { generateAndSaveOverallSummary } from "./overall_summary_controller";


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

export const endMeeting = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { meetingId } = req.params;
  const user = (req as any).user;

  try {
    const appointment = await Appointment.findById(meetingId);
    if (!appointment) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }

    const doctorIdStr = appointment.doctorId
      ? appointment.doctorId.toString()
      : null;
    if (doctorIdStr !== user._id.toString()) {
      res
        .status(403)
        .json({ message: "Only the doctor can end the consultation" });
      return;
    }

    const history = await getChatHistory(meetingId);

    let summary: string;
    try {
      summary = await aiService.getSummary(history);
    } catch (error) {
      summary = "Failed to generate consultation summary";
    }

    appointment.status = "passed";
    await appointment.save();

    await saveConsultationSummary(meetingId, user._id.toString(), summary);

    try {
      await generateAndSaveOverallSummary(
        String(appointment.patientId),
        String(appointment.doctorId)
      );
    } catch (err) {
      console.error("Failed to generate overall summary automatically:", err);
    }

    res.json({ meetingId, summary, status: appointment.status });
  } catch (error) {
    console.error("Error ending consultation:", error);
    res.status(500).json({ message: "Error ending consultation" });
  }
};
