import mongoose, { Schema, Document } from "mongoose";

export interface IDiary extends Document {
  authorId: mongoose.Types.ObjectId;
  date: Date;
  context?: string;          
  aiSummary?: string; 
}

const DiarySchema = new Schema<IDiary>({
  authorId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
  date: { type: Date, required: true },
  context: { type: String, default: "" },
  aiSummary: { type: String, default: "" }
}, {
  timestamps: true
});

export default mongoose.model<IDiary>("Diary", DiarySchema);
