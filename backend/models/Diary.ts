import mongoose, { Schema, Document } from "mongoose";

export interface IDiary extends Document {
  authorId: mongoose.Types.ObjectId;
  date: Date;
  context?: string;

  // NLP analysis fields
  nlpSummary?: string;         
  sentimentScore?: number;     
  mood?: string;              
  riskLevel?: string;         

}

const DiarySchema = new Schema<IDiary>(
  {
    authorId: { type: Schema.Types.ObjectId, ref: "Users", required: true },
    date: { type: Date, required: true },
    context: { type: String, default: "" },

    nlpSummary: { type: String, default: "" },
    sentimentScore: { type: Number, default: 0 },
    mood: { type: String, default: "neutral" },
    riskLevel: { type: String, default: "Stable" },
  },
  {
    timestamps: true
  }
);

export default mongoose.model<IDiary>("Diary", DiarySchema);
