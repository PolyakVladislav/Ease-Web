import { Request, Response } from "express";
import  Appointment  from "../models/Appointment";
import { ConsultationSummary } from "../models/ConsultationSummary";
import { OverallSummary } from "../models/OverallSummary";
import aiService from "./aiService";

export async function generateAndSaveOverallSummary(
  patientId: string,
  doctorId: string
): Promise<void> {
  const allSummaries = await ConsultationSummary.find({
    doctorId,
  }).lean();

  const relevant: string[] = [];
  for (const cs of allSummaries) {
    const apt = await Appointment.findById(cs.appointmentId)
      .select("patientId status")
      .lean();
    if (
      apt &&
      String(apt.patientId) === String(patientId) &&
      apt.status === "passed"
    ) {
      relevant.push(cs.summary);
    }
  }

  if (!relevant.length) {
    await OverallSummary.findOneAndUpdate(
      { patientId, doctorId },
      {
        text: "",
        updatedAt: new Date(),
      },
      { upsert: true }
    );
    return;
  }

  const overallSummary = await aiService.getOverallSummary(relevant);

  await OverallSummary.findOneAndUpdate(
    { patientId, doctorId },
    {
      text: overallSummary,
      updatedAt: new Date(),
    },
    { upsert: true }
  );
}


export const getStoredOverallSummary = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { patientId, doctorId } = req.params;
    if (!patientId || !doctorId) {
      res.status(400).json({ message: "Missing patientId or doctorId" });
      return;
    }

    const record = await OverallSummary.findOne({
      patientId,
      doctorId,
    }).lean();

    if (!record) {
      res.json({
        success: true,
        overallSummary: "",
        message: "No Overall Summary found yet",
      });
      return;
    }

    res.json({
      success: true,
      overallSummary: record.text,
      updatedAt: record.updatedAt,
    });
  } catch (err) {
    console.error("Error fetching stored overall summary:", err);
    res.status(500).json({ error: "Failed to fetch stored overall summary" });
  }
};