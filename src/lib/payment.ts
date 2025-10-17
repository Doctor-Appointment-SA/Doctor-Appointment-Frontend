import { api } from "@/lib/api";
import { PaymentMethod } from "@/type/payment";
import axios from "axios";

export async function PrescriptionItem(prescription_id: string) {
    try {
        const { data } = await axios.get(`http://localhost:4005/api/payments/prescription/${prescription_id}`);
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

export async function ConfirmPayment(payment_id: string, delivery: boolean, location: string) {
  try {
    const payload = {"delivery":delivery, "location":location};
    const { data } = await axios.patch(`http://localhost:4005/api/payments/pay/${payment_id}`, payload);
    return data;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const body = err.response?.data as any;      // { statusCode, message, error, ... }
      const status = body?.status;                 // 400, 404
      const msg = body?.message;                   // 

      return {"status":status, "msg":msg};
    }
    // Non-Axios error (network, CORS, etc.)
    throw new Error("Network or unexpected error");
  }
}

export async function CancelPayment(payment_id: string) {
  try {
    const { data } = await axios.delete(`http://localhost:4005/api/payments/${payment_id}`);
    return data;
  } catch (e) {
    throw new Error("Failed to create payment: " + e);
  }
}

export function FetchTrackingInfo(tracking_id:string, setTracking:(t: any)=>void) {
  try {
    const eventSource = new EventSource(`http://localhost:4005/api/tracking/stream/${tracking_id}`)

    eventSource.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type === "ping") console.log("ping from backend");
      if (msg.type === 'init' || msg.type === 'update') setTracking(msg.payload);
    };

    eventSource.onerror = () => {
      // browser auto-reconnects; no work needed
    };
    
    return () => {
      eventSource.close(); // <-- CLOSE CONNECTION HERE
      console.log("SSE closed");
    };
  } catch (e) {
    throw new Error("Failed to create payment: " + e);
  }
}

export function IsPaymentExpired(payment_id:string, setPaymentExpired:(t: any)=>void, setTimer:(t: any)=>void, setPrescription_id:(t:any)=>void) {
  try {
    const eventSource = new EventSource(`http://localhost:4005/api/payments/stream/${payment_id}`)

    eventSource.onmessage = (e) => {
      // console.log("message", e);
      const msg = JSON.parse(e.data);
      if (msg.type === "remove") {setPaymentExpired(true); setPrescription_id(msg.payload.prescription_id)}
      if (msg.type === "ping-ttl") {setTimer(msg.payload);}
    };

    eventSource.onerror = () => {
      // browser auto-reconnects; no work needed
    };
    
    return () => {
      eventSource.close(); // <-- CLOSE CONNECTION HERE
      console.log("SSE for IsPaymentExpired was closed");
    };
  } catch (e) {
    throw new Error("Failed to create payment: " + e);
  }
}