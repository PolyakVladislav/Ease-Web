import mongoose from "mongoose";

export interface Post {
  isLiked: boolean;
  _id: string;
  title: string;
  content: string;
  author: string;
  createdAt: Date;
  comments?: mongoose.Schema.Types.ObjectId[];
  image?: string;
  likesCount?: number;
}
