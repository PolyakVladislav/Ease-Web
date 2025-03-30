import socketIo, { Socket } from "socket.io-client";
import CONFIG from "../config"; 

export const createSocket = (userId: string): typeof Socket => {
  return socketIo(`${CONFIG.SERVER_URL}`, {
    query: { userId },
    transports: ["polling", "websocket"],
    withCredentials: true
  } as SocketIOClient.ConnectOpts);
};

export const sendMessage = (
  socket: typeof Socket,
  fromUserId: string,
  toUserId: string,
  message: string
) => {
  socket.emit("sendMessage", fromUserId, toUserId, message);
};

export const listenForMessages = (
  socket: typeof Socket,
  callback: (message: {
    from: string;
    to: string;
    content: string;
    timestamp: Date;
  }) => void
) => {
  socket.on("receiveMessage", callback);

  return () => {
    socket.off("receiveMessage", callback);
  };
};

export const startChat = (
  socket: typeof Socket,
  fromUserId: string,
  toUserId: string
) => {
  socket.emit("startChat", fromUserId, toUserId);
};

export const disconnectSocket = (socket: typeof Socket) => {
  socket.disconnect();
};
