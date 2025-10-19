"use client";
import React from "react";
import Link from "next/link";

export type PatientAppointment = {
  id: string;
  name: string;
  date: string;
  time: string;
};

type Props = { item: PatientAppointment; onDelete?: (id: string) => void };

export default function PatientAppointmentCard({ item, onDelete }: Props) {
  return (
    <div className="w-full rounded-2xl bg-blue-300/80 px-4 py-3 shadow-sm ring-1 ring-blue-400/50">
      {/* คลิกที่บล็อกซ้ายเพื่อไปหน้าฟอร์ม */}
      <Link
        href={`/DoctorAppointments/${item.id}?name=${encodeURIComponent(item.name)}&date=${encodeURIComponent(item.date)}&time=${encodeURIComponent(item.time)}`}
        className="flex items-center gap-3"
      >
        <div className="min-w-0 flex-1">
          <div className="truncate text-[15px] font-semibold text-gray-900">{item.name}</div>
          <div className="mt-1 flex flex-wrap items-center gap-x-6 gap-y-1 text-sm text-gray-800/90">
            <span>{item.date}</span>
            <span>{item.time}</span>
          </div>
        </div>
      </Link>

      {/* ปุ่มลบยังอยู่ฝั่งขวา */}
      <div className="mt-2 flex justify-end">
        <button
          type="button"
          onClick={() => onDelete?.(item.id)}
          className="rounded-md px-2 py-1 text-sm font-medium text-red-700 hover:bg-red-50 active:scale-95"
        >
          ลบ
        </button>
      </div>
    </div>
  );
}