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

const cache = new NodeCache({ stdTTL: 3600 });

/**
 * Get AI suggestion for chat reply.
 * @param chatContext - Current chat context.
 * @param newMessage - Message for which a suggestion is needed.
 * @returns AI recommendation.
 */
async function getSuggestion(chatContext: any, newMessage: string): Promise<string> {
  const prompt = `Chat context:\n${chatContext}\n\nPatient wrote: "${newMessage}"\nProvide a concise, accurate reply for the doctor.`;

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
          content: "You are an AI assistant for doctors. Provide concise, accurate advice for medical conversations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 250,
    }),
  });

  if (!response.ok) {
    throw new Error("Error in request to OpenAI");
  }

  const data: OpenAIResponse = await response.json();
  let gptMessage = data.choices[0]?.message?.content?.trim() || "";
  return gptMessage;
}

/**
 * Get final consultation summary from AI.
 * @param chatHistory - Chat history.
 * @returns Consultation summary.
 */
async function getSummary(chatHistory: any): Promise<string> {
  const prompt = `Analyze the following chat history between doctor and patient and provide a brief consultation summary:\n\n${chatHistory}`;

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
          content: "You are an AI assistant summarizing doctor-patient consultations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 250,
    }),
  });

  if (!response.ok) {
    throw new Error("Error in request to OpenAI for consultation summary");
  }

  const data: OpenAIResponse = await response.json();
  let summary = data.choices[0]?.message?.content?.trim() || "";
  return summary;
}

export default {
  getSuggestion,
  getSummary,
  cache,
};
