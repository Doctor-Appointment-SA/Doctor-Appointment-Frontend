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
  doctorCreateAppointment,
  getDoctorAppointments,
  getPatientData,
  updateAppointmentDetail,
} from "@/lib/appointment";
import { AppointmentProps } from "@/props/AppointmentProps";
import { UserProps } from "@/props/UserProps";
const Calendar = dynamic(() => import("@/components/appointment/calendar"), {
  ssr: false,
});

interface AppointmentDetail {
  time: string;
  timeRange: string;
  appointment: string | null;
  detail: string;
  mode: "create" | "update";
  appointmentId?: string;
}

const patient_id = "d51e5c0a-88ee-478d-b8d2-95010bb650c2";

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

const toTime = (v: string | Date) => {
  const d = v instanceof Date ? v : new Date(v);
  const time = d.getHours();
  // console.log(time);
  return time;
};

const TimeList = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

const DoctorMakeAppointment = () => {
  const [myAppointment, setMyAppointment] = useState<AppointmentProps[]>();
  const [appointmentDate, setAppointmentDate] = useState("");
  const [todayAppointment, setTodayAppointment] =
    useState<AppointmentProps[]>();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentDetail | null>(null);
  const [newDetail, setNewDetail] = useState("");
  const [patientData, setPatientData] = useState<UserProps>();

  // fetch start data
  useEffect(() => {
    const fetchData = async () => {
      const appointmentData = await getDoctorAppointments("CONFIRMED");
      const tmpPatientData = await getPatientData(patient_id);
      console.log(tmpPatientData);
      if (appointmentData) {
        setMyAppointment(appointmentData);
      }
      if (tmpPatientData) {
        setPatientData(tmpPatientData);
      }
    };
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
  }, [appointmentDate]);

  // save info when close pop-up
  const handleSave = () => {
    if (selectedAppointment?.mode === "create") {
      doctorCreateAppointment(
        patient_id,
        appointmentDate,
        newDetail ?? "",
        selectedAppointment?.time ?? ""
      );
    }
    else if (selectedAppointment?.mode === "update") {
      updateAppointmentDetail(selectedAppointment?.appointmentId ?? "", newDetail);
    }
    setIsDialogOpen(false);
  };

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
    return `นัดคนไข้ ${patientData?.name + " " + patientData?.lastname}`;
  };

  return (
    <div className="min-h-screen from-gray-100 via-white to-pink-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-semibold">Good morning, Docta</h1>

        <h2 className="mb-6 text-xl font-bold">นัดครั้งถัดไป</h2>

        <div className="w-full grid grid-cols-1 gap-8 lg:flex lg:flex-row lg:items-start">
          <section className="lg:flex-1 min-w-0">
            <Calendar
              appointmentDate={appointmentDate}
              setAppointmentDate={setAppointmentDate}
            />
          </section>

          {/* schedule */}
          <section className="lg:flex-1 min-w-0">
            <div className="rounded-lg bg-white p-6 shadow-sm border">
              <h3 className="mb-6 text-lg font-semibold">Schedule</h3>
              <div className="space-y-3">
                {TimeList.map((time, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2"
                    onClick={() => {
                      const startHour = time.split(":")[0];
                      const endHour = (Number(startHour) + 1).toString();
                      if (!todayAppointment) return;
                      const thisAppointment = nowAppointment(time);
                      console.log("this", thisAppointment);
                      const detail = thisAppointment?.detail ?? "";
                      const mode = thisAppointment ? "update" : "create";
                      setSelectedAppointment({
                        time: startHour,
                        timeRange: `${startHour
                          .toString()
                          .padStart(2, "0")}.00 - ${endHour
                          .toString()
                          .padStart(2, "0")}.00`,
                        appointment: getFullName(time),
                        detail,
                        mode,
                        appointmentId: thisAppointment?.id
                      });
                      setNewDetail(detail);
                      setIsDialogOpen(true);
                    }}
                  >
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

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent
            className="max-w-md"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                เวลา {selectedAppointment?.timeRange}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <h3 className="font-semibold">
                {selectedAppointment?.appointment}
              </h3>
              <div className="space-y-3">
                <textarea
                  value={newDetail}
                  onChange={(e) => setNewDetail(e.target.value)}
                  className="min-h-20 text-sm leading-relaxed w-full"
                  placeholder="กรอกรายละเอียด..."
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  บันทึก
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DoctorMakeAppointment;
