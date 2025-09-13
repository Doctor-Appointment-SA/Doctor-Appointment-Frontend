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
  selectedDate: number;
  setSelectedDate: Dispatch<SetStateAction<number>>;
}

const DAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

export default function Calendar({ selectedDate, setSelectedDate }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of the month and number of days
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Navigate months
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  // Generate calendar days
  const calendarDays = [];

  // Empty cells for days before the first day of the month
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null);
  }

  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Get current time
  const currentTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
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
        {calendarDays.map((day, index) => (
          <div key={index} className="aspect-square">
            {day && (
              <button
                onClick={() => setSelectedDate(day)}
                className={`w-full h-full flex items-center justify-center text-sm font-medium rounded-md transition-colors hover:bg-muted ${
                  day === selectedDate
                    ? "bg-blue-500 text-white hover:bg-blue-600"
                    : day === currentDate.getDate()
                    ? "text-blue-500"
                    : "text-foreground"
                }`}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Time display */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium">เวลา</span>
        <span className="text-foreground">{currentTime}</span>
      </div>
    </div>
  );
}
