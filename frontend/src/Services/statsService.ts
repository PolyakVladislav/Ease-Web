import api from "./axiosInstance";
import CONFIG from "../config";

export interface AppointmentsByWeek {
  period: string;   
  count: number;
}

export const fetchAppointmentsByWeek = async (
  doctorId: string
): Promise<AppointmentsByWeek[]> => {
  const token = localStorage.getItem("accessToken");

  const resp = await api.get<AppointmentsByWeek[]>(
    `${CONFIG.SERVER_URL}/stats/appointmentsByWeek`,
    {
      params: { doctorId },
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }
  );
  return resp.data;
};

export interface SessionStatus { [status: string]: number; }

export const fetchSessionStatus = async (doctorId: string): Promise<SessionStatus> => {
  const token = localStorage.getItem("accessToken");

  const resp = await api.get<SessionStatus>(
    `${CONFIG.SERVER_URL}/stats/sessionStatus`,
    {
      params: { doctorId },
      headers: { Authorization: `Bearer ${token}` },
      withCredentials: true,
    }
  );
  return resp.data;
};