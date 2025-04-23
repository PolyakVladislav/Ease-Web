import { Request, Response } from "express";
import Diary, { IDiary } from "../models/Diary";
import aiService from "./aiService";
import Sentiment from 'sentiment';
const dangerWords = ["losing", "hopeless", "worthless", "disappear", "die", "suicide", "kill", "cut", "pain", "end it", "no point", "nothing matters"];

const sentiment = new Sentiment();
export const getAllDiaryEntries = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId } = req.query;
    if (!patientId) {
      res.status(400).json({ message: "Patient ID is required" });
      return;
    }
    const Diary_List = await Diary.find({ authorId: patientId })
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
        last_Diary[0].nlpSummary =diary.nlpreview;
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


function generateClinicalSummary(Diary:IDiary) {
  if (!Diary.context) {
    return ;
  }
    const result = sentiment.analyze(Diary.context);

    const { score, negative, positive } = result;

    // Tone label
    let emotionalTone = "neutral";
    if (score <= -4) emotionalTone = "negative";
    else if (score <= -1) emotionalTone = "slightly negative";
    else if (score >= 4) emotionalTone = "very positive";
    else if (score > 0) emotionalTone = "slightly positive";

    // Red flag detection
    const redFlags = negative.filter(word => dangerWords.includes(word.toLowerCase()));

    // Risk level based on score + danger words
    let riskLevel = "⚪ Stable";

    if (redFlags.length > 0) {
        riskLevel = "🔴 High Risk";
    } else if (score <= -4) {
        riskLevel = "🟠 Moderate Risk";
    } else if (score <= -1) {
        riskLevel = "🟡 Mild Emotional Distress";
    } else if (score >= 1) {
        riskLevel = "🟢 Positive/Improving";
    }

    // Clinical-style summary text
    const summary_text = `
📘 **Diary NLP Summary Report**

- **Emotional Tone**: ${emotionalTone}
- **Sentiment Score**: ${score}
- **Risk Level**: ${riskLevel}
- **Key Negative Expressions**: ${negative.length ? negative.join(", ") : "None detected"}
- **Key Positive Expressions**: ${positive.length ? positive.join(", ") : "None detected"}

📝 **Clinical Summary**:
The patient's diary entry indicates a *${emotionalTone}* emotional tone. 
Sentiment score of ${score} suggests a ${emotionalTone === "neutral" ? "stable emotional state" : emotionalTone}. 
${redFlags.length > 0 
    ? `⚠️ Red flag terms detected: "${redFlags.join(', ')}", which may indicate mental health risks requiring immediate attention.` 
    : `No critical red flag expressions were identified in this entry.`}
It is recommended to continue monitoring the emotional pattern over time.
    `.trim();
    const nlpSummary = {
        authorId: Diary.authorId,
        date: Diary.date,
        context: Diary.context,
        nlpreview: summary_text,
        sentimentScore: score,
        mood: emotionalTone,
        riskLevel: riskLevel
    };
    return nlpSummary;
}

