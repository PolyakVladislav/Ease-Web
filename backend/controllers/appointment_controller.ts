import "../models/Users";
import { Request, Response } from "express";
import Appointment from "../models/Appointment";
import User from "../models/Users";
import mongoose from "mongoose"; 
import Diary, { IDiary } from "../models/Diary";
import Notification from "../models/Notification";




// export const createAppointment = async (req: Request, res: Response): Promise<void> => {
//   try {
//     const {
//       patientId,
//       doctorId,
//       appointmentDate,
//       notes,
//       isEmergency,
//       initiator,
//     } = req.body;


//     if (!patientId || !appointmentDate || !initiator) {
//       res.status(400).json({ message: "Missing required fields (patientId, appointmentDate, initiator)" });
//       return;
//     }
//     let diaries: IDiary[] = [];
//     const status = initiator === "patient" ? "confirmed" : "pending";
//     const lastAppointment = await Appointment.findOne({ doctorId, status: "passed" })
//       .sort({ appointmentDate: -1 });
//     if (lastAppointment) {
//         diaries= await Diary.find({
//         authorId: patientId,
//         createdAt: { $gte: lastAppointment.appointmentDate }
//       })
//       .sort({ createdAt: -1 })
//       .limit(10);
//     }
//     else{
//       diaries= await Diary.find({
//         authorId: patientId,
//       })
//       .sort({ createdAt: -1 })
//       .limit(10);


//     if (!isEmergency && !doctorId) {
//       res.status(400).json({ message: "doctorId is required for non-emergency appointment" });
//       return;
//     }

//     let status: "pending" | "confirmed" | "canceled" | "passed" = "pending";
//     if (isEmergency) {
//       status = "pending";
//     } else {
//       status = initiator === "patient" ? "confirmed" : "pending";
//     }


//     }
//     const nlpReviews = diaries.map((diary) => diary.nlpSummary);
//     const appointment = await Appointment.create({
//       patientId,
//       doctorId: doctorId || null,
//       appointmentDate: new Date(appointmentDate),
//       notes: nlpReviews,
//       isEmergency: !!isEmergency,
//       initiator,
//       status,
//     });

//     const populatedAppointment = await Appointment.findById(appointment._id)
//       .populate({ path: "patientId", model: "Users", select: "username" })
//       .exec();

//     if (!populatedAppointment) {
//       res.status(404).json({ message: "Appointment not found after creation" });
//       return;
//     }

//     const appointmentResponse = {
//       _id: populatedAppointment._id,
//       patientId: populatedAppointment.patientId,
//       patientName:
//         populatedAppointment.patientId &&
//         (populatedAppointment.patientId as any).username
//           ? (populatedAppointment.patientId as any).username
//           : "Unknown",
//       doctorId: populatedAppointment.doctorId, 
//       appointmentDate: populatedAppointment.appointmentDate,
//       status: populatedAppointment.status,
//       notes: nlpReviews,
//       isEmergency: populatedAppointment.isEmergency,
//       createdAt: populatedAppointment.createdAt,
//       updatedAt: populatedAppointment.updatedAt,
//     };

//     res.status(201).json({
//       message: "Appointment created successfully",
//       appointment: appointmentResponse,
//     });
//   } catch (error) {
//     console.error("Error creating appointment:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };

