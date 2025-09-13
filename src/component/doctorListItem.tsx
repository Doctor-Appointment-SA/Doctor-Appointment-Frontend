import { DoctorProps } from "@/props/DoctorInfo";
import React, { Dispatch, SetStateAction } from "react";

interface Props {
  profile: string;
  name: string;
  specialty: string;
  doctorList?: boolean; //if use outside of doctorListComponent set doctorList = false
  setSelectedDoctor?: Dispatch<SetStateAction<DoctorProps | null>>;
  setIsDoctorListOpen?: Dispatch<SetStateAction<boolean>>;
  setIsTimeModalOpen?: Dispatch<SetStateAction<boolean>>;
}

const DoctorListItem = ({
  profile,
  name,
  specialty,
  doctorList = true,
  setSelectedDoctor,
  setIsDoctorListOpen,
  setIsTimeModalOpen,
}: Props) => {
  return (
    <div
      className="bg-[#8DC5F5] flex gap-2 p-4 rounded-[10px]"
      onClick={() => {
        if (
          doctorList &&
          setSelectedDoctor &&
          setIsDoctorListOpen &&
          setIsTimeModalOpen
        ) {
          setSelectedDoctor({ profile, name, specialty });
          setIsDoctorListOpen(false);
          setIsTimeModalOpen(true);
        }
      }}
    >
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
  );
};

export default DoctorListItem;
