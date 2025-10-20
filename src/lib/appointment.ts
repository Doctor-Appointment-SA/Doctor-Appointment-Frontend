import { DoctorProps } from "@/props/doctorInfo";
import axios from "axios";
import { getCookie } from "./authentication";
import { Dispatch, SetStateAction } from "react";
import { DoctorInputProps } from "@/props/DoctorProps";
const api = axios.create({ baseURL: "http://localhost:9000/api/appt" });
// export const api = axios.create({ baseURL: "http://localhost:4002/api" });

api.interceptors.request.use((config) => {
  const token = getCookie("access_token"); // หรือ state/ctx ของคุณ
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const patientCreateAppointment = async (
  selectedDoctor: DoctorProps | null,
  appointmentDate: string,
  selectedTime: string
) => {
  try {
    const payload = {
      // patient_id,
      doctor_id: selectedDoctor?.id,
      appoint_date:
        appointmentDate +
        "T" +
        (Number(selectedTime.split(":")[0]) - 7).toString().padStart(2, "0") +
        ":00:00.000Z",
      status: "PENDING",
      detail: "",
    };
    const access_token = getCookie("access_token");
    const res = await api.post("", payload, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });
    // console.log("Response:", res.data);
  } catch (error) {
    console.log("Error on creating appointment:", error);
  }
};

export const getDoctorAppointments = async (status?: string) => {
  try {
    const res = await api.get(`/doctor/me?status=${status}`);
    console.log(res.data);
    return res.data;
  } catch (error) {
    console.log("Error on fetching doctor's appointments:", error);
  }
};

export const getPatientData = async (patient_id: string) => {
  try {
    const res = await axios.get(
      `http://localhost:9000/api/users/${patient_id}`
    );
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
    const payload = {
      patient_id,
      appoint_date:
        appoint_date +
        "T" +
        (Number(time.split(":")[0]) - 7).toString().padStart(2, "0") +
        ":00:00.000Z",
      status: "CONFIRMED",
      detail,
    };
    const access_token = getCookie("access_token");
    console.log("acces_tokenffff", access_token);
    const res = await api.post("", payload, {
      headers: {
        Authorization: `Bearer ${access_token}`,
        "Content-Type": "application/json",
      },
    });
    // const res = await axios.post("http://localhost:4001/api/appointment", payload, {
    //   headers: {
    //     Authorization: `Bearer ${access_token}`,
    //     "Content-Type": "application/json",
    //   },
    // });
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
    const res = await api.patch(`/${appointment_id}/detail`, {
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
  const utc = now.getTime() - now.getTimezoneOffset() * 60000; // แปลงเป็น UTC (ms)
  const thaiTime = new Date(utc);
  // คืนค่าในรูปแบบ YYYY-MM-DD
  // console.log(thaiTime.toISOString())
  return thaiTime.toISOString().split("T")[0];
}

export const toTime = (v: string | Date) => {
  const d = v instanceof Date ? v : new Date(v);
  // console.log(d);
  const time = d.getHours();
  // console.log(time);
  return time;
};

export const isPast = (time: string, date: string) => {
  const now = new Date();

  // แปลง date string เป็น Date object (YYYY-MM-DD)
  const [y, m, d] = date.split("-").map(Number);
  const targetDate = new Date(y, m - 1, d);

  // ถ้าวันที่ไม่ตรงกับวันนี้ → ยังไม่ผ่าน
  if (
    targetDate.getFullYear() !== now.getFullYear() ||
    targetDate.getMonth() !== now.getMonth() ||
    targetDate.getDate() !== now.getDate()
  ) {
    return false;
  }

  // เช็คเวลาในวันเดียวกัน
  const appointHour = Number(time.split(":")[0]);
  const currentHour = now.getHours();

  return appointHour < currentHour;
};

// ดึงตารางนัดหมายของแพทย์ในวันที่ระบุ
export const getDoctorScheduleOnDate = async (
  doctor_id: string,
  date: string
) => {
  try {
    const res = await api.get(
      `/doctor/${doctor_id}?status=CONFIRMED&date=${date}`
    );
    return res.data;
  } catch (error) {
    console.log("Error on fetching doctor's schedule:", error);
  }
};

export const fetchDoctor = async (
  setDoctorList: Dispatch<SetStateAction<DoctorInputProps[]>>
) => {
  try {
    const token = getCookie("access_token");
    console.log("token", token);
    const res = await api.get("/doctor", {
      headers: {
        Authorization: `Bearer ${token}`, // ถ้าใช้ JWT ใน localStorage
      },
    });
    setDoctorList(res.data);
  } catch (error) {
    console.log("Error on fetching Doctor:", error);
  }
};
