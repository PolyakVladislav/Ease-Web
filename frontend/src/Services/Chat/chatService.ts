import axios from "axios";
import CONFIG from "../../config";

export const fetchChatHistory = async (meetingId: string): Promise<any> => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.get(`${CONFIG.SERVER_URL}/api/meetings/${meetingId}/history`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.history;
};

export const saveConsultationSummary = async (
  meetingId: string,
  doctorId: string,
  summary: string
): Promise<any> => {
  const token = localStorage.getItem("accessToken");
  const response = await axios.post(
    `${CONFIG.SERVER_URL}/api/consultation/save-summary`,
    { meetingId, doctorId, summary },
    { headers: { Authorization: `Bearer ${token}` } }
  );
  return response.data;
};
