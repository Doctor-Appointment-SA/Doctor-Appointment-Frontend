"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const MONTHS = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม",
];

interface Props {
  appointmentDate: string;
  setAppointmentDate: Dispatch<SetStateAction<string>>;
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

// เปรียบเทียบว่าก่อนวันนี้หรือไม่
const isPastDate = (year: number, month: number, day: number) => {
  const today = new Date();
  const date = new Date(year, month, day);
  // ตัดเวลาออกเพื่อให้เทียบแค่วัน
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
};

export default function Calendar({
  appointmentDate,
  setAppointmentDate,
}: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(
    Number(appointmentDate.split("-")[2]) || 0
  );

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // หาวันแรกของเดือนและจำนวนวันในเดือน
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // ฟังก์ชันเลื่อนไปเดือนก่อนหน้า / ถัดไป
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // สร้าง array ของวันในปฏิทิน
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

  const currentTime = new Date().toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-medium text-foreground">
          {MONTHS[month]} {year}
        </h2>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPreviousMonth}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4 text-blue-500" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNextMonth}
            className="h-8 w-8 p-0 hover:bg-muted"
          >
            <ChevronRight className="h-4 w-4 text-blue-500" />
          </Button>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {DAYS.map((day) => (
          <div
            key={day}
            className="text-xs font-medium text-muted-foreground text-center py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 mb-6">
        {calendarDays.map((day, index) => {
          if (!day) return <div key={index} className="aspect-square" />;

          const isPast = isPastDate(year, month, day);

          const dayDate = `${year}-${(month + 1)
            .toString()
            .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;

          return (
            <div key={index} className="aspect-square">
              <button
                disabled={isPast}
                onClick={() => {
                  setAppointmentDate(dayDate);
                  setSelectedDate(day);
                }}
                className={`w-full h-full flex items-center justify-center text-sm font-medium rounded-md transition-colors 
                  ${
                    isPast
                      ? "text-gray-400 cursor-not-allowed"
                      : day === selectedDate
                      ? "bg-blue-500 text-white hover:bg-blue-600"
                      : "text-foreground hover:bg-muted"
                  }`}
              >
                {day}
              </button>
            </div>
          );
        })}
      </div>

      {/* Time display */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium">เวลา</span>
        <span className="text-foreground">{currentTime}</span>
      </div>
    </div>
  );
}
