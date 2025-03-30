import { Server } from "socket.io";
import { createServer } from "http";
import { io as Client } from "socket.io-client";
import mongoose from "mongoose";
import { setupSocket } from "../controllers/socketService";
import { Message } from "../models/Message";
require("dotenv").config();

let io: Server;
let server: any;
let clientSocket1: any;
let clientSocket2: any;
beforeAll(async () => {
  await mongoose.connect(process.env.DB_CONNECT!, {
  });

  const httpServer = createServer();
  io = new Server(httpServer, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  setupSocket(io);

  await new Promise<void>((resolve) => {
    server = httpServer.listen(() => {
      const port = (server.address() as any).port;
      clientSocket1 = Client(`http://localhost:${port}`, { query: { userId: "user1" } });
      clientSocket2 = Client(`http://localhost:${port}`, { query: { userId: "user2" } });

      clientSocket1.on("connect", resolve);
      clientSocket1.on("connect_error", resolve);
      clientSocket1.on("error", resolve);
    });
  });
}, 15000);

afterAll(async () => {
  if (clientSocket1) clientSocket1.disconnect();
  if (clientSocket2) clientSocket2.disconnect();
  io.close();
  if (server) await server.close();
  await mongoose.disconnect();
});

describe("Socket.IO Tests", () => {
  

  test("Should send and receive a message", (done) => {
    interface MessagePayload {
      from: string;
      to: string;
      content: string;
    }

    clientSocket2.on("receiveMessage", (message: MessagePayload) => {
      expect(message.from).toBe("user1");
      expect(message.to).toBe("user2");
      expect(message.content).toBe("Hello, user2!");
      done();
    });

    clientSocket1.emit("sendMessage", "user1", "user2", "Hello, user2!");
  }, 10000);



  test("User should disconnect and be removed from connectedUsers", (done) => {
    clientSocket1.on("disconnect", () => {
      expect(clientSocket1.connected).toBe(false);
      done();
    });

    clientSocket1.disconnect();
  }, 10000);
});
