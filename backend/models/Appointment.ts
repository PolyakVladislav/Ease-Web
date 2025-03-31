import mongoose, { Document, Schema } from "mongoose";

export interface IAppointment extends Document {
  patientId: mongoose.Types.ObjectId;
  doctorId: mongoose.Types.ObjectId;
  appointmentDate: Date;
  status: "pending" | "confirmed" | "canceled" | "passed";
  notes: string;
  isEmergency: boolean;
  initiator: "doctor" | "patient";
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    appointmentDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ["pending", "confirmed", "canceled", "passed"] },
    notes: { type: String, default: "" },
    isEmergency: { type: Boolean, default: false },
    initiator: { type: String, enum: ["doctor", "patient"], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IAppointment>("Appointment", AppointmentSchema);