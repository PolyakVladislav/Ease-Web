import io from "socket.io-client";
import type { Socket } from "socket.io-client";
import CONFIG from "../../config"; 

export const createSocket = (userId: string): typeof Socket => {
  return io(CONFIG.SERVER_URL, {
    query: { userId },
    transportOptions: {
      polling: {
        withCredentials: true
      }
    }
  });
};
export const startChat = (socket: typeof Socket, meetingId: string, userId: string): void => {
  const role = localStorage.getItem("userRole") || "doctor";
  socket.emit("joinRoom", { meetingId, userId, role });
};

export const sendMessage = (socket: typeof Socket, meetingId: string, message: ChatMessage): void => {
  console.log("Sending message:", { meetingId, ...message });
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

export const disconnectSocket = (socket: typeof Socket): void => {
  socket.disconnect();
};

import { ChatMessage } from "../../types/ChatMessage";
