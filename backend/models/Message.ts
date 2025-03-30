import mongoose from "mongoose";

export interface IMessage {
  from: string;  
  to: string;    
  message: string;
  timestamp: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
  from: { type: String, required: true },  
  to: { type: String, required: true },   
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model<IMessage>("Message", messageSchema);

export { Message };
