require("dotenv").config();
import http from "http";
import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import socketIo from "socket.io";
import { initSocketServer } from "./controllers/socketService"; // Обновлённый импорт
import authRoutes from "./routes/auth_route";
import swaggerUi from "swagger-ui-express";
import swaggerJsDoc from "swagger-jsdoc";
// import chatRoutes from "./routes/chat_route";
import userRoutes from "./routes/user_route";
import admin_routes from "./routes/admin_routes";
import chatgptRoutes from "./routes/chatgpt_route";
import appointmentRoutes from "./routes/appointment_routes";
import searchRoutes from "./routes/user_route";
import scheduleRoutes from "./routes/schedule_routes";
import meetingRoutes from "./routes/meetingRoutes";
import notificationRoutes from "./routes/notification_route";

import Diary from "./routes/diary_route";
import statsRouter from "./routes/stats";
import "./config/passport";
import cookieParser from "cookie-parser";
import path from "path";
import cors from "cors";

const app = express();
const CLIENT_CONNECT = process.env.CLIENT_CONNECT;
app.use(cookieParser());

app.use(
  cors({
    origin: ["http://localhost:5173", "http://10.0.2.2:5173"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(bodyParser.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: "3.0.0",
    info: {
      title: "API Documentation",
      version: "1.0.0",
      description: "API Documentation for the project",
    },
    servers: [
      {
        url: `${CLIENT_CONNECT}`,
        description: "Local server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
  },
  apis: ["./routes/*.ts"],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerDocs));
app.use("/auth", authRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api/users", userRoutes);
app.use("/api", chatgptRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/api", admin_routes);
app.use("/api", appointmentRoutes);
app.use("/api", searchRoutes);
app.use("/api", scheduleRoutes);  
app.use("/api", meetingRoutes);
app.use("/api", Diary);
app.use("/stats", statsRouter);
app.use("/api", notificationRoutes);
app.use(express.static(path.resolve(__dirname, '..', 'front')));
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '..', 'front', 'index.html'));
});

const server = http.createServer(app);
const io = new socketIo.Server(server, {
  cors: {
    origin: `${CLIENT_CONNECT}`,
    methods: ["GET", "POST"],
    credentials: true,
  },
});
app.set("io", io);

initSocketServer(io);

const initApp = (): Promise<http.Server> => {
  return new Promise<http.Server>((resolve, reject) => {
    if (process.env.DB_CONNECT === undefined) {
      console.error("DB_CONNECT is not defined");
      reject("DB_CONNECT is not defined");
      return;
    } else {
      mongoose
        .connect(process.env.DB_CONNECT)
        .then(() => {
          require("./Middlewares/job"); 
          console.log("Connected to database");
          resolve(server);
        })
        .catch((err) => {
          console.error("Database connection error:", err);
          reject(err);
        });
    }
  });
};

export default initApp;
