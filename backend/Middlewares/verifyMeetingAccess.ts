import { Request, Response, NextFunction } from "express";
import Appointment, { IAppointment } from "../models/Appointment";


export const verifyMeetingAccess = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const meetingId = req.params.meetingId || req.params.appointmentId;

    if (!meetingId) {
      res.status(400).json({ message: "meetingId not provided" });
      return;
    }

    const user = (req as any).user;
    if (!user) {
      res.status(401).json({ message: "User not authenticated" });
      return;
    }

    const appointment: IAppointment | null = await Appointment.findById(meetingId).lean();
    if (!appointment) {
      res.status(404).json({ message: "Meeting not found" });
      return;
    }

    const doctorIdStr = appointment.doctorId ? appointment.doctorId.toString() : null;
    const patientIdStr = appointment.patientId.toString();

    if (
      user._id.toString() !== doctorIdStr &&
      user._id.toString() !== patientIdStr
    ) {
      res.status(403).json({ message: "Access denied: you are not a participant in this meeting" });
      return;
    }

    next();
  } catch (error) {
    console.error("Error verifying meeting access:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export const checkMeetingAccess = async (
  meetingId: string,
  userId: string
): Promise<boolean> => {
  try {
    const appointment: IAppointment | null = await Appointment.findById(meetingId).lean();
    if (!appointment) {
      return false;
    }

    const doctorIdStr = appointment.doctorId ? appointment.doctorId.toString() : null;
    const patientIdStr = appointment.patientId.toString();

    return (
      userId === doctorIdStr || userId === patientIdStr
    );
  } catch (error) {
    console.error("Error in checkMeetingAccess:", error);
    return false;
  }
};