import { Request, Response } from "express";
import Diary, { IDiary } from "../models/Diary";
import aiService from "./aiService";
import Sentiment from 'sentiment';
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
       // let aiSummary= await aiSummaryDiary(newDiaryEntry);
        const newAiDiary = newDiaryEntry;
        //newAiDiary.aiSummary = aiSummary;
        const last_Diary = await Diary.find({ _id: newDiaryEntry._id });
        //last_Diary[0].aiSummary = aiSummary;
        await last_Diary[0].save();
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};
export const aiSummaryDiary = async () => {
    try {
       // const summary = await aiService.getDiarySummary(diaryEntry.context || "");
       const summary =await sentiment.analyze( "Today was really hard. I woke up with this tight feeling in my chest again. It’s like something bad is about to happen, even when everything is fine. I tried to go outside, but my heart started racing and I couldn’t catch my breath. I just turned around and went back inside.I feel like I’m losing control. Everyone thinks I’m just being dramatic, but they don’t understand how exhausting it is to fight these thoughts all day. I’m scared that this is never going to go away. I want to feel normal again, just for one day.");
       console.log("summary", summary);
        //diaryEntry.aiSummary = summary;
        //return summary;
    } catch (error) {
      return "Error generating summary";
    }
}
