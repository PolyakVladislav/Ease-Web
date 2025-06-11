import { Request, Response } from "express";
import userModel from "../models/Users";
import postModel from "../models/Post";
import multer from "multer";
import Appointment from "../models/Appointment";
import { ConsultationSummary } from "../models/ConsultationSummary";
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
const SERVER_CONNECT = process.env.SERVER_CONNECT;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `profile_${uuidv4()}${ext}`;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// פעולה להחזרת כל המשתמשים
export const getAllUsers = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const users = await userModel.find();
    res.json(users);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res
      .status(500)
      .json({ message: "Error fetching users", error: errorMessage });
  }
};

export const getUserProfile = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const userId = req.query.userId as string;
    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }
    res.status(200).json({
      user
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error." });
  }
};

export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.query.userId as string;
  const { username, phoneNumber, dateOfBirth, gender } = req.body;

  try {
    if (!username) {
      res.status(400).json({ message: "Username is required." });
      return;
    }

    const existingUser = await userModel.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      res.status(409).json({ message: "Username is already taken." });
      return;
    }

    const user = await userModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    // ✅ התחלת שינוי תמונה - שימוש חד-פעמי ב-UUID
    if (req.file) {
  const uploadedFileName = req.file.filename; // 💥 השם שנקבע ע"י multer
  const newRelativePath = `/uploads/${uploadedFileName}`;

  // מחיקת קובץ קודם אם קיים
  if (user.profilePicture && SERVER_CONNECT) {
    const relativePath = user.profilePicture.replace(SERVER_CONNECT, '');
    const oldPath = path.join(__dirname, '..', relativePath);
    if (fs.existsSync(oldPath)) {
      fs.unlinkSync(oldPath);
    }
  }

  // ❌ אין fs.renameSync. הקובץ כבר נכון

  if (SERVER_CONNECT) {
    user.profilePicture = `${SERVER_CONNECT}${newRelativePath}`;
  }
}

    // ✅ עדכון שדות נוספים
    user.username = username;
    user.phoneNumber = phoneNumber;
    user.gender = gender;
    if (dateOfBirth) {
      user.dateOfBirth = new Date(dateOfBirth);
    }

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({ message: "Server error.", error });
  }
};


export const updateUserRole = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { userId, role } = req.body;

  if (!["patient", "doctor"].includes(role)) {
    res.status(400).json({ message: "Invalid role specified" });
    return;
  }

  try {
    const user = await userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    res.status(200).json({ message: "User role updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: "Server error." });
  }
};

export const searchPatients = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    const query = req.query.query as string;
    if (!query) {
      res.status(400).json({ message: "Query parameter is required" });
      return;
    }

    const patients = await userModel
      .find({
        role: "patient",
        $or: [
          { username: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      })
      .select("username email profilePicture role");

    res.status(200).json({ patients });
  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};



export const getPatientsWithSessions = async (req: Request, res: Response) => {
  try {
    const doctorId = req.params.doctorId;

    const appointments = await Appointment.find({ doctorId })
      .populate("patientId", "username") // ensures we get patient.username
      .lean();

    const summaries = await ConsultationSummary.find({ doctorId }).lean();

    const summaryMap = new Map<string, string>();
    summaries.forEach((sum) => {
      summaryMap.set(sum.appointmentId.toString(), sum.summary);
    });

    const grouped = new Map<string, { patient: any; sessions: any[] }>();

    appointments.forEach((apt) => {
      const patient = apt.patientId as any; // ✅ Safe cast (already populated)
      const patientId = patient._id.toString();

      if (!grouped.has(patientId)) {
        grouped.set(patientId, {
          patient: {
            _id: patientId,
            username: patient.username,
          },
          sessions: [],
        });
      }

      grouped.get(patientId)!.sessions.push({
        appointmentId: apt._id,
        appointmentDate: apt.appointmentDate,
        status: apt.status,
        summary: summaryMap.get(apt._id.toString()) || null,
      });
    });

    res.json(Array.from(grouped.values()));
  } catch (err) {
    console.error("Error in getPatientsWithSessions:", err);
    res.status(500).json({ message: "Internal server error" });
  }
};





export { upload };


