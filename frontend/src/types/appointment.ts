export interface Appointment {
  _id: string;
  patientId: string;
  patientName?: string;   
  doctorId: string;
  appointmentDate: string; 
  status: "pending" | "confirmed" | "canceled" | "completed";
  notes?: string;
  isEmergency: boolean;
  createdAt?: string;
  updatedAt?: string;
}
