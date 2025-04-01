import { Message } from "../models/Message";
import { ConsultationSummary } from "../models/ConsultationSummary";

/**
 * Save a message to the database.
 * @param meetingId - Appointment ID.
 * @param userId - Sender's ID.
 * @param to - Recipient's ID.
 * @param message - Message text.
 * @param timestamp - Time of sending (defaults to now).
 */
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
    console.log(`Message saved for meeting ${meetingId}`);
  } catch (error) {
    console.error("Error saving message:", error);
    throw error;
  }
}

/**
 * Get chat history for a specific meeting.
 * @param meetingId - Meeting ID.
 * @returns A string representation of the chat history.
 */
export async function getChatHistory(meetingId: string): Promise<string> {
  try {
    const messages = await Message.find({ meetingId }).sort({ timestamp: 1 });
    const history = messages
      .map(
        (msg) =>
          `[${msg.timestamp.toISOString()}] ${msg.from} -> ${msg.to}: ${msg.message}`
      )
      .join("\n");
    console.log(`History for meeting ${meetingId} retrieved`);
    return history;
  } catch (error) {
    console.error("Error retrieving chat history:", error);
    throw error;
  }
}

/**
 * Save the consultation summary.
 * @param meetingId - Appointment ID.
 * @param doctorId - Doctor's ID.
 * @param summary - Summary received from AI.
 */
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
    console.log(`Consultation summary saved for meeting ${meetingId}`);
  } catch (error) {
    console.error("Error saving consultation summary:", error);
    throw error;
  }
}
