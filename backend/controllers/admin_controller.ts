import { Request, Response } from "express";
import userModel from "../models/Users";
import Appointment from "../models/Appointment";

export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userModel.find({}, "username email role phoneNumber dateOfBirth gender isAdmin");
    res.status(200).json({ users });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.params;
    const { role } = req.body;
    const { isAdmin } = req.body;

    const validRoles = ["patient", "doctor"];
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { role, isAdmin },
      { new: true, select: "username email role" }
    );
    if (!updatedUser) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.status(200).json({ message: "User role updated", user: updatedUser });
  } catch (error) {
    console.error("Error updating user role:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// ✅ 1. Sessions per Doctor
export const getSessionsPerDoctor = async (req: Request, res: Response) => {
  try {
    const data = await Appointment.aggregate([
      { $match: { doctorId: { $exists: true } } },
      {
        $group: {
          _id: "$doctorId",
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "doctor",
        },
      },
      { $unwind: "$doctor" },
      {
        $project: {
          doctor: "$doctor.username",
          count: 1,
        },
      },
    ]);
    res.status(200).json(data);
  } catch (err) {
    console.error("Error fetching sessions per doctor:", err);
    res.status(500).json({ error: "Server error" });
  }
};



// ✅ 2. Sessions per Month
export const getSessionsPerMonth = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth() - 11, 1);

    const result = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$appointmentDate" },
            month: { $month: "$appointmentDate" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.month": 1,
        },
      },
    ]);

    // Fill in missing months
    const fullYear = Array.from({ length: 12 }).map((_, i) => {
      const date = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
      const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      return {
        key,
        label: date.toLocaleDateString("en-US", { year: "numeric", month: "short" }),
        count: 0,
      };
    });

    result.forEach((entry) => {
      const key = `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}`;
      const match = fullYear.find((m) => m.key === key);
      if (match) match.count = entry.count;
    });

    res.json(
      fullYear.map(({ label, count }) => ({
        month: label,
        count,
      }))
    );
  } catch (err) {
    console.error("Failed to aggregate monthly session stats", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getSessionsPerWeek = async (req: Request, res: Response) => {
  try {
    const today = new Date();
    const start = new Date(today);
    start.setDate(start.getDate() - 7 * 5); // התחלה לפני 6 שבועות

    const result = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: start },
        },
      },
      {
        $group: {
          _id: {
            year: { $isoWeekYear: "$appointmentDate" },
            week: { $isoWeek: "$appointmentDate" },
          },
          count: { $sum: 1 },
        },
      },
      {
        $sort: {
          "_id.year": 1,
          "_id.week": 1,
        },
      },
    ]);

    const fullWeeks = Array.from({ length: 6 }).map((_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() - 7 * (5 - i)); // מציג את השבועות האחרונים (מהעתיד אל העבר)
      const weekLabel = `Week ${getWeekNumber(date)} (${date.toLocaleDateString("en-GB")})`;
      return {
        key: `${date.getFullYear()}-${getWeekNumber(date)}`,
        label: weekLabel,
        count: 0,
      };
    });

    result.forEach((entry) => {
      const key = `${entry._id.year}-${entry._id.week}`;
      const match = fullWeeks.find((w) => w.key === key);
      if (match) match.count = entry.count;
    });

    res.json(
      fullWeeks.map(({ label, count }) => ({
        week: label,
        count,
      }))
    );
  } catch (err) {
    console.error("Failed to aggregate weekly session stats", err);
    res.status(500).json({ message: "Server error" });
  }
};

function getWeekNumber(date: Date) {
  const temp = new Date(date.getTime());
  temp.setHours(0, 0, 0, 0);
  temp.setDate(temp.getDate() + 3 - ((temp.getDay() + 6) % 7));
  const week1 = new Date(temp.getFullYear(), 0, 4);
  return 1 + Math.round(((temp.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
}
