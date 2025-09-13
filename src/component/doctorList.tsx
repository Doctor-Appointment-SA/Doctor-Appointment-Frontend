import React, { Dispatch, SetStateAction, useState } from "react";
import DoctorListItem from "./doctorListItem";
import AppointmentTime from "./appointmentTime";
import { DoctorProps } from "@/props/DoctorInfo";

interface Props {
  isDoctorListOpen: boolean;
  setIsDoctorListOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedDoctor: Dispatch<SetStateAction<DoctorProps | null>>;
  setIsTimeModalOpen: Dispatch<SetStateAction<boolean>>;
}

const DoctorList = ({ isDoctorListOpen, setIsDoctorListOpen, setSelectedDoctor, setIsTimeModalOpen }: Props) => {
  
  return (
    <div className="w-full">
      {isDoctorListOpen && (
        <div className="fixed inset-0 z5-50 flex items-center justify-center bg-black/50">
          <div className="bg-black rounded-lg w-[90%] px-4 flex flex-col gap-2 py-4">
            <header className="flex justify-between">
              <div className="text-white">Doctors List</div>
              {/* close button */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="rgba(255,255,255,1)"
                width={20}
                onClick={()=>setIsDoctorListOpen(prev=>!prev)}
              >
                <path d="M11.9997 10.5865L16.9495 5.63672L18.3637 7.05093L13.4139 12.0007L18.3637 16.9504L16.9495 18.3646L11.9997 13.4149L7.04996 18.3646L5.63574 16.9504L10.5855 12.0007L5.63574 7.05093L7.04996 5.63672L11.9997 10.5865Z"></path>
              </svg>
            </header>
            <DoctorListItem
              profile={"/default-profile.jpg"}
              name={"Dr.Pasit"}
              specialty={"Heartbreaker"}
              setSelectedDoctor={setSelectedDoctor}
              setIsDoctorListOpen={setIsDoctorListOpen}
              setIsTimeModalOpen={setIsTimeModalOpen}
            />
            <DoctorListItem
              profile={"/default-profile.jpg"}
              name={"Dr.Krittin"}
              specialty={"Professional"}
              setSelectedDoctor={setSelectedDoctor}
              setIsDoctorListOpen={setIsDoctorListOpen}
              setIsTimeModalOpen={setIsTimeModalOpen}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorList;
