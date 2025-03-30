import mongoose from "mongoose";

export interface IUser {
  username: string;
  email: string;
  password?: string;
  _id?: string;
  profilePicture: string;
  posts: mongoose.Types.ObjectId[];
  refreshToken?: string[];
  likedPosts?: mongoose.Schema.Types.ObjectId[];
  googleId?: string;
  role?: string;
  phoneNumber?: string;  
  dateOfBirth?: Date;         
  gender?: 'male' | 'female' | 'other'; 
}

const userSchema = new mongoose.Schema<IUser>({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  profilePicture: {
    type: String,
    default: '',
  },
  posts: [{
    type: mongoose.Types.ObjectId,
    ref: 'Post'
  }],
  refreshToken: {
    type: [String],
    default: [],
  },
  likedPosts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Post",
  }],
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'admin'],
    default: 'patient',
  },
  phoneNumber: {
    type: String,
    required: false,
  },
  dateOfBirth: {
    type: Date,
    required: false,
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other'],
    required: false,
  },
});

const userModel = mongoose.model<IUser>("Users", userSchema);

export default userModel;
