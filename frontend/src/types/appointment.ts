export interface Appointment {
  _id: string;
  patientId: { username: string } | null;  patientName?: string;   
  doctorId?: string;
  appointmentDate: string; 
  status: "pending" | "confirmed" | "canceled" | "passed";
  notes?: string;
  isEmergency: boolean;
  initiator: "doctor" | "patient";
  createdAt?: string;
  updatedAt?: string;
  aiMessages?: string[];
}