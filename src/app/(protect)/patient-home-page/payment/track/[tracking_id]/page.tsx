"use client";

import { FetchTrackingInfo } from "@/lib/payment";
import { Tracking, TrackingStatus } from "@/type/paymentType";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";


export default function TrackingPage() {
  const { tracking_id } = useParams<{tracking_id: string}>();
  const [tracking, setTracking] = useState<Tracking>();

  // Define the steps and their corresponding order
  const steps = ["รอการจัดส่ง", "สินค้าส่งออกแล้ว", "ได้รับสินค้า"];

  // current progress show by UI
  const currentStep = (() => {
    if (!tracking) return 0;
    if (tracking.status === TrackingStatus.PREPARE) return 0;
    if (tracking.status === TrackingStatus.SENDING) return 1;
    if (tracking.status === TrackingStatus.SUCCESS) return 2;
    return 0;
  })();

  // const fetchTrackingInfo = async () => {
  //   await FetchTrackingInfo(tracking_id, setTracking);
  // }

  useEffect(()=>{
    const cleanup = FetchTrackingInfo(tracking_id, setTracking);
    return cleanup;
  }, [tracking_id])

  return (
    <main className="mx-auto my-10 w-[390px] h-[844px] bg-amber-50 p-4">
      <div className="text-2xl font-semibold mb-6">ติดตามการจัดส่งยา</div>

      <div className="bg-white rounded-lg shadow-md p-4">
        <p><strong>รหัสติดตาม:</strong> {tracking?.id}</p>
        <p><strong>สถานะ:</strong> {tracking?.status}</p>
        <p><strong>สถานที่:</strong> {tracking?.location}</p>
      </div>

      {/* === Delivery Progress === */}
      <div className="mt-10 flex flex-col items-start space-y-4">
        {steps.map((step, index) => {
          const isCompleted = index <= currentStep;
          return (
            <div key={index} className="flex items-center">
              {/* Circle indicator */}
              <div
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-3 ${
                  isCompleted
                    ? "bg-green-500 border-green-600 text-white"
                    : "bg-gray-300 border-gray-400 text-gray-500"
                }`}
              >
                {isCompleted ? "✓" : ""}
              </div>

              {/* Step label */}
              <span
                className={`text-lg font-medium ${
                  isCompleted ? "text-green-600" : "text-gray-500"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </main>
  );
}
