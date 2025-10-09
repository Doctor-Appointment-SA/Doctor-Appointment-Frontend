"use client";

import { Divide } from "lucide-react";
import { useState } from "react";

const medicine = [
  {
    name: "A",
    cost: 1000,
  },
  {
    name: "Para",
    cost: 3000,
  },
];

type PaymentType = "Credit" | "PromptPay" | "Bank" | "Cash";

const payment = () => {
  const [delivery, setDelivery] = useState<boolean>();
  const [payment, setPayment] = useState<PaymentType>();


  return (
    <main className="mx-auto my-10 w-[390px] h-[844px] bg-amber-50">
      <div className="flex flex-col w-full gap-4 py-10 px-2">
        <div className="text-2xl font-semibold ">ชำระเงิน</div>

        {/* medicine list box */}
        <div className="flex justify-center items-center">
          <div className="w-full px-8 py-4 bg-[#8DC5F5] rounded-md shadow-md">
            <div className="flex justify-center text-xl font-semibold text-center rounded-md overflow-hidden">
              สรุปคำสั่งซื้อ
            </div>

            {/* medicine here */}
            <div>
              {medicine ? (
                medicine.map((item, index) => (
                  <div
                    key={index}
                    className="flex flex-row w-full justify-between"
                  >
                    <div>{item.name}</div>
                    <div>{item.cost} บาท</div>
                  </div>
                ))
              ) : (
                <div></div>
              )}
            </div>

            {/* รวม */}
            <div className="flex justify-between text-lg font-semibold text-center overflow-hidden">
              <div>รวมทั้งสิ้น</div>
              <div>{5000} บาท</div>
            </div>
          </div>
        </div>

        {/* delivery checkbox */}
        <div
          onChange={(e: any) => setDelivery(e.target.value === "true")}
          className="flex flex-col space-y-2"
        >
          <div className="text-lg font-semibold">เลือกรูปแบบการรับ</div>
          <label>
            <input type="radio" name="delivery" value={"false"} />{" "}
            รับที่โรงพยาบาล
          </label>
          <label>
            <input type="radio" name="delivery" value={"true"} /> delivery
          </label>
        </div>

        {/* payment checkbox */}
        <div
          onChange={(e: any) => setPayment(e.target.value)}
          className="flex flex-col space-y-2"
        >
          <div className="text-lg font-semibold">วิธีการชำระเงิน</div>
          <label>
            <input type="radio" name="payment" value="Credit" />{" "}
            บัตรเครดิต/เดบิต
          </label>
          <label>
            <input type="radio" name="payment" value="PromptPay" /> พร้อมเพย์
          </label>
          <label>
            <input type="radio" name="payment" value="Bank" />{" "}
            โอนเงินผ่านธนาคาร
          </label>
          <label>
            <input type="radio" name="payment" value="Cash" />{" "}
            เก็บเงินปลายทาง
          </label>
        </div>
      </div>
    </main>
  );
};

export default payment;
