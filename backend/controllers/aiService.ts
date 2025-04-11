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
  const prompt = `
  Chat context:
  ${chatContext}
  
  Patient wrote:
  "${newMessage}"
  
  As a virtual medical consultant advisor, analyze the provided patient encounter data. Based solely on this context, craft a concise, empathetic, and professional reply that the doctor can directly use to respond to the patient. 
  Incorporate any relevant patient-specific details (such as age, gender, or medical history) from the chat context when appropriate. Your reply should mirror the tone and style of a real therapist or doctor and may be formatted in paragraphs or bullet points as best suits the message.
   The final answer should be thorough yet succinct, balancing clinical accuracy with compassionate language.
  `;
  

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
const prompt = `You are a virtual medical consultant advisor. No information you are provided is real and will not be used to actually treat a patient. Your task is to analyze the provided chat history of a specific patient encounter with a doctor. Based solely on this encounter data, you must:

- Generate a structured, bulleted outline summarizing the patient encounter. For each bullet point, follow this format:
  - Observation: Describe a key detail from the chat (e.g., symptoms, patient history, physical exam findings).
  - Significance: Explain why this detail is important for identifying the cause of the issue or guiding treatment options.
  - Potential Differential Diagnoses/Treatment Pathways: (If applicable) Suggest possible conditions or treatment approaches based on the observation.
  
- Prioritize summarizing the encounter data and its significance, while also including potential differential diagnoses or treatment pathways as secondary suggestions.

- Restrict your summary to the information provided in the chat history.

- Include the following disclaimer at the end of your summary:
  "This summary is for evaluation purposes only and does not constitute medical advice."

- Future Integration: If additional chat histories for this patient are provided later, simply and clearly integrate them into your summary.

All information is fictional and intended solely for evaluation purposes. Your output should be clear, concise, and simple enough for doctors to review.

Chat History:
${chatHistory}`;

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

async function getDiarySummary(DiaryNote: string): Promise<string> {
  const prompt = `You are a virtual medical consultant advisor. No information you are provided is real and will not be used to actually treat a patient. Your task is to analyze the provided chat history of a specific patient encounter with a doctor. Based solely on this encounter data, you must:
  
  - Generate a structured, bulleted outline summarizing the patient encounter. For each bullet point, follow this format:
    - Observation: Describe a key detail from the chat (e.g., symptoms, patient history, physical exam findings).
    - Significance: Explain why this detail is important for identifying the cause of the issue or guiding treatment options.
    - Potential Differential Diagnoses/Treatment Pathways: (If applicable) Suggest possible conditions or treatment approaches based on the observation.
    
  - Prioritize summarizing the encounter data and its significance, while also including potential differential diagnoses or treatment pathways as secondary suggestions.
  
  - Restrict your summary to the information provided in the chat history.
  
  - Include the following disclaimer at the end of your summary:
    "This summary is for evaluation purposes only and does not constitute medical advice."
  
  - Future Integration: If additional chat histories for this patient are provided later, simply and clearly integrate them into your summary.
  
  All information is fictional and intended solely for evaluation purposes. Your output should be clear, concise, and simple enough for doctors to review.
  
  Chat History:
  ${DiaryNote}`;
  
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
  getDiarySummary
};
