// controllers/overall_summary_controller.ts
import { Request, Response } from "express";
import  Appointment  from "../models/Appointment";
import { ConsultationSummary } from "../models/ConsultationSummary";
import { OverallSummary } from "../models/OverallSummary";
import aiService from "./aiService";

export async function generateAndSaveOverallSummary(
  patientId: string,
  doctorId: string
): Promise<void> {
  // 1) Собираем все relevant summaries
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

  // Если нет никаких summary, то можно сохранить пустую строку
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

  // 2) Генерируем общий summary (1 раз)
  const overallSummary = await aiService.getOverallSummary(relevant);

  // 3) Сохраняем/обновляем в OverallSummary
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