"use client";

import { CreatePayment, PrescriptionItem } from "@/lib/payment";
import { PaymentMethod, Prescription } from "@/type/payment";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

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
  const [prescription, setPrescription] = useState<Prescription>();
  const { id } = useParams<{ id: string }>();

  const total = useMemo(() => {
    return (
      prescription?.prescription_item?.reduce((acc, item) => {
        const amount = item?.amount ?? 0;
        const price = item?.medication?.price ?? 0;
        return acc + amount * price;
      }, 0) ?? 0
    );
  }, [prescription]);

  const fetchPaymentItem = async (payment_id: string) => {
    // console.log(`${AuthTab.LOGIN} form submitted:`, payload);
    const data: Prescription = await PrescriptionItem(payment_id);
    console.log("data", data);
    setPrescription(data);
  };

  const handleSubmit = async (prescription_id:string, method:PaymentMethod, cost:number) => {
    const data = await CreatePayment(prescription_id, method, cost);
  };

  useEffect(() => {
    fetchPaymentItem(id);
  }, [id]);

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
              {prescription && prescription.prescription_item ? (
                prescription.prescription_item.map((item, index) => {
                  if (
                    !item.amount ||
                    !item.medication ||
                    !item.medication.price
                  )
                    return;

                  return (
                    <div
                      key={index}
                      className="flex flex-row w-full justify-between"
                    >
                      <div>{item.medication?.name}</div>
                      <div>จำนวน {item.amount} เม็ด</div>
                      <div>{item.amount * item.medication?.price} บาท</div>
                    </div>
                  );
                })
              ) : (
                <div></div>
              )}

              {/* รวม */}
              <div className="flex justify-between text-lg font-semibold text-center overflow-hidden">
                <div>รวมทั้งสิ้น</div>
                <div>{total} บาท</div>
              </div>
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
            <input type="radio" name="payment" value="Bank" /> โอนเงินผ่านธนาคาร
          </label>
          <label>
            <input type="radio" name="payment" value="Cash" /> เก็บเงินปลายทาง
          </label>
        </div>
      </div>
    </main>
  );
};

export default payment;
