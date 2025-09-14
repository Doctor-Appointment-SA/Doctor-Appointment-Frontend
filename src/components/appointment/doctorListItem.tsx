import { DoctorProps } from "@/props/doctorInfo";
import axios from "axios";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";

interface Props {
  profile: string;
  name: string;
  specialty: string;
  doctorId?: string;
  status?: string;
  setSelectedDoctor?: Dispatch<SetStateAction<DoctorProps | null>>;
  setIsDoctorListOpen?: Dispatch<SetStateAction<boolean>>;
  setIsTimeModalOpen?: Dispatch<SetStateAction<boolean>>;
}

const DoctorListItem = ({
  profile,
  name,
  specialty,
  doctorId,
  status = "doctorList",
  setSelectedDoctor,
  setIsDoctorListOpen,
  setIsTimeModalOpen,
}: Props) => {
  return (
    <div
      className="bg-[#8DC5F5] flex justify-between p-4 rounded-[10px]"
      onClick={() => {
        if (
          status === "doctorList" &&
          setSelectedDoctor &&
          setIsDoctorListOpen &&
          setIsTimeModalOpen
        ) {
          setSelectedDoctor({ id: doctorId ?? "", profile, name, specialty });
          setIsDoctorListOpen(false);
          setIsTimeModalOpen(true);
        }
      }}
    >
      <div className="flex gap-2">
        <img
          src={profile}
          alt="Doctor Profile"
          className="w-12 h-12 rounded-full"
        />
        <div className="flex flex-col justify-center">
          <p>{name}</p>
          <p>{specialty}</p>
        </div>
      </div>

      {status === "appointment" && setIsDoctorListOpen && (
        <button
          className="bg-white px-1 rounded-[10px] p-2 hover:cursor-pointer"
          onClick={() => setIsDoctorListOpen((prev) => !prev)}
        >
          เปลี่ยนหมอ
        </button>
      )}
    </div>
  );
};

export default DoctorListItem;
