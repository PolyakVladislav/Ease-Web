import api from "./axiosInstance";

export async function getDoctorSchedule(doctorId: string) {
  const res = await api.get(`/api/schedule/${doctorId}`);
  return res.data; 
}

export async function createOrUpdateSchedule(payload: {
  doctorId: string;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  slotDuration: number;
}) {
  const res = await api.post(`/api/schedule`, payload);
  return res.data;
}

export async function deleteScheduleEntry(scheduleId: string) {
  const res = await api.delete(`/api/schedule/${scheduleId}`);
  return res.data;
}
