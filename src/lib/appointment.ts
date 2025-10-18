import { DoctorProps } from "@/props/doctorInfo";
import axios from "axios";
import { start } from "repl";
const api = axios.create({ baseURL: "http://localhost:9000/api" });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token"); // หรือ state/ctx ของคุณ
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const patientCreateAppointment = async (
  selectedDoctor: DoctorProps | null,
  appointmentDate: string,
  selectedTime: string
) => {
  try {
    const res = await api.post("/appointment", {
      // patient_id,
      doctor_id: selectedDoctor?.id,
      appoint_date:
        appointmentDate +
        "T" +
        (Number(selectedTime.split(":")[0]) - 7).toString().padStart(2, "0") +
        ":00:00.000Z",
      status: "PENDING",
      detail: "",
    });
    // console.log("Response:", res.data);
  } catch (error) {
    console.log("Error on creating appointment:", error);
  }
};

export const getDoctorAppointments = async (status?: string) => {
  try {
    const res = await api.get(`/appointment/doctor/me?status=${status}`);
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log("Error on fetching doctor's appointments:", error);
  }
};

export const getPatientData = async (patient_id: string) => {
  try {
    const res = await api.get(`/users/${patient_id}`);
    return res.data;
  } catch (error) {
    console.log("Error on fetching patient data:", error);
  }
};

export const doctorCreateAppointment = async (
  patient_id: string,
  appoint_date: string,
  detail: string,
  time: string
) => {
  try {
    const res = await api.post("/appointment", {
      patient_id,
      appoint_date:
        appoint_date +
        "T" +
        (Number(time.split(":")[0]) - 7).toString().padStart(2, "0") +
        ":00:00.000Z",
      status: "CONFIRMED",
      detail,
    });
    console.log("Response:", res.data);
  } catch (error) {
    console.log("Error on creating appointment(doctor):", error);
  }
};

export const updateAppointmentDetail = async (
  appointment_id: string,
  detail: string
) => {
  try {
    const res = await api.patch(`/appointment/${appointment_id}`, {
      detail,
    });
    console.log("Update Response:", res.data);
  } catch (error) {
    console.log("Error on updating appointment detail:", error);
  }
};

export function getTodayThai() {
  const now = new Date();

  // แปลงจากเวลาปัจจุบันเป็นเวลาไทย (+7 ชั่วโมง)
  const utc = now.getTime() + now.getTimezoneOffset() * 60000; // แปลงเป็น UTC (ms)
  const thaiTime = new Date(utc + 7 * 60 * 60 * 1000); // เพิ่ม 7 ชม. → เวลาไทย
  // คืนค่าในรูปแบบ YYYY-MM-DD
  return thaiTime.toISOString().split("T")[0];
}

export const toTime = (v: string | Date) => {
  const d = v instanceof Date ? v : new Date(v);
  // console.log(d);
  const time = d.getHours();
  // console.log(time);
  return time;
};

// ดึงตารางนัดหมายของแพทย์ในวันที่ระบุ
export const getDoctorScheduleOnDate = async (
  doctor_id: string,
  date: string
) => {
  try {
    const res = await api.get(
      `appointment/doctor/${doctor_id}?status=CONFIRMED&date=${date}`
    );
    return res.data;
  } catch (error) {
    console.log("Error on fetching doctor's schedule:", error);
  }
};
