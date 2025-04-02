import { Request, Response } from "express";
import { ConsultationSummary } from "../models/ConsultationSummary";

/**
 * Save the consultation summary.
 * Expects meetingId, doctorId, and summary in req.body.
 */
export const saveConsultationSummaryAPI = async (req: Request, res: Response): Promise<void> => {
  const { meetingId, doctorId, summary } = req.body;
  if (!meetingId || !doctorId || !summary) {
    res.status(400).json({ message: "meetingId, doctorId, and summary are required" });
    return;
  }
  try {
    const savedSummary = await ConsultationSummary.create({
      appointmentId: meetingId,
      doctorId,
      summary,
    });
    res.json({ success: true, summary: savedSummary });
  } catch (error) {
    console.error("Error saving consultation summary:", error);
    res.status(500).json({ message: "Error saving consultation summary" });
  }
};
