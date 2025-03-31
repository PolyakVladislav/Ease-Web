import mongoose, { Schema, Document } from "mongoose";


export interface ISchedule extends Document {
  doctorId: mongoose.Types.ObjectId;
  dayOfWeek: number;
  startHour: number;
  endHour: number;
  slotDuration: number;
}

const ScheduleSchema = new Schema<ISchedule>({
  doctorId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  dayOfWeek: { type: Number, required: true },    
  startHour: { type: Number, required: true },   
  endHour: { type: Number, required: true },        
  slotDuration: { type: Number, default: 60 },      
}, {
  timestamps: true
});

export default mongoose.model<ISchedule>("Schedule", ScheduleSchema);
