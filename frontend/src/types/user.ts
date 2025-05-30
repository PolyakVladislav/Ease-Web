export interface User {
  _id: string;
  username: string;
  email?: string;
  profilePicture?: string;
  role: string;
  phoneNumber?: string;
  dateOfBirth?: Date;     
  gender?: 'male' | 'female' | 'other';
  isAdmin: boolean;
}

export interface Patient {
  _id: string;
  fullName: string;
  lastSessionDate?: string;
  nextAppointment?: string;
  patientStatus?: string;
}
