"use client";

import { CancelPayment, ConfirmPayment } from "@/lib/payment";
import { useParams, useRouter } from "next/navigation";
import React from "react";

const confirm = () => {
  const { payment_id } = useParams<{ payment_id: string }>();
  const router = useRouter();

  console.log("payemtn_id", payment_id);
  const handleSubmit = async () => {
    const data = await ConfirmPayment(payment_id);
    console.log("data:", data);
  };

  const handleCancel = async () => {
    const data = await CancelPayment(payment_id);
    const prescription_id = data.prescription_id;
    router.push(`/payment/${prescription_id}`);
  };

  return (
    <main className="mx-auto my-10 w-[390px] h-[844px] bg-amber-50">
      <div className="flex flex-col w-full gap-4 py-10 px-2">
        <div className="text-2xl font-semibold ">ชำระเงิน</div>

        {/* Rickroll QR Code */}
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          alt="QR Code to Rick Roll"
          className="border-4 border-gray-300 rounded-lg shadow-md"
        />

        <div className="flex flex-row justify-between">
          <button
            onClick={() => handleCancel()}
            className="mt-4 w-full py-3 bg-amber-400 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all"
          >
            ยกเลิกรายการ
          </button>

          <button
            onClick={() => handleSubmit()}
            className="mt-4 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all"
          >
            ชำระเงิน
          </button>
        </div>
      </div>
    </main>
  );
};

export default confirm;
