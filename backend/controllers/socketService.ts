import { Server } from "socket.io";
import { Message } from "../models/Message";

const connectedUsers: Record<string, string> = {};

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId as string;

    if (userId) {
      connectedUsers[userId] = socket.id;
    } else {
      console.warn(`[SOCKET] Connection without userId, socket.id=${socket.id}`);
    }

    socket.on("sendMessage", async (fromUserId: string, toUserId: string, msgContent: string) => {
      try {
        const newMessage = new Message({
          from: fromUserId,
          to: toUserId,
          message: msgContent,
          timestamp: new Date(),
        });
        await newMessage.save();

        const receiverSocketId = connectedUsers[toUserId];
        if (receiverSocketId) {
          io.to(receiverSocketId).emit("receiveMessage", {
            from: fromUserId,
            to: toUserId,
            content: msgContent,
            timestamp: new Date(),
          });
        } else {
          console.warn(`[SOCKET] Receiver ${toUserId} is not connected`);
        }
      } catch (error) {
        // console.error("[SOCKET] Error saving message:", error);
      }
    });

    socket.on("disconnect", () => {
      for (const [uId, sId] of Object.entries(connectedUsers)) {
        if (sId === socket.id) {
          delete connectedUsers[uId];
          break;
        }
      }
    });
  });
};
