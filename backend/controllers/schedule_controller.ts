import { Request, Response } from "express";
import Schedule, { ISchedule } from "../models/Schedule";
import DayOff from "../models/DayOff"; 
import Appointment from "../models/Appointment";



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

export const getClosestAppointmentByDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const { doctorId } = req.params;
    if (!doctorId) {
      res.status(400).json({ message: "Doctor ID is required" });
      return;
    }

    const schedules = (await Schedule.find({ doctorId })) as ISchedule[];
    if (!schedules || schedules.length === 0) {
      res.status(404).json({ message: "No schedule found for this doctor" });
      return;
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const endDate = new Date(tomorrow);
    endDate.setDate(tomorrow.getDate() + 7);

    const dayOffs = await DayOff.find({
      doctorId,
      date: { $gte: tomorrow, $lte: endDate },
    });

    const appointments = await Appointment.find({
      doctorId,
      appointmentDate: { $gte: tomorrow, $lte: endDate },
    });

    let closestDate: Date | null = null;

    for (let i = 0; i < 7; i++) {
      const candidateDate = new Date(tomorrow);
      candidateDate.setDate(tomorrow.getDate() + i);
      candidateDate.setHours(0, 0, 0, 0);

      const dayOfWeek = candidateDate.getDay();
      const schedule = schedules.find((sch) => sch.dayOfWeek === dayOfWeek);
      if (!schedule) continue;

      const isDayOff = dayOffs.some((d) => {
        const dDate = new Date(d.date);
        dDate.setHours(0, 0, 0, 0);
        return dDate.getTime() === candidateDate.getTime();
      });
      if (isDayOff) continue;

      const { startHour, endHour, slotDuration } = schedule;
      const slots: string[] = [];
      const startTotalMin = startHour * 60;
      const endTotalMin = endHour * 60;
      let currentMin = startTotalMin;
      while (currentMin + slotDuration <= endTotalMin) {
        const slotStart = new Date(candidateDate);
        slotStart.setHours(0, currentMin, 0, 0);
        slots.push(slotStart.toISOString());
        currentMin += slotDuration;
      }

      const appointmentsForDay = appointments.filter((appt) => {
        const apptDate = new Date(appt.appointmentDate);
        apptDate.setHours(0, 0, 0, 0);
        return apptDate.getTime() === candidateDate.getTime();
      });
      const busySlotsSet = new Set(
        appointmentsForDay.map((appt) => {
          const d = new Date(appt.appointmentDate);
          d.setSeconds(0, 0);
          return d.toISOString();
        })
      );

      const freeSlots = slots.filter((slot) => !busySlotsSet.has(slot));

      if (freeSlots.length > 0) {
        closestDate = candidateDate;
        break;
      }
    }

    if (!closestDate) {
      res.status(404).json({ message: "No available appointment found in the next week" });
      return;
    }

    res.status(200).json({ closestAppointmentDate: closestDate });
  } catch (error) {
    console.error("Error getClosestAppointmentByDoctor:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


