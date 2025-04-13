import { Message } from "../models/Message";
import { ConsultationSummary } from "../models/ConsultationSummary";


export async function saveMessage(
  meetingId: string,
  userId: string,
  to: string,
  message: string,
  timestamp: Date = new Date()
): Promise<void> {
  try {
    await Message.create({
      meetingId,
      from: userId,
      to,
      message,
      timestamp,
    });
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

export async function getChatHistory(meetingId: string): Promise<string> {
  try {
    const messages = await Message.find({ meetingId }).sort({ timestamp: 1 });
    const history = messages
      .map(
        (msg) =>
          `[${msg.timestamp.toISOString()}] ${msg.from} -> ${msg.to}: ${msg.message}`
      )
      .join("\n");
    return history;
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    throw error;
  }
}

export async function saveConsultationSummary(
  meetingId: string,
  doctorId: string,
  summary: string
): Promise<void> {
  try {
    await ConsultationSummary.create({
      appointmentId: meetingId,
      doctorId,
      summary,
    });
  } catch (error) {
    console.error("Error saving consultation summary:", error);
    throw error;
  }
}
