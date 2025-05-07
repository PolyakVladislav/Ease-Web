import { Message } from "../models/Message";
import { ConsultationSummary } from "../models/ConsultationSummary";


export async function buildChatContext(
  meetingId: string,
  doctorId: string,
  patientId: string,
  opts: { maxMessages?: number; maxSummaries?: number; maxChars?: number } = {}
): Promise<string> {
  const {
    maxMessages  = 40,    
    maxSummaries = 5,     
    maxChars     = 10_000 
  } = opts;

  const msgs = await Message.find({ meetingId })
    .sort({ timestamp: -1 })
    .limit(maxMessages)
    .lean();

  const sums = await ConsultationSummary.find({ doctorId, patientId })
    .sort({ createdAt: -1 })
    .limit(maxSummaries)
    .lean();

  const parts: string[] = [];

  if (sums.length) {
    parts.push("### PREVIOUS SESSION SUMMARIES");
    sums.forEach((s, i) =>
      parts.push(`Session ${i + 1}:\n${s.summary.trim()}`)
    );
  }

  parts.push("### CURRENT CONVERSATION");
  msgs
    .reverse() 
    .forEach((m) =>
      parts.push(
        `[${m.timestamp.toISOString()}] ${
          m.from === doctorId ? "Doctor" : "Patient"
        }: ${m.message}`
      )
    );

  let ctx = parts.join("\n\n");

  while (ctx.length > maxChars && parts.length) {
    const idx = parts.indexOf("### CURRENT CONVERSATION");
    if (idx > 1) {
      parts.splice(idx - 1, 1); 
    } else {
      parts.splice(idx + 1, 1);
    }
    ctx = parts.join("\n\n");
  }

  return ctx;
}