export const createAppointment = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      patientId,
      doctorId,
      appointmentDate,
      notes,
      isEmergency,
      initiator,
    } = req.body;

    if (!patientId || !appointmentDate || !initiator) {
      res.status(400).json({ message: "Missing required fields (patientId, appointmentDate, initiator)" });
      return;
    }

    let status: "pending" | "confirmed" | "canceled" | "passed" = "pending";
    let diaries: IDiary[] = [];

    status = initiator === "patient" ? "confirmed" : "pending";

    const lastAppointment = await Appointment.findOne({ doctorId, status: "passed" })
      .sort({ appointmentDate: -1 });

    if (lastAppointment) {
      // If you want to filter diaries after a specific date:
      const adjustedDate = new Date(lastAppointment.appointmentDate.getTime() - 3 * 60 * 60 * 1000); // 3 hours earlier
      diaries = await Diary.find({
        authorId: patientId,
        createdAt: { $gte: adjustedDate }
      })
        .sort({ createdAt: -1 })
        .limit(10);
    } else {
      diaries = await Diary.find({ authorId: patientId })
        .sort({ createdAt: -1 })
        .limit(10);
    }

    if (!isEmergency && !doctorId) {
      res.status(400).json({ message: "doctorId is required for non-emergency appointment" });
      return;
    }

    if (isEmergency) {
      status = "pending";
    } else {
      status = initiator === "patient" ? "confirmed" : "pending";
    }

    const nlpReviews = diaries.map((diary) => diary.nlpSummary);

    const appointment = await Appointment.create({
      patientId,
      doctorId: doctorId || null,
      appointmentDate: new Date(appointmentDate),
      notes: nlpReviews,
      isEmergency: !!isEmergency,
      initiator,
      status,
    });

    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate({ path: "patientId", model: "Users", select: "username" })
      .exec();

    if (!populatedAppointment) {
      res.status(404).json({ message: "Appointment not found after creation" });
      return;
    }

    // 🔔 Notification logic
    try {
      const creatorRole = initiator === "patient" ? "Patient" : "Doctor";
      const appointmentDateStr = new Date(appointmentDate).toLocaleString();
      const patientUsername = (populatedAppointment.patientId as any).username || "Unknown";
      const message = `A new appointment with ${patientUsername} is set to be on ${appointmentDateStr} and was created by the ${creatorRole}.`;

      await Notification.create([
        {
          userId: patientId,
          message,
          appointmentId: appointment._id,
        },
        {
          userId: doctorId,
          message,
          appointmentId: appointment._id,
        },
      ]);
    } catch (notifyErr) {
      console.error("Failed to create notifications:", notifyErr);
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
      notes: nlpReviews,
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





// export const updateAppointment = async (
//   req: Request,
//   res: Response
// ): Promise<void> => {
//   try {
//     const { appointmentId } = req.params;
//     const { status, appointmentDate, notes, isEmergency } = req.body;

//     if (!appointmentId) {
//       res.status(400).json({ message: "Appointment ID is required" });
//       return;
//     }

//     const appointment = await Appointment.findById(appointmentId);
//     if (!appointment) {
//       res.status(404).json({ message: "Appointment not found" });
//       return;
//     }


//     if (appointment.initiator === "doctor" && status === "confirmed") {
//       res.status(403).json({ message: "Doctor cannot set status to confirmed in this flow" });
//       return;
//     }
//     const updateData: any = {};
//     if (status) {
//       const validStatuses = ["pending", "confirmed", "canceled", "passed"];
//       if (!validStatuses.includes(status)) {
//         res.status(400).json({ message: "Invalid status value" });
//         return;
//       }
//       updateData.status = status;
//     }
//     if (appointmentDate) {
//       updateData.appointmentDate = new Date(appointmentDate);
//     }
//     if (notes !== undefined) {
//       updateData.notes = notes;
//     }
//     if (isEmergency !== undefined) {
//       updateData.isEmergency = isEmergency;
//     }

//     const updatedAppointment = await Appointment.findByIdAndUpdate(
//       appointmentId,
//       updateData,
//       { new: true }
//     ).populate({ path: "patientId", model: "Users", select: "username" });

//     if (!updatedAppointment) {
//       res.status(404).json({ message: "Appointment not found after update" });
//       return;
//     }

//     const appointmentResponse = {
//       _id: updatedAppointment._id,
//       patientId: updatedAppointment.patientId,
//       patientName:
//         updatedAppointment.patientId &&
//         (updatedAppointment.patientId as any).username
//           ? (updatedAppointment.patientId as any).username
//           : "Unknown",
//       doctorId: updatedAppointment.doctorId,
//       appointmentDate: updatedAppointment.appointmentDate,
//       status: updatedAppointment.status,
//       notes: updatedAppointment.notes,
//       isEmergency: updatedAppointment.isEmergency,
//       createdAt: updatedAppointment.createdAt,
//       updatedAt: updatedAppointment.updatedAt,
//     };

//     res.status(200).json({
//       message: "Appointment updated successfully",
//       appointment: appointmentResponse,
//     });
//   } catch (error) {
//     console.error("Error updating appointment:", error);
//     res.status(500).json({ message: "Internal server error" });
//   }
// };


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
      res.status(403).json({ message: "Doctor cannot set status to confirmed in this flow" });
      return;
    }

    // if (appointment.initiator === "doctor" && status === "confirmed") {
    //   res.status(403).json({ message: "Doctor cannot set status to confirmed in this flow" });
    //   return;
    // }
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
    ).populate({ path: "patientId", model: "Users", select: "username" });

    if (!updatedAppointment) {
      res.status(404).json({ message: "Appointment not found after update" });
      return;
    }

    // 🔔 Notification Logic
    try {
      const patientUsername = (updatedAppointment.patientId as any)?.username || "Unknown";
      const formattedDate = updatedAppointment.appointmentDate.toLocaleString();

      const message = `Appointment with ${patientUsername} on ${formattedDate} was updated.`;

      await Notification.create([
        {
          userId: updatedAppointment.patientId,
          message,
          appointmentId: updatedAppointment._id,
        },
        {
          userId: updatedAppointment.doctorId,
          message,
          appointmentId: updatedAppointment._id,
        },
      ]);
    } catch (notifyErr) {
      console.error("Failed to create update notifications:", notifyErr);
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

    const appointments = await Appointment.find({
      doctorId: doctorId,
      appointmentDate: { $gte: thirtyDaysAgo },
    }).select("patientId");

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

export const getTherapistPatientSessions = async (
  req: Request,
  res: Response
) => {
  try {

    const sessions = await Appointment.aggregate([
      {
        $match: {
          status: { $in: ["completed", "passed"] },
        },
      },
      {
        $group: {
          _id: {
            therapist: "$doctorId",
            patient: "$patientId",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.therapist",
          patients: {
            $push: {
              patient: "$_id.patient",
              sessionCount: "$count",
            },
          },
        },
      },
    ]);


    const populated = await Promise.all(
      sessions.map(async (t) => {
        const therapistUser = mongoose.Types.ObjectId.isValid(t._id)
          ? await User.findById(t._id)
          : null;

        const patients = await Promise.all(
          t.patients.map(async (p: { patient: string; sessionCount: number }) => {
            const patientUser = mongoose.Types.ObjectId.isValid(p.patient)
              ? await User.findById(p.patient)
              : null;
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
    console.error("Failed to fetch therapist-patient sessions", err);
    res.status(500).json({ message: "Internal server error", error: err });
  }
};


export const getSessionsByPatientId = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { patientId } = req.params;
    const { doctorId } = req.query; 

    const patient = await User.findById(patientId).select("username");
    if (!patient) {
      res.status(404).json({ error: "Patient not found" });
      return;
    }

    const filter: any = { patientId };
    if (doctorId) {
      filter.doctorId = doctorId;
    }

    const sessions = await Appointment.find(filter).sort({
      appointmentDate: -1,
    });

    res.json({
      patientName: patient.username,
      sessions,
    });
  } catch (err) {
    console.error("Error fetching patient sessions:", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const deleteAppointment = async (
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

    if (appointment) {
  const message = `Appointment on ${appointment.appointmentDate.toLocaleString()} has been canceled.`;
  await Notification.create([
    {
      userId: appointment.patientId,
      message,
      appointmentId: appointment._id,
    },
    {
      userId: appointment.doctorId,
      message,
      appointmentId: appointment._id,
    },
  ]);
}


    await Appointment.findByIdAndDelete(appointmentId);

    res.status(200).json({ message: "Appointment deleted successfully" });
  } catch (error) {
    console.error("Error deleting appointment:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const claimUrgentAppointment = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { appointmentId } = req.params;
    const doctorId = (req as any).user._id;

    if (!appointmentId) {
      res.status(400).json({ message: "Appointment ID is required" });
      return;
    }

    const updatedAppointment = await Appointment.findOneAndUpdate(
      {
        _id: appointmentId,
        isEmergency: true,
        doctorId: null,
      },
      {
        $set: {
          doctorId,
          status: "confirmed",
          appointmentDate: new Date(),
        },
      },
      { new: true } 
    );

    if (!updatedAppointment) {
      res.status(409).json({ message: "Appointment already claimed or not found" });
      return;
    }

    res.status(200).json({
      message: "Appointment claimed successfully",
      appointment: updatedAppointment,
    });
  } catch (err) {
    console.error("Error claiming urgent appointment:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getUnassignedUrgentAppointments = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const { status } = req.query;

    const filter: any = {
      isEmergency: true,
      doctorId: null,
    };

    if (status) {
      filter.status = status;
    }

    const appointments = await Appointment.find(filter)
    .populate({ path: "patientId", model: "Users", select: "username email" })
    .sort({ createdAt: 1 }); 

    res.status(200).json({ appointments });
  } catch (error) {
    console.error("Error fetching unassigned urgent appointments:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};