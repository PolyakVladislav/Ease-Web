import mongoose, { Document, Schema } from "mongoose";

export interface IConsultationSummary extends Document {
  appointmentId: string;
  doctorId: string;
  summary: string;
  createdAt: Date;
}

const ConsultationSummarySchema = new Schema<IConsultationSummary>(
  {
    appointmentId: { type: String, required: true },
    doctorId: { type: String, required: true },
    summary: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const ConsultationSummary = mongoose.model<IConsultationSummary>("ConsultationSummary", ConsultationSummarySchema);

export { ConsultationSummary };
