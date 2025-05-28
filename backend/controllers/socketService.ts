import { Server, Socket } from "socket.io";
import { checkMeetingAccess } from "../Middlewares/verifyMeetingAccess";
import Appointment from "../models/Appointment";
import aiService from "./aiService";
import { buildChatContext } from "./buildChatContext";
import {
  getChatHistory,
  saveConsultationSummary,
  saveMessage,
} from "./chat_controller";
import { generateAndSaveOverallSummary } from "./overall_summary_controller";

export function initSocketServer(io: Server) {
  const inactivityTimers: Record<string, NodeJS.Timeout> = {};

  async function autoEndConsultation(meetingId: string, doctorId: string) {
    try {
      const appointment = await Appointment.findById(meetingId);
      if (!appointment || appointment.status === "passed") return;

      appointment.status = "passed";
      await appointment.save();

      io.to(meetingId).emit("consultationEnded", {
        meetingId,
        summary: "Consultation ended due to inactivity.",
      });

      const chatHistory = await getChatHistory(meetingId);
      const summary = await aiService.getSummary(chatHistory);
      await saveConsultationSummary(meetingId, doctorId, summary);

      await generateAndSaveOverallSummary(
        String(appointment.patientId),
        String(appointment.doctorId)
      );
    } catch (error) {
      console.error("Error auto-ending consultation:", error);
    }
  }

  function resetInactivityTimer(meetingId: string, doctorId: string) {
    if (inactivityTimers[meetingId]) {
      clearTimeout(inactivityTimers[meetingId]);
    }

    inactivityTimers[meetingId] = setTimeout(() => {
      console.log(`Auto-ending consultation for meeting ${meetingId} due to inactivity`);
      autoEndConsultation(meetingId, doctorId);
    }, 1 * 30 * 1000); // 30 דקות
  }

  io.on("connection", (socket: Socket) => {
    socket.on("joinUser", ({ userId }) => {
      socket.join(userId);
    });

    socket.on("joinRoom", async (data) => {
      const { meetingId, userId, role } = data;

      const accessGranted = await checkMeetingAccess(meetingId, userId);
      if (!accessGranted) {
        socket.emit("error", { message: "Access denied to this room." });
        return;
      }

      socket.join(meetingId);
      socket.join(userId);
      socket.data.userId = userId;
      socket.data.meetingId = meetingId;

      socket.to(meetingId).emit("userJoined", { userId, role });

      const clients = await io.in(meetingId).allSockets();
      if (clients.size === 2) {
        io.to(meetingId).emit("consultationStarted", { meetingId });

        // טיימר התחלה כשנמצאים 2 אנשים
        const appointment = await Appointment.findById(meetingId).lean();
        if (appointment?.doctorId) {
          resetInactivityTimer(meetingId, String(appointment.doctorId));
        }
      }
    });

    socket.on("sendMessage", async (data) => {
      const { meetingId, from, to, message, timestamp } = data;

      try {
        await saveMessage(meetingId, from, to, message, timestamp);
        io.to(meetingId).emit("newMessage", { from, message, timestamp });

        const appointment = await Appointment.findById(meetingId).lean();
        if (appointment?.doctorId) {
          resetInactivityTimer(meetingId, String(appointment.doctorId));
        }
      } catch (err) {
        socket.emit("error", { message: "Error saving message." });
      }
    });

    socket.on("requestAISuggestion", async (data) => {
      const { meetingId, newMessage } = data;

      try {
        const appointment = await Appointment.findById(meetingId).lean();
        if (!appointment) throw new Error("Meeting not found");

        const doctorId = String(appointment.doctorId);
        const patientId = String(appointment.patientId);

        const chatContext = await buildChatContext(meetingId, doctorId, patientId);
        const suggestion = await aiService.getSuggestion(chatContext, newMessage);

        socket.emit("aiSuggestion", { suggestion });

        await Appointment.findByIdAndUpdate(meetingId, {
          $push: { aiMessages: suggestion },
        });
      } catch (error) {
        console.error(error);
        socket.emit("error", { message: "Error retrieving AI suggestion." });
      }
    });

    socket.on("endConsultation", async (data) => {
      const { meetingId, doctorId } = data;

      try {
        const appointment = await Appointment.findById(meetingId);
        if (!appointment) {
          socket.emit("error", { message: "Meeting not found." });
          return;
        }

        if (String(appointment.doctorId) !== doctorId) {
          socket.emit("error", { message: "Only the doctor can end the consultation." });
          return;
        }

        appointment.status = "passed";
        await appointment.save();

        if (inactivityTimers[meetingId]) {
          clearTimeout(inactivityTimers[meetingId]);
          delete inactivityTimers[meetingId];
        }

        io.to(meetingId).emit("consultationEnded", {
          meetingId,
          summary: "Consultation ended. AI summary is being generated...",
        });

        setImmediate(async () => {
          try {
            const chatHistory = await getChatHistory(meetingId);
            const localSummary = await aiService.getSummary(chatHistory);

            await saveConsultationSummary(meetingId, doctorId, localSummary);
            await generateAndSaveOverallSummary(
              String(appointment.patientId),
              String(appointment.doctorId)
            );
          } catch (err) {
            console.error("Error in background endConsultation logic:", err);
          }
        });
      } catch (err) {
        console.error("Error ending consultation via socket:", err);
        socket.emit("error", { message: "Error ending consultation." });
      }
    });

    socket.on("disconnect", () => {
      const meetingId = socket.data.meetingId;
      
    });
  });
}
