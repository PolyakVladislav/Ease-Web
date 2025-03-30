import { ObjectId } from "mongoose";


export interface Comment {
  _id: ObjectId; 
  postId: ObjectId; 
  content: string; 
  author: string; 
  createdAt?: Date; 
}
