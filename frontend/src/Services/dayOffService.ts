import api from "./axiosInstance";

export async function getDayOffs(doctorId: string) {
  const res = await api.get(`/api/schedule/${doctorId}/dayoffs`);
  return res.data; 
}

export async function addDayOff(payload: { doctorId: string; date: string; reason?: string }) {
  const res = await api.post(`/api/schedule/dayoff`, payload);
  return res.data; 
}

export async function deleteDayOff(dayOffId: string) {
  const res = await api.delete(`/api/schedule/dayoff/${dayOffId}`);
  return res.data; 
}
