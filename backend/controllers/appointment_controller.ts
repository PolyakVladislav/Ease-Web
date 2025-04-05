import "../models/Users";
import { Request, Response } from "express";
import Appointment from "../models/Appointment";
import User from "../models/Users";
import mongoose from "mongoose"; 


export const createAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const {
      patientId,
      doctorId,
      appointmentDate,
      notes,
      isEmergency,
      initiator,
    } = req.body;
    if (!patientId || !doctorId ||  !appointmentDate || !initiator) {
      res.status(400).json({ message: "Missing required fields" });
      return;
    }

    const status = initiator === "patient" ? "confirmed" : "pending";

    const appointment = await Appointment.create({
      patientId,
      doctorId,
      appointmentDate: new Date(appointmentDate),
      notes: notes || "",
      isEmergency: isEmergency || false,
      initiator,
      status,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({ path: "patientId", model: "Users", select: "username" })
      .exec();

    if (!populatedAppointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    const appointmentResponse = {
      _id: populatedAppointment._id,
      patientId: populatedAppointment.patientId,
      patientName:
        populatedAppointment.patientId &&
        (populatedAppointment.patientId as any).username
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

export const updateAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const { status, appointmentDate, notes, isEmergency } = req.body;

    if (!appointmentId) {
      res.status(400).json({ message: "Appointment ID is required" });
      return;
    }

    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    if (appointment.initiator === "doctor" && status === "confirmed") {
      res
        .status(403)
        .json({ message: "Doctor cannot change status to confirmed" });
      return;
    }

    const updateData: any = {};
    if (status) {
      const validStatuses = ["pending", "confirmed", "canceled", "passed"];
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
    ).populate({ path: "patientId", model: "Users", select: "username" })

    if (!updatedAppointment) {
      res.status(404).json({ message: "Appointment not found" });
      return;
    }

    const appointmentResponse = {
      _id: updatedAppointment._id,
      patientId: updatedAppointment.patientId,
      patientName:
        updatedAppointment.patientId &&
        (updatedAppointment.patientId as any).username
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

export const getAppointmentsByDoctor = async (
  req: Request,
  res: Response
): Promise<void> => {
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

    const appointments = await Appointment.find(filter)
    .populate({ path: "patientId", model: "Users", select: "username" })
    .sort({ isEmergency: -1, appointmentDate: 1 });

    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAppointmentDetails = async (
  req: Request,
  res: Response
): Promise<void> => {
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

export const getRecentPatients = async (req: Request, res: Response) => {
  const doctorId = req.params.doctorId;

  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 🛠 FIXED: use "appointmentDate" instead of "date"
    const appointments = await Appointment.find({
      doctorId: doctorId,
      appointmentDate: { $gte: thirtyDaysAgo },
    }).select("patientId");

    // 🔁 Remove duplicates
    const patientIds = Array.from(
      new Set(appointments.map((appt) => appt.patientId.toString()))
    );

    const recentPatients = await User.find({
      _id: { $in: patientIds },
    }).select("_id username email");

    res.status(200).json({ patients: recentPatients });
  } catch (error) {
    console.error("Failed to fetch recent patients:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};




export const getTherapistPatientSessions = async (req: Request, res: Response) => {
  try {
    console.log("Fetching therapist sessions...");

    const sessions = await Appointment.aggregate([
      {
        $match: {
          status: { $in: ["completed", "passed"] }
        }
      },
      {
        $group: {
          _id: {
            therapist: "$doctorId",
            patient: "$patientId"
          },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: "$_id.therapist",
          patients: {
            $push: {
              patient: "$_id.patient",
              sessionCount: "$count"
            }
          }
        }
      }
    ]);

    console.log("Aggregated sessions:", sessions);

    const populated = await Promise.all(
      sessions.map(async (t) => {
        const therapistUser = mongoose.Types.ObjectId.isValid(t._id)
        ? await User.findById(t._id)
        : null;
        console.log("Therapist:", therapistUser?.username);

        const patients = await Promise.all(
          t.patients.map(async (p: { patient: string; sessionCount: number }) => {
            const patientUser = mongoose.Types.ObjectId.isValid(p.patient)
            ? await User.findById(p.patient)
            : null;
            console.log(`  - Patient: ${patientUser?.username || "Unknown"} (${p.sessionCount})`);
            return {
              name: patientUser?.username || "Unknown",
              count: p.sessionCount,
            };
          })
        );

        return {
          therapist: therapistUser?.username || "Unknown Therapist",
          patients,
        };
      })
    );

    res.status(200).json({ data: populated });
  } catch (err) {
    console.error("🔥 Failed to fetch therapist-patient sessions", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
};


