"use client";

import AppointmentTime from "@/component/appointmentTime";
import Calendar from "@/component/calendar";
import DoctorList from "@/component/doctorList";
import DoctorListItem from "@/component/doctorListItem";
import NavButton from "@/component/navButton";
import { DoctorProps } from "@/props/DoctorInfo";
import React, { useState, useEffect } from "react";

const TimeList = ["9.00", "10.00", "11.00", "12.00", "13.00", "14.00"];

const patientAppointmentPage = () => {
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorProps | null>(
    null
  );
  const [isDoctorListOpen, setIsDoctorListOpen] = useState(false);
  const [isTimeModalOpen, setIsTimeModalOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [selectedDate, setSelectedDate] = useState(0);

  useEffect(() => {
    console.log(selectedDoctor);
  }, [selectedDoctor]);

  return (
    <div className="flex flex-col items-center mt-4">
      <p className="w-[90%] text-start text-[20px] mb-2">นัดหมอ</p>
      <Calendar selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
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
                    selectedTime === time
                      ? "text-[#F5F5F5] bg-[#14AE5C]"
                      : "text-[#757575] bg-[#F5F5F5]"
                  }`}
                  onClick={() => {
                    setSelectedTime(time);
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
          onClick={() => {}}
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
        selectedTime={selectedTime}
        setSelectedTime={setSelectedTime}
        setIsDoctorListOpen={setIsDoctorListOpen}
      />
    </div>
  );
};

export default patientAppointmentPage;
