"use client";

import { CreatePayment, PrescriptionItem } from "@/lib/payment";
import { PaymentMethod, Prescription } from "@/type/paymentType";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const payment = () => {
  const router = useRouter();

  const [delivery, setDelivery] = useState<boolean>(false);
  const [payment, setPayment] = useState<PaymentMethod>();
  const [prescription, setPrescription] = useState<Prescription>();
  const [address, setAddress] = useState<string>("my home");
  const { prescription_id } = useParams<{ prescription_id: string }>();

  // cal total cost
  const total = useMemo(() => {
    return (
      prescription?.prescription_item?.reduce((acc, item) => {
        const amount = item?.amount ?? 0;
        const price = item?.medication?.price ?? 0;
        return acc + amount * price;
      }, 0) ?? 0
    );
  }, [prescription]);

  // fetch medicine
  const fetchPaymentItem = async (prescription_id: string) => {
    // console.log(`${AuthTab.LOGIN} form submitted:`, payload);
    const data: Prescription = await PrescriptionItem(prescription_id);
    console.log("data", data);
    setPrescription(data);
  };

  // submit to create the payment record
  const handleSubmit = async (
    prescription_id: string,
    method: PaymentMethod,
    cost: number
  ) => {
    // console.log("pahment", payment, typeof payment);
    const created = await CreatePayment(prescription_id, method, cost);
    console.log("created:", created);
    const payment_id = created.id;
    router.push(`/payment/confirm/${payment_id}?delivery=${delivery}&location=${address}`);
  };

  useEffect(() => {
    fetchPaymentItem(prescription_id);
  }, [prescription_id]);


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
            <input type="radio" name="delivery" value={"false"} defaultChecked />{" "}
            รับที่โรงพยาบาล
          </label>
          <label>
            <input type="radio" name="delivery" value={"true"} /> delivery
          </label>
        </div>

        {/* address field */}
        {delivery === true && (
          <div className="flex flex-col space-y-2">
            <div className="text-lg font-semibold">ที่อยู่จัดส่ง</div>
            <textarea
              className="w-full border rounded-md p-2"
              placeholder="กรอกที่อยู่จัดส่งทั้งหมดในบรรทัดเดียว เช่น 123/45 ถนนสุขุมวิท กรุงเทพฯ 10260"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={3}
            />
          </div>
        )}
        
        {/* payment checkbox */}
        <div
          onChange={(e: any) => setPayment(e.target.value)}
          className="flex flex-col space-y-2"
        >
          <div className="text-lg font-semibold">วิธีการชำระเงิน</div>
          <label>
            <input type="radio" name="payment" value="CREDIT" />{" "}
            บัตรเครดิต/เดบิต
          </label>
          <label>
            <input type="radio" name="payment" value="PROMPTPAY" /> พร้อมเพย์
          </label>
          <label>
            <input type="radio" name="payment" value="BANK" /> โอนเงินผ่านธนาคาร
          </label>
          <label>
            <input type="radio" name="payment" value="CASH" /> เก็บเงินปลายทาง
          </label>
        </div>

        {/* confirm button */}
        <button
          onClick={() => {
            if (!prescription?.id || !payment) {
              alert("กรุณาเลือกวิธีการชำระเงิน");
              return;
            }
            if (delivery && !address) {
              alert("กรุณาเลือกสถานที่รับของ");
              return;
            }
            handleSubmit(prescription.id, payment, total);
          }}
          className="mt-4 w-full py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg shadow-md transition-all"
        >
          ถัดไป
        </button>
      </div>
    </main>
  );
};

export default payment;
