import api from "./axiosInstance";
import CONFIG from "../config";
import axiosInstance from "./axiosInstance"

export const createAppointment = async (appointmentData: {
  patientId: string;
  doctorId: string;
  appointmentDate: Date;
  isEmergency: boolean;
  notes?: string;
  initiator: "doctor" | "patient";
}) => {
  const response = await api.post(
    `${CONFIG.SERVER_URL}/api/appointments`,
    appointmentData,
    {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

export const fetchAppointments = async () => {
  const response = await api.get(`${CONFIG.SERVER_URL}/api/appointments`, {
    withCredentials: true,
  });
  return response.data;
};

export const updateAppointment = async (
  appointmentId: string,
  updatedData: {
    appointmentDate?: Date;
    status?: "pending" | "confirmed" | "canceled" | "passed";
    notes?: string;
    isEmergency?: boolean;
  }
) => {
  const response = await api.put(
    `${CONFIG.SERVER_URL}/api/appointments/${appointmentId}`,
    updatedData,
    {
      withCredentials: true,
      headers: { "Content-Type": "application/json" },
    }
  );
  return response.data;
};

export const getSummaryByAppointmentId = async (appointmentId: string) => {
  try {
    const response = await api.get(`/api/summary/${appointmentId}`);
    return response.data.summary;
  } catch (error: any) {
    const message =
      error?.response?.data?.message || "Unknown error fetching summary";
    throw new Error(message);
  }
};

export const fetchPatientsWithSessions = async (doctorId: string) => {
  const res = await api.get(`/api/users/${doctorId}/patient-sessions`);
  return res.data;
};

export const getPatientSessions = async (patientId: string) => {
  const res = await api.get(`/api/patients/${patientId}/sessions`);
  return res.data;
};

