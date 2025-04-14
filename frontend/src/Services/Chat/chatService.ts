import axios from "axios";
import CONFIG from "../../config";
import api from "../axiosInstance";
import { ChatMessage } from "../../types/ChatMessage";

const parseHistory = (historyStr: string): ChatMessage[] => {
  const lines = historyStr.split("\n");
  const messages: ChatMessage[] = [];
  let currentMessage: ChatMessage | null = null;

  const regex = /^\[(.*?)\]\s+(.*?)\s+->\s+(.*?):\s+(.*)$/;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (currentMessage) {
        currentMessage.message += "\n";
      }
      continue;
    }
    const match = regex.exec(line);
    if (match) {
      if (currentMessage) {
        messages.push(currentMessage);
      }
      const [, rawTimestamp, from, to, msg] = match;
      currentMessage = {
        from,
        to,
        message: msg, 
        timestamp: new Date(rawTimestamp),
      };
    } else {
      if (currentMessage) {
        currentMessage.message += "\n" + line;
      } else {
        currentMessage = {
          from: "",
          to: "",
          message: line,
          timestamp: new Date(),
        };
      }
    }
  }
  if (currentMessage) {
    messages.push(currentMessage);
  }
  return messages;
};

export const fetchChatHistory = async (
  meetingId: string
): Promise<ChatMessage[]> => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(
    `${CONFIG.SERVER_URL}/api/meetings/${meetingId}/history`,
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
  const data = response.data;

  if (typeof data.history === "string") {
    return parseHistory(data.history);
  }
  if (Array.isArray(data.history)) {
    return data.history;
  }
  return [];
};

export const saveConsultationSummary = async (
  meetingId: string,
  doctorId: string,
  summary: string
): Promise<{ success: boolean; message: string }> => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.post(
    `${CONFIG.SERVER_URL}/api/consultation/save-summary`,
    { meetingId, doctorId, summary },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};

export const fetchMeetingDetails = async (meetingId: string) => {
  const response = await api.get(
    `${CONFIG.SERVER_URL}/api/meetings/${meetingId}`,
    {
      withCredentials: true,
    }
  );
  return response.data.appointment;
};
