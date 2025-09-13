"use client";

import Calendar from "@/component/calendar";
import DoctorList from "@/component/doctorList";
import React, { useState, useEffect } from "react";

const patientAppointmentPage = () => {
  const [isOpen, setIsOpen] = useState(false);
  useEffect(() => {
    console.log(isOpen);
  }, [isOpen]);

  return (
    <div className="flex flex-col items-center">
      <p className="w-[90%] text-start">นัดหมอ</p>
      <Calendar />
      <p className="w-[90%] text-start">Doctors</p>
      <div className="bg-[#8DC5F5] w-[90%] flex justify-between p-4 rounded-[10px]">
        <p>ยังไม่ได้เลือกหมอ</p>
        <button
          className="bg-white px-1 rounded-[10px]"
          onClick={() => setIsOpen((prev) => !prev)}
        >
          เลือกหมอ
        </button>
      </div>
      <DoctorList isOpen={isOpen} setIsOpen={setIsOpen} />
    </div>
  );
};

export default patientAppointmentPage;
