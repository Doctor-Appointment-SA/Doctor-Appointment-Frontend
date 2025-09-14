import React, { Dispatch, SetStateAction, useState } from "react";
import DoctorListItem from "./doctorListItem";
import { DoctorProps } from "@/props/doctorInfo";
import NavButton from "./navButton";

interface Props {
  isTimeModalOpen: boolean;
  setIsTimeModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedDoctor: DoctorProps | null;
  setSelectedTime: Dispatch<SetStateAction<string>>;
  selectedTime: string;
  setIsDoctorListOpen: Dispatch<SetStateAction<boolean>>;
}

const TimeList = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00"];

const AppointmentTime = ({
  isTimeModalOpen,
  setIsTimeModalOpen,
  selectedDoctor,
  setSelectedTime,
  selectedTime,
  setIsDoctorListOpen,
}: Props) => {
  const [tempTime, setTempTime] = useState("");

  return (
    <div className="w-full">
      {isTimeModalOpen && (
        <div className="fixed inset-0 z5-50 flex items-center justify-center bg-black/50">
          <div className="bg-black rounded-lg w-[90%] px-4 flex flex-col gap-4 py-4">
            <header className="flex justify-between">
              <div className="text-white">Doctor</div>
              {/* close button */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="rgba(255,255,255,1)"
                width={20}
                onClick={() => setIsTimeModalOpen((prev) => !prev)}
              >
                <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
              </svg>
            </header>

            <DoctorListItem
              profile={selectedDoctor?.profile ?? ""}
              name={selectedDoctor?.name ?? ""}
              specialty={selectedDoctor?.specialty ?? ""}
              status="appointmentTime"
            />

            {/* select appointment time section */}
            <div className="flex flex-wrap justify-center gap-2">
              {TimeList.map((time) => (
                <button
                  key={time}
                  className={`py-2 px-3 rounded-[10px] ${
                    tempTime === time
                      ? "text-[#F5F5F5] bg-[#14AE5C]"
                      : "text-[#757575] bg-[#F5F5F5]"
                  }`}
                  onClick={() => {
                    setTempTime(time);
                  }}
                >
                  {time}
                </button>
              ))}
            </div>

            {/* navigate button */}
            <div className="flex justify-center gap-5">
              <NavButton
                text="เปลี่ยนหมอ"
                textColor="#1E1E1E"
                bgColor="#E3E3E3"
                onClick={() => {
                  setIsTimeModalOpen(false);
                  setIsDoctorListOpen(true);
                  setTempTime("");
                }}
              />
              <NavButton
                text="ยืนยัน"
                textColor="#F5F5F5"
                bgColor="#757575"
                onClick={() => {
                  setIsTimeModalOpen(false);
                  setSelectedTime(tempTime);
                  setTempTime("");
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentTime;
