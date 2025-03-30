import { Request, Response, NextFunction } from "express";
import { Message } from "../models/Message";

export const startChat = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { userId, otherUserId } = req.body;

        if (userId === otherUserId) {
            res.status(400).json({ error: "You cannot start a chat with yourself." });
        } else {
            res.status(200).json({ message: "Chat started successfully" });
        }
    } catch (error) {
        next(error);
    }
};

export const getMessages = async (req: Request, res: Response) => {
  const { userId, otherUserId } = req.params;
  try {
    const messages = await Message.find({
      $or: [
        { from: userId, to: otherUserId },
        { from: otherUserId, to: userId }
      ]
    }).sort({ timestamp: 1 });

    if (messages.length === 0) {
      res.status(200).json([]);
      return;
    }

    const transformed = messages.map(doc => ({
      from: doc.from,
      to: doc.to,
      content: doc.message,
      timestamp: doc.timestamp,
    }));

    res.status(200).json(transformed);
  } catch (error) {
    res.status(500).send("Server error");
  }
};





export default {
    getMessages,
    startChat,
  };