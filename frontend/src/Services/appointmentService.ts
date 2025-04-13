import api from "./axiosInstance";
import { AxiosError } from "axios";
import CONFIG from "../config";

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
  } catch (error: unknown) {
    if (error instanceof AxiosError) {
      const message =
        error?.response?.data?.message || "Unknown error fetching summary";
      throw new Error(message);
    } else {
      throw new Error("Unknown error fetching summary");
    }
  }
};

export const fetchPatientsWithSessions = async (doctorId: string) => {
  const res = await api.get(`/api/users/${doctorId}/patient-sessions`);
  return res.data;
};

export const getPatientSessions = async (
  patientId: string,
  doctorId?: string
) => {
  let url = `/api/patients/${patientId}/sessions`;
  if (doctorId) {
    url += `?doctorId=${doctorId}`;
  }
  const res = await api.get(url);
  return res.data;
};


export const fetchUnassignedUrgentAppointments = async () => {
  const response = await api.get(`${CONFIG.SERVER_URL}/api/appointments/urgent?status=pending`, {
    withCredentials: true,
  });
  return response.data.appointments; 
};

export const claimUrgentAppointment = async (appointmentId: string) => {

  const response = await api.patch(
    `${CONFIG.SERVER_URL}/api/appointments/${appointmentId}/claim`,
    null, 
    {
      withCredentials: true,
    }
  );
  return response.data.appointment; 
};


export const fetchStoredOverallSummary = async (patientId: string, doctorId: string) => {
  const response = await api.get(`/api/patients/${patientId}/doctor/${doctorId}/overall-summary`);
  return response.data;
};