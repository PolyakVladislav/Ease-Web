import { Server, Socket } from 'socket.io';
import { checkMeetingAccess } from '../Middlewares/verifyMeetingAccess';
import aiService from './aiService';
import { saveMessage, getChatHistory, saveConsultationSummary } from './chat_controller';
import { generateAndSaveOverallSummary } from "./overall_summary_controller";
import Appointment from '../models/Appointment'; 

export function initSocketServer(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on('joinRoom', async (data) => {
      const { meetingId, userId, role } = data;
      const accessGranted = await checkMeetingAccess(meetingId, userId);
      if (!accessGranted) {
        socket.emit('error', { message: 'Access denied to this room.' });
        return;
      }
      
      socket.join(meetingId);
      console.log(`User ${userId} (${role}) joined room ${meetingId}`);
      socket.to(meetingId).emit('userJoined', { userId, role });

      const clients = await io.in(meetingId).allSockets();
      if (clients.size === 2) {
        io.to(meetingId).emit('consultationStarted', { meetingId });
      }
    });

    socket.on('sendMessage', async (data) => {
      const { meetingId, from, to, message, timestamp } = data;
      try {
        await saveMessage(meetingId, from, to, message, timestamp);
        io.to(meetingId).emit('newMessage', { from, message, timestamp });
      } catch (err) {
        socket.emit('error', { message: 'Error saving message.' });
      }
    });
    
    socket.on('requestAISuggestion', async (data) => {
      const { meetingId, currentChatContext, newMessage } = data;
      try {
        const suggestion = await aiService.getSuggestion(currentChatContext, newMessage);
        socket.emit('aiSuggestion', { suggestion });
        await Appointment.findByIdAndUpdate(meetingId, { $push: { aiMessages: suggestion } });
      } catch (error) {
        socket.emit('error', { message: 'Error retrieving AI suggestion.' });
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
    
        const doctorIdStr = appointment.doctorId ? appointment.doctorId.toString() : null;
        if (doctorIdStr !== doctorId) {
          socket.emit("error", { message: "Only the doctor can end the consultation." });
          return;
        }
    
        appointment.status = "passed";
        await appointment.save();
    

        io.to(meetingId).emit("consultationEnded", {
          meetingId,
          summary: "Consultation ended. AI summary is being generated...",
        });
    

        setImmediate(async () => {
          try {
            const chatHistory = await getChatHistory(meetingId);
    
            let localSummary: string;
            try {
              localSummary = await aiService.getSummary(chatHistory);
            } catch (error) {
              localSummary = "Failed to generate consultation summary";
            }
    
            await saveConsultationSummary(meetingId, doctorId, localSummary);
    
            try {
              await generateAndSaveOverallSummary(
                String(appointment.patientId),
                String(appointment.doctorId)
              );
            } catch (err) {
              console.error("Failed to generate overall summary automatically:", err);
            }
    
            console.log("Background AI summary generation complete.");
          } catch (error) {
            console.error("Error in background endConsultation logic:", error);
          }
        });
    
        console.log(`Consultation ended for meeting ${meetingId}. Summary in background...`);
      } catch (err) {
        console.error("Error ending consultation via socket:", err);
        socket.emit("error", { message: "Error ending consultation." });
      }
    });
    

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
