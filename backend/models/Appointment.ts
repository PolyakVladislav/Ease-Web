import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    appointmentDate: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "confirmed", "canceled", "completed"],
      default: "pending",
    },
    notes: {
      type: String,
      default: "",
    },
    isEmergency: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Appointment", appointmentSchema);
