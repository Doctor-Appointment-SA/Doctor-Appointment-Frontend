"use client";
import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import dynamic from "next/dynamic";
const Calendar = dynamic(() => import("@/components/appointment/calendar"), {
  ssr: false,
});

interface AppointmentDetail {
  timeRange: string;
  appointment: string | null;
  detail: string;
}

const timeSlots = [
  { time: "01.00 น.", appointment: "นัดคนไข้ A" },
  { time: "02.00 น.", appointment: null },
  { time: "03.00 น.", appointment: "นัดคนไข้ B" },
  { time: "04.00 น.", appointment: null },
  { time: "05.00 น.", appointment: null },
  { time: "06.00 น.", appointment: null },
  { time: "07.00 น.", appointment: null },
];

const DoctorMakeAppointment = () => {
  const [appointmentDate, setAppointmentDate] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] =
    useState<AppointmentDetail | null>(null);

  return (
    <div className="min-h-screen from-gray-100 via-white to-pink-100 p-8">
      <div className="mx-auto max-w-7xl">
        <h1 className="mb-8 text-3xl font-semibold">Good morning, Docta</h1>

        <h2 className="mb-6 text-xl font-bold">นัดครั้งถัดไป</h2>

        <div className="w-full grid grid-cols-1 gap-8 lg:flex lg:flex-row lg:items-start">
          <section className="lg:flex-1 min-w-0">
            <Calendar
              appointmentDate={appointmentDate}
              setAppointmentDate={setAppointmentDate}
            />
          </section>

          {/* schedule */}
          <section className="lg:flex-1 min-w-0">
            <div className="rounded-lg bg-white p-6 shadow-sm border">
              <h3 className="mb-6 text-lg font-semibold">Schedule</h3>
              <div className="space-y-3">
                {timeSlots.map((slot, index) => (
                  <div
                    key={index}
                    className="flex flex-col gap-2"
                    onClick={() => {
                      const startHour = index + 1;
                      const endHour = startHour + 1;
                      setSelectedAppointment({
                        timeRange: `${startHour
                          .toString()
                          .padStart(2, "0")}.00 - ${endHour
                          .toString()
                          .padStart(2, "0")}.00`,
                        appointment: slot.appointment,
                        detail:
                          "รายละเอียด: gggggggggggggggggggggggggg gggggggggggggggggggggggggg gggggggggggggggggggggggggg",
                      });
                      setIsDialogOpen(true);
                    }}
                  >
                    <div className="text-sm font-medium text-gray-700">
                      {slot.time}
                    </div>
                    {slot.appointment ? (
                      <div className="rounded-lg bg-green-200 p-4 text-center font-medium min-h-[60px] flex items-center justify-center">
                        {slot.appointment}
                      </div>
                    ) : (
                      <div className="rounded-lg bg-gray-100 p-4 min-h-[60px] flex items-center justify-center" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            className="min-w-24 rounded-lg bg-gray-200 text-black hover:bg-gray-300"
          >
            Back
          </Button>
          <Button className="min-w-24 rounded-lg bg-black text-white hover:bg-gray-800">
            Next
          </Button>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-semibold">
                เวลา {selectedAppointment?.timeRange}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <h3 className="font-semibold">
                {selectedAppointment?.appointment}
              </h3>
              <div className="space-y-3">
                {editableDetails.map((detail, index) => (
                  <Textarea
                    key={index}
                    value={detail}
                    onChange={(e) => handleDetailChange(index, e.target.value)}
                    className="min-h-20 text-sm leading-relaxed"
                    placeholder="กรอกรายละเอียด..."
                  />
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  ยกเลิก
                </Button>
                <Button
                  onClick={handleSave}
                  className="bg-black text-white hover:bg-gray-800"
                >
                  บันทึก
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default DoctorMakeAppointment;
