export interface User {
  _id: string;
  username: string;
  email?: string;
  profilePicture?: string;
  role: string;
  phoneNumber?: string;
  dateOfBirth?: Date;     
  gender?: 'male' | 'female' | 'other';
}
