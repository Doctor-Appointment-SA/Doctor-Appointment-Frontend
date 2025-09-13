"use client";

import AppointmentTime from "@/component/appointmentTime";
import Calendar from "@/component/calendar";
import DoctorList from "@/component/doctorList";
import { DoctorProps } from "@/props/DoctorInfo";
import React, { useState, useEffect } from "react";

const patientAppointmentPage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProps | null>(
    null
  );
  const [isDoctorListOpen, setIsDoctorListOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  useEffect(() => {
    console.log(selectedDoctor);
  }, [selectedDoctor]);

  return (
    <div className="flex flex-col items-center">
      <p className="w-[90%] text-start">นัดหมอ</p>
      <Calendar />
      <p className="w-[90%] text-start">Doctors</p>
      <div className="bg-[#8DC5F5] w-[90%] flex justify-between p-4 rounded-[10px]">
        <p>ยังไม่ได้เลือกหมอ</p>
        <button
          className="bg-white px-1 rounded-[10px]"
          onClick={() => setIsDoctorListOpen((prev) => !prev)}
        >
          เลือกหมอ
        </button>
      </div>
      <DoctorList
        isDoctorListOpen={isDoctorListOpen}
        setIsDoctorListOpen={setIsDoctorListOpen}
        setSelectedDoctor={setSelectedDoctor}
        setIsTimeModalOpen={setIsTimeModalOpen}
      />
      <AppointmentTime
        isTimeModalOpen={isTimeModalOpen}
        setIsTimeModalOpen={setIsTimeModalOpen}
        selectedDoctor={selectedDoctor}
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        setIsDoctorListOpen={setIsDoctorListOpen}
      />
    </div>
  );
};

export default patientAppointmentPage;
