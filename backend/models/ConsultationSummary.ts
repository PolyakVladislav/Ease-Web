import mongoose, { Document, Schema } from "mongoose";
export interface IConsultationSummary extends Document {
  appointmentId: string;  
  doctorId: string;
  patientId: string;      
  summary: string;
  createdAt: Date;
}

const ConsultationSummarySchema = new Schema<IConsultationSummary>(
  {
    appointmentId: { type: String, required: true },
    doctorId:      { type: String, required: true },
    patientId:     { type: String, required: true },  
    summary:       { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

ConsultationSummarySchema.index(
  { patientId: 1, doctorId: 1, createdAt: -1 },
  { name: "patient_doctor_date" }
);

const ConsultationSummary = mongoose.model<IConsultationSummary>(
  "ConsultationSummary",
  ConsultationSummarySchema
);

export { ConsultationSummary };