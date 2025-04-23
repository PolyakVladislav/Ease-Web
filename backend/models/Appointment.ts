import mongoose, { Document, Schema } from "mongoose";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId | null;
  appointmentDate: Date;
  status: "pending" | "confirmed" | "canceled" | "passed";
  notes: String[];
  isEmergency: boolean;
  initiator: "doctor" | "patient";
  aiMessages?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "Users", default: null },
    appointmentDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ["pending", "confirmed", "canceled", "passed"] },
    notes: { type: [String], default: [] },
    isEmergency: { type: Boolean, default: false },
    initiator: { type: String, enum: ["doctor", "patient"], required: true },
    aiMessages: { type: [String], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>("Appointment", AppointmentSchema);