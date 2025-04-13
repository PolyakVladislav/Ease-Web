import mongoose, { Document, Schema } from "mongoose";

interface IOverallSummary extends Document {
  doctorId: string;   
  patientId: string; 
  text: string;      
  updatedAt: Date;  
}

const OverallSummarySchema = new Schema<IOverallSummary>({
  doctorId: { type: String, required: true },
  patientId: { type: String, required: true },
  text: { type: String, default: "" },
  updatedAt: { type: Date, default: Date.now },
});

const OverallSummary = mongoose.model<IOverallSummary>("OverallSummary", OverallSummarySchema);

export { OverallSummary, IOverallSummary };