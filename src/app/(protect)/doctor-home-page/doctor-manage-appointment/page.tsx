"use client";
import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
import {
  getDoctorAppointments,
  getTodayThai,
  toTime,
  updateAppointmentStatus,
} from "@/lib/appointment";
import { AppointmentProps } from "@/props/AppointmentProps";
import { UserProps } from "@/props/UserProps";
const Calendar = dynamic(() => import("@/components/appointment/calendar"), {
  ssr: false,
});

// interface AppointmentDetail {
//   time: string;
//   timeRange: string;
//   appointment: string | null;
//   detail: string;
//   mode: "create" | "update";
//   appointmentId?: string;
// }

const toLocalYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`; // "YYYY-MM-DD"
};

const toDateKey = (v: string | Date) => {
  const d = v instanceof Date ? v : new Date(v);
  return toLocalYMD(d);
};

const TimeList = [
  "2:00",
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

const DoctorManageAppointment = () => {
  const [myAppointment, setMyAppointment] = useState<AppointmentProps[]>(); // Appointment ของ Doctor ที่เป็น CONFIRMED
  const [requestAppointment, setRequestAppointment] = useState<
    AppointmentProps[]
  >([]); // Appointment ของ Doctor ที่เป็น PENDING
  const [appointmentDate, setAppointmentDate] = useState(getTodayThai());
  const [todayAppointment, setTodayAppointment] =
    useState<AppointmentProps[]>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentProps | null>(null);

  const fetchData = async () => {
    const appointmentData = await getDoctorAppointments("CONFIRMED");
    const requestAppt = await getDoctorAppointments("PENDING");
    // console.log(tmpPatientData);
    if (appointmentData) {
      setMyAppointment(appointmentData);
    }
    if (requestAppt) {
      setRequestAppointment(requestAppt);
    }
  };

  // fetch start data
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (!appointmentDate || !myAppointment) {
      setTodayAppointment([]);
      return;
    }
    setTodayAppointment(
      myAppointment.filter((a) => {
        return toDateKey(a.appoint_date) === appointmentDate;
      })
    );

    console.log(
      myAppointment.filter((a) => {
        return toDateKey(a.appoint_date) === appointmentDate;
      })
    );
  }, [appointmentDate, myAppointment]);

  const nowAppointment = (time: string) => {
    const tdappoint = todayAppointment?.filter(
      (a) => toTime(a.appoint_date).toString() === time.split(":")[0]
    )[0];
    return tdappoint;
  };

  const getFullName = (time: string) => {
    const appt = nowAppointment(time);
    const fullName =
      (appt?.patient.user_patient_idTouser.name ?? "") +
      " " +
      (appt?.patient.user_patient_idTouser.lastname ?? "");
    if (appt) return `นัดคนไข้ ${fullName}`;
    return "";
  };

  const formatDate = (value: string | Date) => {
    const d = value instanceof Date ? value : new Date(value);
    if (isNaN(d.getTime())) return "-";

    const parts = new Intl.DateTimeFormat("th-TH", {
      timeZone: "Asia/Bangkok",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }).formatToParts(d);

    const get = (t: string) => parts.find((p) => p.type === t)?.value ?? "";
    const day = get("day");
    const month = get("month");
    const year = get("year");
    const hour = get("hour");
    const minute = get("minute");

    return `วันที่ ${day}-${month}-${year} เวลา ${hour}:${minute}`;
  };

  const handleUpdateStatus = async (status: "CANCEL" | "CONFIRMED") => {
    if (!selectedAppointment?.id) return;
    try {
      status === "CONFIRMED"
        ? await updateAppointmentStatus(selectedAppointment.id, "CONFIRMED")
        : await updateAppointmentStatus(selectedAppointment.id, "CANCEL");
      await fetchData();
    } catch (error) {
      console.error(error);
    } finally {
      setIsDialogOpen(false);
      setSelectedAppointment(null);
    }
  };

  return (
    <div className="min-h-screen from-gray-100 via-white to-pink-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-semibold">Good morning, Docta</h1>

        <h2 className="mb-6 text-xl font-bold">พิจารณาการนัด</h2>

        <div className="w-full grid grid-cols-1 gap-8 lg:flex lg:flex-row lg:items-start">
          <section className="lg:flex-1 min-w-0">
            <Calendar
              appointmentDate={appointmentDate}
              setAppointmentDate={setAppointmentDate}
            />
            {/* request appointment section */}
            <div>
              <h2 className="my-6 text-xl font-bold">
                คนไข้ใหม่ขอนัด Appointment
              </h2>
              {requestAppointment.map((appt) => {
                console.log(appt);
                return (
                  <div
                    key={appt.id}
                    className="flex gap-2 bg-[#C4F6C5] w-full p-4 rounded-[10px] mb-2"
                    onClick={() => {
                      setSelectedAppointment(appt);
                      setIsDialogOpen(true);
                    }}
                  >
                    <img
                      src="/default-profile.jpg"
                      alt="Doctor Profile"
                      className="w-12 h-12 rounded-full"
                    />
                    <div className="flex flex-col justify-center">
                      <p>
                        {(appt.patient.user_patient_idTouser.name ?? "") +
                          " " +
                          (appt.patient.user_patient_idTouser.lastname ?? "")}
                      </p>
                      <p className="font-light text-sm">
                        {formatDate(appt.appoint_date)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* schedule */}
          <section className="lg:flex-1 min-w-0">
            <div className="rounded-lg bg-white p-6 shadow-sm border">
              <h3 className="mb-6 text-lg font-semibold">Schedule</h3>
              <div className="space-y-3">
                {TimeList.map((time, index) => (
                  <div key={index} className="flex flex-col gap-2">
                    <div className="text-sm font-medium text-gray-700">
                      {time}
                    </div>
                    {nowAppointment(time)?.appoint_date ? (
                      <div className="rounded-lg bg-green-200 p-4 text-center font-medium min-h-[60px] flex items-center justify-center">
                        {getFullName(time)}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-gray-100 p-4 min-h-[60px] flex items-center justify-center" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            className="min-w-24 rounded-lg bg-gray-200 text-black hover:bg-gray-300"
          >
            Back
          </Button>
          <Button className="min-w-24 rounded-lg bg-black text-white hover:bg-gray-800">
            Next
          </Button>
        </div>
        
        {/* popup for update appointment */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            className="max-w-md"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold flex gap-3">
                <img
                  src="/default-profile.jpg"
                  alt="Doctor Profile"
                  className="w-12 h-12 rounded-full"
                />
                <div className="flex flex-col justify-center">
                  <div>
                    {(selectedAppointment?.patient.user_patient_idTouser.name ??
                      "") +
                      " " +
                      (selectedAppointment?.patient.user_patient_idTouser
                        .lastname ?? "")}
                  </div>
                  <div className="font-light text-sm">
                    {selectedAppointment?.appoint_date
                      ? formatDate(selectedAppointment?.appoint_date)
                      : "-"}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-3">
                <p className="max-h-40 overflow-y-auto">
                  {selectedAppointment?.detail ?? "ไม่มีรายละเอียด"}
                </p>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => handleUpdateStatus("CANCEL")}
                >
                  cancel
                </Button>
                <Button
                  onClick={() => handleUpdateStatus("CONFIRMED")}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  approve
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DoctorManageAppointment;
