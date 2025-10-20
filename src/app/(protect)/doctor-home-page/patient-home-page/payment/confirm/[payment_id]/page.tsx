"use client";

import { CancelPayment, ConfirmPayment, IsPaymentExpired } from "@/lib/payment";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

const confirm = () => {
  const params = useSearchParams();
  const delivery = params.get("delivery") === "true";
  const location = params.get("location");
  const router = useRouter();

  const { payment_id } = useParams<{ payment_id: string }>();
  const [paymentExpired, setPaymentExpired] = useState<boolean>(false);
  const [prescription_id, setPrescription_id] = useState<string>();
  const [timer, setTimer] = useState<number>(0);

  // submit to confirm payment, to create tracking record if delivery is true
  const handleSubmit = async () => {
    if (!location) return;
    const data = await ConfirmPayment(payment_id, delivery, location);
    console.log("data:", data);

    // guard
    if (data.status === 400) {
      return;
    }

    // if do delivery, go to delivery page, if not go to home page
    if (delivery) {
      const tracking_id = data.tracking_data.id;
      console.log("tracing_id", tracking_id);
      router.push(`/patient-home-page/payment/track/${tracking_id}`);
    } else {
      router.push("/patient-home-page");
    }
  };

  const handleCancel = async () => {
    const data = await CancelPayment(payment_id);
    console.log("data is deleteddddddddddddddddddddddddddddd")
    const prescription_id = data.prescription_id;
    router.push(`/patient-home-page/payment/${prescription_id}`);
  };

  // subscribe to payment backend to CANCEL the payment at real time
  // subscirbe to payment backend to fetch the time left to make transaction
  useEffect(() => {
    const cleanup = IsPaymentExpired(payment_id, setPaymentExpired, setTimer, setPrescription_id);
    return cleanup;
  }, [payment_id]);

  // redirect when payment is expired
  useEffect(() => {
    if (paymentExpired) {
      router.push(`/patient-home-page/payment/${prescription_id}`);
    }
  }, [paymentExpired, prescription_id]);


  return (
    <main className="mx-auto my-10 w-[390px] h-[844px] bg-amber-50">
      <div className="flex flex-col w-full gap-4 py-10 px-2">
        <div className="text-2xl font-semibold ">ชำระเงิน</div>

        {/* Countdown */}
        <div
          className={`w-full rounded-xl p-4 text-center ${
            paymentExpired
              ? "bg-red-100 text-red-700"
              : "bg-amber-100 text-amber-800"
          }`}
          aria-live="polite"
        >
          {!paymentExpired && (
            <div className="flex flex-col items-center">
              <span className="text-xs uppercase tracking-wide opacity-70">
                เหลือเวลาชำระเงิน
              </span>
              <span className="text-4xl font-bold tracking-widest">
                {timer}
              </span>
            </div>
          )}
        </div>

        {/* Rickroll QR Code */}
        <img
          src="https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          alt="QR Code to Rick Roll"
          className="border-4 border-gray-300 rounded-lg shadow-md"
        />

        {/* button to submit, cancel */}
        <div className="flex flex-row justify-between space-x-2">
          <button
            onClick={() => handleCancel()}
            className="mt-4 w-full py-3 bg-amber-400 hover:bg-amber-500 text-white font-semibold rounded-lg shadow-md transition-all"
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
