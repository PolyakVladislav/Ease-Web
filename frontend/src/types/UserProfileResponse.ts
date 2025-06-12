import { User } from "./user";  

export interface IUserProfileResponse {
  user: User;
  hasMorePosts: boolean;
}
