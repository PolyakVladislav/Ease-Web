// src/types/schedule.ts
export interface Schedule {
    _id: string;
    doctorId: string;
    dayOfWeek: number;     
    startHour: number;      
    endHour: number;         
    slotDuration: number;    
    createdAt?: string;
    updatedAt?: string;
  }
  
  export interface DayOff {
    _id: string;
    doctorId: string;
    date: string;      
    reason?: string;
    createdAt?: string;
    updatedAt?: string;
  }
  