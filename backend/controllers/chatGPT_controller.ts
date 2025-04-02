import { Request, Response, NextFunction } from "express";
import fetch from "node-fetch"; 
import NodeCache from "node-cache";

interface OpenAIMessage {
  role: string;
  content: string;
}

interface OpenAIChoice {
  index: number;
  message: OpenAIMessage;
  finish_reason: string;
}

interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  choices: OpenAIChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  throw new Error("Missing OpenAI API Key in environment variables");
}

export const cache = new NodeCache({ stdTTL: 3600 });
export const chatWithGPT = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { message, store } = req.body;

  if (!message) {
    res.status(400).json({ error: "Message is required" });
    return;
  }

  const cachedResponse = cache.get<string>(message);
  if (cachedResponse) {
    res.json({ message: cachedResponse });
    return;
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are an AI assistant for licensed therapists working with individuals who have experienced trauma. Your role is to provide concise, professional, and evidence-based insights to support therapists in their clinical decision-making. Focus on trauma-informed care, psychological principles, therapeutic techniques, and relevant research. Your answers should be addressed to the therapist, not to the patient. Do not offer direct diagnoses or treatment plans unless specifically requested for professional guidance."

          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 250,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      res.status(response.status).json({ error: errorData });
      return;
    }

    const data: OpenAIResponse = (await response.json()) as OpenAIResponse;
    let gptMessage = data.choices[0]?.message?.content?.trim() || "";

    gptMessage = gptMessage.replace(/recommended comment[:]?/gi, "").trim();
    gptMessage = gptMessage.replace(/^"(.*)"$/, "$1").trim();

    cache.set(message, gptMessage);

    res.json({ message: gptMessage });
  } catch (error: any) {
    if (process.env.NODE_ENV !== "test") {
    }
    res.status(500).json({ error: "Internal server error" });
  }
};
