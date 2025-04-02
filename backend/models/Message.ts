import mongoose, { Document, Schema } from "mongoose";

export interface IMessage extends Document {
  meetingId: string;   
  from: string;       
  to: string;         
  message: string;
  timestamp: Date;
}

const messageSchema = new Schema<IMessage>({
  meetingId: { type: String, required: true },
  from: { type: String, required: true },
  to: { type: String, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model<IMessage>("Message", messageSchema);

export { Message };
