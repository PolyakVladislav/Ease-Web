import { User } from "./user";  
import { Post } from "./post";  

export interface IUserProfileResponse {
  user: User;
  posts: Post[];
  hasMorePosts: boolean;
}
