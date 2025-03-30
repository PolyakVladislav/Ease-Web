import { Router } from "express";
import { startChat, getMessages } from "../controllers/chat_controller";

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Chat
 *   description: The Chat API
 */

/**
 * @swagger
 * /chat/start:
 *   post:
 *     summary: Start a new chat between two users
 *     tags: [Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *                 description: The ID of the current user.
 *               otherUserId:
 *                 type: string
 *                 description: The ID of the other user to start a chat with.
 *             required:
 *               - userId
 *               - otherUserId
 *     responses:
 *       200:
 *         description: Chat started successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Chat started successfully
 *       400:
 *         description: Bad request - for example, when trying to start a chat with oneself.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: You cannot start a chat with yourself.
 *       500:
 *         description: Server error
 */
router.post("/start", startChat);

/**
 * @swagger
 * /chat/{userId}/{otherUserId}:
 *   get:
 *     summary: Get messages between two users
 *     tags: [Chat]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the current user.
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the other user.
 *     responses:
 *       200:
 *         description: A list of messages between the two users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   from:
 *                     type: string
 *                     description: Sender's user ID.
 *                     example: 607d1b2f5311236168a109ca
 *                   to:
 *                     type: string
 *                     description: Recipient's user ID.
 *                     example: 607d1b2f5311236168a109cb
 *                   content:
 *                     type: string
 *                     description: The message content.
 *                     example: Hello!
 *                   timestamp:
 *                     type: string
 *                     format: date-time
 *                     description: The time the message was sent.
 *                     example: 2025-02-01T12:34:56Z
 *       500:
 *         description: Server error
 */
router.get("/:userId/:otherUserId", getMessages);

export default router;
