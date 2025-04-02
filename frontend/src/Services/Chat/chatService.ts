import axios from "axios";
import CONFIG from "../../config";
import  api from "../axiosInstance";
import { ChatMessage } from "../../types/ChatMessage";


const parseHistory = (historyStr: string): ChatMessage[] => {
  const lines = historyStr.split("\n").filter((line) => line.trim() !== "");
  return lines.map((line) => {
    const regex = /^\[(.*?)\]\s+(.*?)\s+->\s+(.*?):\s+(.*)$/;
    const match = regex.exec(line);
    if (match) {
      const [, timestamp, from, to, message] = match;
      return {
        from,
        to,
        message,
        timestamp: new Date(timestamp),
      };
    }
    return {
      from: "",
      to: "",
      message: line,
      timestamp: new Date(),
    };
  });
};

export const fetchChatHistory = async (meetingId: string): Promise<ChatMessage[]> => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${CONFIG.SERVER_URL}/api/meetings/${meetingId}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const history = response.data.history;
  if (typeof history === "string") {
    return parseHistory(history);
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
  const response = await api.get(`${CONFIG.SERVER_URL}/api/meetings/${meetingId}`, {
    withCredentials: true,
  });
  return response.data.appointment;
};
