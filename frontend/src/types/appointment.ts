export interface Appointment {
  _id: string;
  patientId:  { _id: string; username: string } | null;  patientName?: string;   
  doctorId?: string;
  appointmentDate: string; 
  status: "pending" | "confirmed" | "canceled" | "passed";
  notes?: Array<{
    _id: string;
    authorId: string;
    date: string;
    context: string;
    nlpSummary: string;
    sentimentScore: number;
    mood: string;
    riskLevel: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  }>;
  isEmergency: boolean;
  initiator: "doctor" | "patient";
  createdAt?: string;
  updatedAt?: string;
  aiMessages?: string[];
}