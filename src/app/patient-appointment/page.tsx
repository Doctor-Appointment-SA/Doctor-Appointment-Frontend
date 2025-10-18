"use client";

import AppointmentTime from "@/components/appointment/appointmentTime";
import DoctorList from "@/components/appointment/doctorList";
import DoctorListItem from "@/components/appointment/doctorListItem";
import NavButton from "@/components/appointment/navButton";
import { DoctorProps } from "@/props/doctorInfo";
import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getTodayThai, patientCreateAppointment } from "@/lib/appointment";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { setDefaultResultOrder } from "dns";
const Calendar = dynamic(() => import("@/components/appointment/calendar"), {
  ssr: false,
});

const TimeList = [
  "9:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
];

const PatientAppointmentPage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProps | null>(
    null
  );
  const [isDoctorListOpen, setIsDoctorListOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [appointmentDate, setAppointmentDate] = useState(getTodayThai());
  const [doctorSchedule, setDoctorSchedule] = useState<string[]>([]);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  // useEffect(() => {
  //   console.log(selectedDoctor);
  // }, [selectedDoctor]);

  useEffect(() => {
    setSelectedTime("");
  }, [appointmentDate]);

  const handleCloseSuccessDialog = () => {
    setIsSuccessDialogOpen(false);
    setSelectedDoctor(null);
    setSelectedTime("");
  };

  return (
    <div className="flex flex-col items-center mt-4">
      <p className="w-[90%] text-start text-[20px] mb-2">นัดหมอ</p>
      <Calendar
        appointmentDate={appointmentDate}
        setAppointmentDate={setAppointmentDate}
      />
      <div className="w-[90%]">
        <p className="text-start text-[20px] my-4">หมอ</p>
        {!(selectedDoctor && selectedTime) && (
          <div className="bg-[#8DC5F5] flex justify-between items-center p-4 rounded-[10px]">
            <p>ยังไม่ได้เลือกหมอ</p>
            <button
              className="bg-white px-1 rounded-[10px] p-2 hover:cursor-pointer"
              onClick={() => setIsDoctorListOpen((prev) => !prev)}
            >
              เลือกหมอ
            </button>
          </div>
        )}

        {selectedDoctor && selectedTime && (
          <div>
            <DoctorListItem
              profile={selectedDoctor.profile}
              name={selectedDoctor.name}
              specialty={selectedDoctor.specialty}
              setIsDoctorListOpen={setIsDoctorListOpen}
              status="appointment"
            />
            <div className="flex flex-wrap justify-center gap-2 my-2">
              {TimeList.map((time) => (
                <button
                  key={time}
                  className={`py-2 px-3 rounded-[10px] ${
                    doctorSchedule?.includes(time)
                      ? "text-[#757575] bg-[#BCB2B2]"
                      : selectedTime === time
                      ? "text-[#F5F5F5] bg-[#14AE5C]"
                      : "text-[#757575] bg-[#F5F5F5]"
                  }`}
                  onClick={() => {
                    if (!doctorSchedule?.includes(time)) {
                      setSelectedTime(time);
                    }
                  }}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center gap-5 absolute bottom-8">
        <NavButton
          text="ย้อนกลับ"
          textColor="#1E1E1E"
          bgColor="#E3E3E3"
          onClick={() => {}}
        />
        <NavButton
          text="ยืนยัน"
          textColor="#F5F5F5"
          bgColor="#2C2C2C"
          onClick={() => {
            if (selectedDoctor) {
              patientCreateAppointment(
                selectedDoctor,
                appointmentDate,
                selectedTime
              );
              setIsSuccessDialogOpen(true);
            }
          }}
        />
      </div>

      {/* doctors list modal */}
      <DoctorList
        isDoctorListOpen={isDoctorListOpen}
        setIsDoctorListOpen={setIsDoctorListOpen}
        setSelectedDoctor={setSelectedDoctor}
        setIsTimeModalOpen={setIsTimeModalOpen}
      />

      {/* select time modal */}
      <AppointmentTime
        isTimeModalOpen={isTimeModalOpen}
        setIsTimeModalOpen={setIsTimeModalOpen}
        selectedDoctor={selectedDoctor}
        appointmentDate={appointmentDate}
        setSelectedTime={setSelectedTime}
        setIsDoctorListOpen={setIsDoctorListOpen}
        doctorSchedule={doctorSchedule}
        setDoctorSchedule={setDoctorSchedule}
      />
      
      <Dialog open={isSuccessDialogOpen} onOpenChange={setIsSuccessDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-2xl">
              สร้างนัดหมายสำเร็จ
            </DialogTitle>

            <DialogDescription asChild>
              <div className="text-center pt-4">
                <div className="space-y-2">
                  <div className="text-base">
                    นัดหมายของคุณได้ถูกบันทึกเรียบร้อยแล้ว
                    กรุณารอการยืนยันจากแพทย์
                  </div>

                  {selectedDoctor && (
                    <div className="mt-4 p-4 bg-muted rounded-lg">
                      <p className="font-semibold">รายละเอียดการนัด:</p>
                      <p>แพทย์: {selectedDoctor.name}</p>
                      <p>วันที่: {appointmentDate}</p>
                      <p>เวลา: {selectedTime} น.</p>
                    </div>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center gap-3 mt-4">
            <Button
              onClick={handleCloseSuccessDialog}
              className="bg-[#14AE5C] hover:bg-[#12a054] text-white px-8"
            >
              ตกลง
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PatientAppointmentPage;
