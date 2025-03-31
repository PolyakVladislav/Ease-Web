import { Request, Response } from "express";
import Schedule from "../models/Schedule";

export const createOrUpdateSchedule = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId, dayOfWeek, startHour, endHour, slotDuration } = req.body;
    if (!doctorId || dayOfWeek === undefined || startHour === undefined || endHour === undefined) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const existing = await Schedule.findOne({ doctorId, dayOfWeek });
    if (existing) {
      existing.startHour = startHour;
      existing.endHour = endHour;
      existing.slotDuration = slotDuration || 60;
      await existing.save();
      res.status(200).json({ message: "Schedule updated", schedule: existing });
      return;
    } else {
      const newSchedule = await Schedule.create({
        doctorId,
        dayOfWeek,
        startHour,
        endHour,
        slotDuration: slotDuration || 60,
      });
      res.status(201).json({ message: "Schedule created", schedule: newSchedule });
      return;
    }
  } catch (error) {
    console.error("Error createOrUpdateSchedule:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getScheduleByDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) {
      res.status(400).json({ message: "Doctor ID is required" });
      return;
    }
    const schedules = await Schedule.find({ doctorId }).sort({ dayOfWeek: 1 });
    res.status(200).json({ schedules });
    return;
  } catch (error) {
    console.error("Error getScheduleByDoctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteScheduleEntry = async (req: Request, res: Response): Promise<void> => {
  try {
    const { scheduleId } = req.params;
    if (!scheduleId) {
      res.status(400).json({ message: "Schedule ID is required" });
      return;
    }

    const deleted = await Schedule.findByIdAndDelete(scheduleId);
    if (!deleted) {
      res.status(404).json({ message: "Schedule not found" });
      return;
    }
    res.status(200).json({ message: "Schedule entry deleted" });
    return;
  } catch (error) {
    console.error("Error deleteScheduleEntry:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
