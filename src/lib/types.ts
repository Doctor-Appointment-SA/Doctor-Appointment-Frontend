// ใช้ร่วมกันทุกหน้า/ทุก route
export type PatientAppointment = {
  id: string;
  name: string;
  date: string; // "Dec 15, 2025"
  time: string; // "10:30 AM"
  profilePic?: string;
};

export type PatientDetails = {
  id: string;
  name: string;
  appointment: { date: string; time: string };
  profilePic?: string;
  citizenId?: string;
  gender?: string;
  age?: number;
  weight?: number; // kg
  height?: number; // cm
  phone?: string;
  allergies?: string[];
  conditions?: string[];
  address?: string;
  lastUpdated?: string; // ISO
  notes?: string;
};
