import { api } from "@/lib/api";
import { PaymentMethod } from "@/type/payment";
import axios from "axios";

export async function PrescriptionItem(payment_id: string) {
    try {
        const { data } = await axios.get(`http://localhost:4005/api/payments/prescription/${payment_id}`);
        // const data = await api.get(`/payment/${payment_id}`);
        return data;
    } catch (e) {
        throw new Error("Failed to Fetch Prescription Item:"+ e);
    }
}

export async function CreatePayment(prescription_id: string, method: PaymentMethod, cost: number) {
  try {
    const payload = {
      prescription_id,
      method,
      cost,
    }
    const { data } = await axios.post(`http://localhost:4005/api/payments/create`, payload);
    return data;
  } catch (e) {
    throw new Error("Failed to create payment: " + e);
  }
}