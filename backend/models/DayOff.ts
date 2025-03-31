import mongoose, { Schema, Document } from "mongoose";

export interface IDayOff extends Document {
  doctorId: mongoose.Types.ObjectId;
  date: Date;         
  reason?: string; 
}

const DayOffSchema = new Schema<IDayOff>({
  doctorId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  date: { type: Date, required: true },
  reason: { type: String, default: "" },
}, {
  timestamps: true
});

export default mongoose.model<IDayOff>("DayOff", DayOffSchema);
