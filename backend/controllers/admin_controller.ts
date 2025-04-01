import { Request, Response } from "express";
import userModel from "../models/Users";

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