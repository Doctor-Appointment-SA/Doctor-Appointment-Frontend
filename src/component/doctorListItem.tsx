import React from "react";

interface Props {
    profile: string;
    name: string;
    specialty: string
}

const DoctorListItem = ({ profile, name, specialty}: Props) => {
  return (
    <div className="bg-[#8DC5F5] flex gap-2 p-4 rounded-[10px]">
        <img src={profile} alt="Doctor Profile" className="w-12 h-12 rounded-full"/>
        <div className="flex flex-col justify-center">
            <p>{name}</p>
            <p>{specialty}</p>
        </div>
    </div>
  );
};

export default DoctorListItem;
