import { Request, Response } from "express";
import Diary, { IDiary } from "../models/Diary";
import aiService from "./aiService";
import Sentiment from 'sentiment';
const dangerWords = [
  "losing", "hopeless", "worthless", "disappear", "die", "suicide",
  "kill", "cut", "pain", "end it", "no point", "nothing matters",
  "abandon", "alone", "ashamed", "bleeding", "broken", "burden",
  "crying", "dark", "drowning", "empty", "forgotten", "hate",
  "helpless", "invisible", "isolated", "lonely", "misery", 
  "numb", "overwhelmed", "panic", "paralyzed", "rejected",
  "scream", "shame", "suffer", "suffocating", "trapped",
  "unloved", "useless", "void", "wounded", "wrecked"
];const dangerPhrases = [
  "end it", "no point", "nothing matters", "kill myself",
  "better off without me", "stop the pain", "take my life",
  "can't go on", "can't breathe", "make it stop", 
  "want to disappear", "never wake up", "nobody cares",
  "not good enough", "unwanted", "wish I was gone",
  "tired of trying", "just want to sleep", "can't handle it",
  "no reason to live", "sick of everything", "better off alone"
];

const sentiment = new Sentiment();
export const getAllDiaryEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.query;
    if (!patientId) {
      res.status(400).json({ message: "Patient ID is required" });
      return;
    }
    const Diary_List = await Diary.find({ authorId: patientId }).sort({ date: -1 });
    res.status(200).json(Diary_List);
    return;
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDiaryEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    if (!id) {
      res.status(400).json({ message: "Diary entry ID is required" });
      return;
    }
    const diaryEntry = await Diary.findByIdAndDelete(id);
    if (!diaryEntry) {
      res.status(404).json({ message: "Diary entry not found" });
      return;
    }
    res.status(200).json({ message: "Diary entry deleted successfully" });
  }
  catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateDiaryEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { context,date } = req.body;
    if (!id) {
      res.status(400).json({ message: "Diary entry ID is required" });
      return;
    }
    const diaryEntry = await Diary.findById(id);
    if (!diaryEntry) {
      res.status(404).json({ message: "Diary entry not found" });
      return;
    }
    diaryEntry.context = context || diaryEntry.context;
    diaryEntry.date = date || diaryEntry.date;
    await diaryEntry.save();
    res.status(200).json({ message: "Diary entry updated successfully" });
  }
  catch (error) { 
    res.status(500).json({ message: "Internal server error" });
  }
};
export const createDiaryEntry = async (req: Request, res: Response): Promise<void> => {
    try {
        const dateIL = new Date().toLocaleString("en-IL", { timeZone: "Asia/Jerusalem" });
        const { authorId, date, context } = req.body;
        if (!authorId || !date) {
            res.status(400).json({ message: "Author ID and date are required" });
            return;
            }
        const newDiaryEntry = new Diary({ authorId, date, context });
        await newDiaryEntry.save();
        
        res.status(201).json({ message: "Diary entry created successfully", newDiaryEntry });
        const diary = await generateClinicalSummary(newDiaryEntry);
        const last_Diary = await Diary.find({ _id: newDiaryEntry._id });
        if (!diary) {
            return;
        }
        last_Diary[0].nlpSummary =diary.nlpSummary;
        last_Diary[0].sentimentScore = diary.sentimentScore;
        last_Diary[0].mood = diary.mood;
        last_Diary[0].riskLevel = diary.riskLevel;
        await last_Diary[0].save();
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
export const aiSummaryDiary = async (Diary:IDiary) => {
    try {
      if (!Diary.context) {
        return ;
      }
      const summary =await sentiment.analyze(Diary.context);
      console.log("summary", summary);
      return summary;
    } catch (error) {
      return "Error generating summary";
    }
}





function generateClinicalSummary(Diary: IDiary) {
  if (!Diary.context) return;

  const text = Diary.context.trim();
  const result = sentiment.analyze(text);
  const { score, negative, positive } = result;
  const lowerText = text.toLowerCase();

  // Enhanced detection (Manual context-based phrases)
  const criticalIndicators = [
    "shaking", "heart pounding", "sweating", "disconnected", 
    "flashes", "watching from a distance", "couldn't shake", 
    "couldn't sleep", "racing thoughts", "numb", "trapped", "defeated"
  ];

  const contextPhrases = criticalIndicators.filter((phrase) =>
    lowerText.includes(phrase)
  );

  // Detect red flag words
  const redFlagWords = negative.filter((word) =>
    dangerWords.includes(word.toLowerCase())
  );

  // Detect red flag phrases in the full text
  const redFlagPhrases = dangerPhrases.filter((phrase) =>
    lowerText.includes(phrase)
  );

  // Combine and deduplicate
  const allRedFlags = [...new Set([...redFlagWords, ...redFlagPhrases, ...contextPhrases])];

  // Emotional tone logic
  let emotionalTone = "neutral";
  if (score <= -4) emotionalTone = "negative";
  else if (score <= -1) emotionalTone = "slightly negative";
  else if (score >= 4) emotionalTone = "very positive";
  else if (score > 0) emotionalTone = "slightly positive";

  // Default risk level
  let riskLevel = "⚪ Stable";

  // 🔥 Override logic: phrase overrides sentiment
  if (allRedFlags.length > 0 || lowerText.includes("kill myself")) {
    emotionalTone = "critical emotional distress";
    riskLevel = "🔴 High Risk";
  } else if (contextPhrases.length > 2 || score <= -4) {
    riskLevel = "🟠 Moderate Risk";
  } else if (score <= -1) {
    riskLevel = "🟡 Mild Emotional Distress";
  } else if (score >= 1) {
    riskLevel = "🟢 Positive/Improving";
  }

  // 📘 Clinical-style summary
  const summary_text = `
📘 **Diary NLP Summary Report**

- **Emotional Tone**: ${emotionalTone}
- **Sentiment Score**: ${score}
- **Risk Level**: ${riskLevel}
- **Key Negative Expressions**: ${negative.length ? negative.join(", ") : "None"}
- **Key Positive Expressions**: ${positive.length ? positive.join(", ") : "None"}
- **Context Indicators**: ${contextPhrases.length ? contextPhrases.join(", ") : "None"}

📝 **Clinical Summary**:
The patient expresses a *${emotionalTone}* tone. 
Sentiment score of ${score} supports this assessment. 
${allRedFlags.length > 0 
    ? `⚠️ Critical red flag terms detected: "${allRedFlags.join(', ')}", indicating possible mental health crisis or severe distress. Immediate clinical attention is advised.` 
    : "No explicit red flag expressions detected in this entry."}
Monitor emotional trends over time and intervene if similar entries persist.
  `.trim();

  return {
    authorId: Diary.authorId,
    date: Diary.date,
    context: Diary.context,
    nlpSummary: summary_text,
    sentimentScore: score,
    mood: emotionalTone,
    riskLevel: riskLevel,
    redFlags: allRedFlags,
  };
}


