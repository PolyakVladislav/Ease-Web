import { Request, Response, NextFunction } from "express";
import Appointment, { IAppointment } from "../models/Appointment";

/**
 * Middleware to verify user access to a meeting.
 * Expects meetingId in req.params and user in req.user.
 */
export const verifyMeetingAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const meetingId = req.params.meetingId;
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

    if (
      user._id.toString() !== appointment.doctorId.toString() &&
      user._id.toString() !== appointment.patientId.toString()
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

/**
 * Utility function for verifying access, used in socketService.
 * @param meetingId - Meeting ID.
 * @param userId - User ID.
 * @returns Promise<boolean> indicating access.
 */
export const checkMeetingAccess = async (meetingId: string, userId: string): Promise<boolean> => {
  try {
    const appointment: IAppointment | null = await Appointment.findById(meetingId).lean();
    if (!appointment) {
      return false;
    }
    return userId === appointment.doctorId.toString() || userId === appointment.patientId.toString();
  } catch (error) {
    console.error("Error in checkMeetingAccess:", error);
    return false;
  }
};
