import { Request, Response } from "express";
import Appointment from "../models/Appointment";

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { patientId, doctorId, appointmentDate, notes, isEmergency } = req.body;
    if (!patientId || !doctorId || !appointmentDate) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      notes: notes || "",
      isEmergency: isEmergency || false,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("patientId", "username")
      .exec();

    if (!populatedAppointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    const appointmentResponse = {
      _id: populatedAppointment._id,
      patientId: populatedAppointment.patientId,
      patientName:
        populatedAppointment.patientId && (populatedAppointment.patientId as any).username
          ? (populatedAppointment.patientId as any).username
          : "Unknown",
      doctorId: populatedAppointment.doctorId,
      appointmentDate: populatedAppointment.appointmentDate,
      status: populatedAppointment.status,
      notes: populatedAppointment.notes,
      isEmergency: populatedAppointment.isEmergency,
      createdAt: populatedAppointment.createdAt,
      updatedAt: populatedAppointment.updatedAt,
    };

    res.status(201).json({
      message: "Appointment created successfully",
      appointment: appointmentResponse,
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAppointmentsByDoctor = async (req: Request, res: Response): Promise<void> => {
  try {
    const doctorId = (req as any).user._id;
    if (!doctorId) {
      res.status(400).json({ message: "Doctor ID is required" });
      return;
    }

    const { status, isEmergency } = req.query;
    const filter: any = { doctorId };

    if (status) {
      filter.status = status;
    }
    if (isEmergency !== undefined) {
      filter.isEmergency = isEmergency === "true";
    }

    const rawAppointments = await Appointment.find(filter)
      .populate("patientId", "username")
      .sort({ isEmergency: -1, appointmentDate: 1 });

    const appointments = rawAppointments.map((apt) => ({
      _id: apt._id,
      patientId: apt.patientId,
      patientName: apt.patientId && (apt.patientId as any).username ? (apt.patientId as any).username : "Unknown",
      doctorId: apt.doctorId,
      appointmentDate: apt.appointmentDate,
      status: apt.status,
      notes: apt.notes,
      isEmergency: apt.isEmergency,
      createdAt: apt.createdAt,
      updatedAt: apt.updatedAt,
    }));

    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const { status, appointmentDate, notes, isEmergency } = req.body;

    if (!appointmentId) {
      res.status(400).json({ message: "Appointment ID is required" });
      return;
    }

    const updateData: any = {};
    if (status) {
      const validStatuses = ["pending", "confirmed", "canceled", "completed"];
      if (!validStatuses.includes(status)) {
        res.status(400).json({ message: "Invalid status value" });
        return;
      }
      updateData.status = status;
    }
    if (appointmentDate) {
      updateData.appointmentDate = new Date(appointmentDate);
    }
    if (notes !== undefined) {
      updateData.notes = notes;
    }
    if (isEmergency !== undefined) {
      updateData.isEmergency = isEmergency;
    }

    const updatedAppointment = await Appointment.findByIdAndUpdate(
      appointmentId,
      updateData,
      { new: true }
    ).populate("patientId", "username");

    if (!updatedAppointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    const appointmentResponse = {
      _id: updatedAppointment._id,
      patientId: updatedAppointment.patientId,
      patientName: updatedAppointment.patientId && (updatedAppointment.patientId as any).username 
                      ? (updatedAppointment.patientId as any).username 
                      : "Unknown",
      doctorId: updatedAppointment.doctorId,
      appointmentDate: updatedAppointment.appointmentDate,
      status: updatedAppointment.status,
      notes: updatedAppointment.notes,
      isEmergency: updatedAppointment.isEmergency,
      createdAt: updatedAppointment.createdAt,
      updatedAt: updatedAppointment.updatedAt,
    };

    res.status(200).json({
      message: "Appointment updated successfully",
      appointment: appointmentResponse,
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAppointmentDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    if (!appointmentId) {
      res.status(400).json({ message: "Appointment ID is required" });
      return;
    }
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }
    res.status(200).json({ appointment });
  } catch (error) {
    console.error("Error fetching appointment details:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};


