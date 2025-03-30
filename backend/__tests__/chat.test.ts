import request from "supertest";
import initApp from "../server";
import mongoose from "mongoose";
import { Message } from "../models/Message";
import userModel from "../models/Users";

let server: any;
let authToken: string;
let testUserId: string;
let otherUserId: string;

const testUser = {
  email: "test@user.com",
  password: "testpassword",
  username: "testuser",
};

const otherUser = {
  email: "other@user.com",
  password: "otherpassword",
  username: "otheruser",
};

beforeAll(async () => {
  server = await initApp();
});

beforeEach(async () => {
  await userModel.deleteMany({});
  await Message.deleteMany({});

  // הרשמה והתחברות של משתמש בדיקות
  await request(server).post("/auth/register").send(testUser);
  await request(server).post("/auth/register").send(otherUser);
  
  const loginRes = await request(server).post("/auth/login").send({
    email: testUser.email,
    password: testUser.password,
  });
  expect(loginRes.statusCode).toBe(200);
  authToken = loginRes.body.accessToken;
  testUserId = loginRes.body._id;

  const loginRes2 = await request(server).post("/auth/login").send({
    email: otherUser.email,
    password: otherUser.password,
  });
  expect(loginRes2.statusCode).toBe(200);
  otherUserId = loginRes2.body._id;
});

afterAll(async () => {
  await server.close();
  await mongoose.disconnect();
});

describe("Chat Tests", () => {
  test("should start a chat successfully", async () => {
    const response = await request(server)
      .post("/api/chat/start")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        userId: testUserId,
        otherUserId: otherUserId,
      });
      
    expect(response.statusCode).toBe(200);
    expect(response.body.message).toBe("Chat started successfully");
  });

  test("should return error if user tries to start a chat with themselves", async () => {
    const response = await request(server)
      .post("/api/chat/start")
      .set("Authorization", `Bearer ${authToken}`)
      .send({
        userId: testUserId,
        otherUserId: testUserId,
      });
      
    expect(response.statusCode).toBe(400);
    expect(response.body.error).toBe("You cannot start a chat with yourself.");
  });

  test("should get messages between two users", async () => {
    // יצירת פוסטים
    const message1 = new Message({
      from: testUserId,
      to: otherUserId,
      message: "Hello, how are you?",
      timestamp: new Date(),
    });
    await message1.save();

    const message2 = new Message({
      from: otherUserId,
      to: testUserId,
      message: "I'm good, thanks!",
      timestamp: new Date(),
    });
    await message2.save();

    const response = await request(server)
      .get(`/api/chat/${testUserId}/${otherUserId}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.statusCode).toBe(200);
    expect(response.body.length).toBe(2);
    expect(response.body[0]).toHaveProperty("from", testUserId);
    expect(response.body[0]).toHaveProperty("to", otherUserId);
    expect(response.body[0]).toHaveProperty("content", "Hello, how are you?");
    expect(response.body[1]).toHaveProperty("from", otherUserId);
    expect(response.body[1]).toHaveProperty("to", testUserId);
    expect(response.body[1]).toHaveProperty("content", "I'm good, thanks!");
  });

  test("should return 500 if there is an error fetching messages", async () => {
    const response = await request(server)
      .get(`/api/chat/${testUserId}/invalidUserId`)
      .set("Authorization", `Bearer ${authToken}`);
      
    expect(response.statusCode).toBe(500);
    expect(response.text).toBe("Server error");
  });
});
