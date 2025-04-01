import { Request, Response } from "express";
import axios from "axios";
import Appointment from "../models/Appointment";
import { getChatHistory, saveConsultationSummary } from "./chat_controller";
import aiService from "./aiService";

// Получение данных встречи (appointment)
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

// Получение истории сообщений для встречи
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

// Завершение консультации (только для доктора)
// 1. Получаем историю чата, 2. Запрашиваем итоговый анализ у AI, 3. Вызываем отдельный API для сохранения итогового вывода
export const endMeeting = async (req: Request, res: Response): Promise<void> => {
  const { meetingId } = req.params;
  const user = (req as any).user; // Предполагается, что authMiddleware устанавливает req.user

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

    // Получаем историю чата
    const history = await getChatHistory(meetingId);

    // Запрашиваем итоговый анализ у AI
    let summary: string;
    try {
      summary = await aiService.getSummary(history);
    } catch (error) {
      summary = "Failed to generate consultation summary";
    }

    // Вызываем отдельный API для сохранения итогового вывода
    try {
      const token = req.headers.authorization?.split(" ")[1] || "";
      const apiUrl = process.env.SERVER_BASE_URL + "/api/consultation/save-summary";
      const response = await axios.post(
        apiUrl,
        { meetingId, doctorId: user._id.toString(), summary },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.data.success) {
        res.json({ meetingId, summary });
      } else {
        res.status(500).json({ message: "Error saving consultation summary" });
      }
    } catch (saveError) {
      console.error("Error saving consultation summary via API:", saveError);
      res.status(500).json({ message: "Error saving consultation summary" });
    }
  } catch (error) {
    console.error("Error ending consultation:", error);
    res.status(500).json({ message: "Error ending consultation" });
  }
};
