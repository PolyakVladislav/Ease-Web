import { Request, Response } from "express";
import DayOff from "../models/DayOff";
import Schedule from "../models/Schedule";
import Appointment from "../models/Appointment";

export const addDayOff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId, date, reason } = req.body;
    if (!doctorId || !date) {
      res.status(400).json({ message: "Missing required fields (doctorId, date)" });
      return;
    }
    const newDayOff = await DayOff.create({ doctorId, date, reason });
    res.status(201).json({ message: "Day off added", dayOff: newDayOff });
    return;
  } catch (error) {
    console.error("Error addDayOff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteDayOff = async (req: Request, res: Response): Promise<void> => {
  try {
    const { dayOffId } = req.params;
    if (!dayOffId) {
      res.status(400).json({ message: "dayOffId is required" });
      return;
    }
    const deleted = await DayOff.findByIdAndDelete(dayOffId);
    if (!deleted) {
      res.status(404).json({ message: "DayOff not found" });
      return;
    }
    res.status(200).json({ message: "DayOff entry deleted" });
    return;
  } catch (error) {
    console.error("Error deleteDayOff:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAvailableSlots = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    const { date } = req.query; 
    if (!doctorId || !date) {
      res.status(400).json({ message: "doctorId and date are required" });
      return;
    }

    const isoDate = new Date(String(date));
    const startOfDay = new Date(isoDate);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(isoDate);
    endOfDay.setHours(23, 59, 59, 999);

    const dayOffEntry = await DayOff.findOne({
      doctorId,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });
    if (dayOffEntry) {
      res.status(200).json({ slots: [] });
      return;
    }

    const dayOfWeek = isoDate.getDay(); // 0..6
    const schedule = await Schedule.findOne({ doctorId, dayOfWeek });
    if (!schedule) {
      res.status(200).json({ slots: [] });
      return;
    }

    const { startHour, endHour, slotDuration } = schedule;
    const slots: string[] = [];
    let currentHour = startHour;
    while (currentHour < endHour) {
      const slotStart = new Date(isoDate);
      slotStart.setHours(currentHour, 0, 0, 0);
      slots.push(slotStart.toISOString());
      currentHour += slotDuration / 60; 
    }

    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    const busySlotsSet = new Set(
      appointments.map((appt) => {
        const d = new Date(appt.appointmentDate);
        d.setMinutes(0, 0, 0);
        return d.toISOString();
      })
    );

    const freeSlots = slots.filter((slot) => {
      const d = new Date(slot);
      d.setMinutes(0, 0, 0);
      return !busySlotsSet.has(d.toISOString());
    });

    res.status(200).json({ slots: freeSlots });
    return;
  } catch (error) {
    console.error("Error getAvailableSlots:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getDayOffList = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) {
      res.status(400).json({ message: "Doctor ID is required" });
      return;
    }

    const dayOffs = await DayOff.find({ doctorId });
    res.status(200).json({ dayOffs });
    return;
  } catch (error) {
    console.error("Error getDayOffList:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
