"use client";
import React from "react";
import Link from "next/link";

export type PatientAppointment = {
  fullDate: string | number | Date;
  id: string;
  name: string;
  date: string;
  time: string;
  profilePic?: string; 
};

type Props = { item: PatientAppointment; status:string;onDelete?: (id: string) => void };

export default function PatientAppointmentCard({ item, status, onDelete }: Props) {
  const Redirect = () => {
    let path = '';
    if (status === "CONFIRMED") 
      path = `/doctor-home-page/DoctorHomepage/DoctorAppointments/${item.id}?name=${encodeURIComponent(
          item.name
        )}&date=${encodeURIComponent(item.date)}&time=${encodeURIComponent(item.time)}`;
    if (status === "PENDING") 
      path = `/doctor-home-page/doctor-manage-appointment`; 

    return path;
  }

  return (
    <div className="w-full rounded-2xl bg-blue-300/80 px-4 py-3 shadow-sm ring-1 ring-blue-400/50">
      <Link
        href={Redirect()}
        className="flex items-center gap-3"
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <img
            src={item.profilePic || "https://i.pravatar.cc/80?img=1"}
            alt={item.name}
            className="h-9 w-9 rounded-full object-cover ring-2 ring-white/70"
          />
          <div className="flex-1 min-w-0">
            <div className="truncate text-[15px] font-semibold text-gray-900">
              {item.name}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-800/90">
              <span>{item.date}</span>
              <span>{item.time}</span>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
