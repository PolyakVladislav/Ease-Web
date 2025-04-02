import { io, Socket } from "socket.io-client";
import CONFIG from "../../config"; // Предполагаем, что SERVER_URL указан в конфиге

export const createSocket = (userId: string): typeof Socket => {
  return io(CONFIG.SERVER_URL, {
    query: { userId },
    withCredentials: true,
  });
};

export const startChat = (socket: typeof Socket, meetingId: string, userId: string): void => {
  const role = localStorage.getItem("userRole") || "";
  socket.emit("joinRoom", { meetingId, userId, role });
};

export const sendMessage = (socket: typeof Socket, meetingId: string, message: object): void => {
  socket.emit("sendMessage", { meetingId, ...message });
};

export const requestAISuggestion = (
  socket: typeof Socket,
  meetingId: string,
  chatContext: string,
  newMessage: string
): void => {
  socket.emit("requestAISuggestion", { meetingId, currentChatContext: chatContext, newMessage });
};

export const endConsultation = (socket: typeof Socket, meetingId: string, doctorId: string): void => {
  socket.emit("endConsultation", { meetingId, doctorId });
};

export const disconnectSocket = (socket: Socket): void => {
  socket.disconnect();
};
