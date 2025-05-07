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

async function getSuggestion(
  chatContext: any,
  newMessage: string
): Promise<string> {
  const prompt = `
  ### CONTEXT
  ${chatContext}
  
  ### LAST PATIENT LINE
  "${newMessage}"
  
  ### ROLE
  You are an experienced trauma-informed psychotherapist.
  
  ### TASK
  Reply ONLY to the last patient line.
  
  ### STYLE
  • 1–3 sentences, maximum 70 words.  
  • Empathic, validating, calm.  
  • NO phone numbers, hotlines or step-by-step instructions.  
  • End by inviting the patient to elaborate or reflect.
  
  ### OUTPUT
  Return ONLY the doctor's reply, without any extra text.
  `;

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      //model: "gpt-4o",
      messages: [
        {
          role: "system",
          content:
            "You are an AI assistant for doctors. Provide concise, accurate advice for medical conversations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 120,
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
  const prompt = `
### ROLE
You are an experienced clinician-assistant summarising a single doctor–patient encounter.

### INPUT
<CHAT_HISTORY>
${chatHistory}
</CHAT_HISTORY>

### TASK
Produce a brief, **structured outline (max 6 bullet points)** that a doctor can quickly review.

### BULLET FORMAT  (use exactly this template)
• **Observation** – Key fact in ≤20 words  
  **Significance** – Why it matters (≤15 words)  
  **Next Step** – Suggested direction or question (≤15 words, optional)

### RULES
1. Use at most **6** bullets.  
2. Pull information **only** from the chat history.  
3. No diagnoses, drug names or hotlines.  
4. English, plain text, no markdown.  
5. End with the line:  
   _"This summary is for evaluation purposes only and does not constitute medical advice."_
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
          content:
            "You are an AI assistant summarizing doctor-patient consultations.",
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
          content:
            "You are an AI assistant summarizing doctor-patient consultations.",
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
async function getOverallSummary(allSummaries: string[]): Promise<string> {
  if (!allSummaries.length) {
    return "";
  }

  const combinedText = allSummaries.join("\n\n---\n\n");

  const prompt = `
  You are an AI assistant analyzing multiple session summaries for the same patient-doctor relationship.
  
  Here are the session-based summaries:
  
  ${combinedText}
  
  Analyze them collectively and provide a single, concise "Overall AI Summary" that addresses:
  - The main issues or symptoms that emerged across the sessions
  - How the patient's condition evolved over time
  - Key interventions or advice repeated across sessions
  
  Include a final note: "This is an overall summary for evaluation purposes only and does not constitute medical advice."
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
          content:
            "You are an AI assistant summarizing multiple doctor-patient consultations.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 700,
    }),
  });

  if (!response.ok) {
    throw new Error("Error in request to OpenAI for overall summary");
  }

  const data: OpenAIResponse = await response.json();
  const summary = data.choices[0]?.message?.content?.trim() || "";
  return summary;
}

export default {
  getSuggestion,
  getSummary,
  getDiarySummary,
  getOverallSummary,
  cache,
};
