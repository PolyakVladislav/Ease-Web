import { Server, Socket } from 'socket.io';
import { checkMeetingAccess } from '../Middlewares/verifyMeetingAccess';
import aiService from './aiService';
import { saveMessage, getChatHistory, saveConsultationSummary } from './chat_controller';

export function initSocketServer(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Join meeting room
    socket.on('joinRoom', async (data) => {
      // data: { meetingId, userId, role }
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

    // Send message
    socket.on('sendMessage', async (data) => {
      // data: { meetingId, userId, message, timestamp }
      const { meetingId, userId, message, timestamp } = data;
      try {
        await saveMessage(meetingId, userId, "", message, timestamp);
        io.to(meetingId).emit('newMessage', { userId, message, timestamp });
      } catch (err) {
        socket.emit('error', { message: 'Error saving message.' });
      }
    });

    // Request AI suggestion
    socket.on('requestAISuggestion', async (data) => {
      // data: { meetingId, currentChatContext, newMessage }
      const { meetingId, currentChatContext, newMessage } = data;
      try {
        const suggestion = await aiService.getSuggestion(currentChatContext, newMessage);
        socket.emit('aiSuggestion', { suggestion });
      } catch (error) {
        socket.emit('error', { message: 'Error retrieving AI suggestion.' });
      }
    });

    // End consultation
    socket.on('endConsultation', async (data) => {
      // data: { meetingId, doctorId }
      const { meetingId, doctorId } = data;
      try {
        const chatHistory = await getChatHistory(meetingId);
        let consultationSummary: string;
        try {
          consultationSummary = await aiService.getSummary(chatHistory);
        } catch (error) {
          consultationSummary = 'Failed to generate consultation summary';
        }
        await saveConsultationSummary(meetingId, doctorId, consultationSummary);
        io.to(meetingId).emit('consultationEnded', { meetingId, summary: consultationSummary });
      } catch (err) {
        socket.emit('error', { message: 'Error ending consultation.' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });
}
