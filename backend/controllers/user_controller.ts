import { Request, Response } from "express";
import userModel from "../models/Users";
import postModel from "../models/Post";
import multer from "multer";

const SERVER_CONNECT = process.env.SERVER_CONNECT;


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); 
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`); 
  },
});

const upload = multer({ storage });

// פעולה להחזרת כל המשתמשים
export const getAllUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await userModel.find(); 
    res.json(users); 
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ message: "Error fetching users", error: errorMessage });
  }
};


export const getUserProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.query.userId as string;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 5;

    const user = await userModel.findById(userId).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found." });
      return;
    }

    const filter = { author: user.username };
    const skipCount = (page - 1) * limit;

    const totalPosts = await postModel.countDocuments(filter);
    const posts = await postModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skipCount)
      .limit(limit);

    const hasMorePosts = skipCount + posts.length < totalPosts;

    res.status(200).json({
      user,
      posts,
      hasMorePosts,
    });
  } catch (err) {
    res.status(500).json({ message: "Server Error." });
  }
};


export const updateUserProfile = async (req: Request, res: Response): Promise<void> => {
  const userId = req.query.userId as string;
  const { username, phoneNumber, dateOfBirth, gender } = req.body;

  const profilePicture = req.file ? `/uploads/${req.file.filename}` : undefined;

  try {
    if (!username) {
      res.status(400).json({ message: 'Username is required.' });
      return;
    }

    const existingUser = await userModel.findOne({ username, _id: { $ne: userId } });
    if (existingUser) {
      res.status(409).json({ message: 'Username is already taken.' });
      return;
    }

    const user = await userModel.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found.' });
      return;
    }

    user.username = username;
    user.phoneNumber = phoneNumber; 
    user.gender = gender;
    if (dateOfBirth) {
      user.dateOfBirth = new Date(dateOfBirth);
    }
    if (profilePicture) {
      user.profilePicture = `${SERVER_CONNECT}${profilePicture}`;
    }

    await user.save();

    // Если требуется, можно обновить авторство постов (при изменении username)
    // const updateResult = await postModel.updateMany(
    //   { author: user.username },
    //   { $set: { author: username } }
    // );

    res.status(200).json({ 
      message: 'User updated successfully', 
      user,
      // updatedPostsCount: updateResult.modifiedCount // если используется
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  const { userId, role } = req.body;
  
  if (!['patient', 'doctor', 'admin'].includes(role)) {
    res.status(400).json({ message: 'Invalid role specified' });
    return;
  }

  try {
    const user = await userModel.findByIdAndUpdate(
      userId,
      { role },
      { new: true }
    );

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.status(200).json({ message: 'User role updated successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Server error.' });
  }
};

export const searchPatients = async (req: Request, res: Response): Promise<void> => {
  try {
    const query = req.query.query as string;
    if (!query) {
      res.status(400).json({ message: "Query parameter is required" });
      return;
    }

    const patients = await userModel.find({
      role: "patient",
      $or: [
        { username: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } }
      ]
    }).select("username email profilePicture role");

    res.status(200).json({ patients });
  } catch (error) {
    console.error("Error searching patients:", error);
    res.status(500).json({ message: "Internal server error", error });
  }
};

export { upload };
