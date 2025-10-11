// ================================ Payment =================================
export enum PaymentMethod {
  CREDIT,
  PROMPTPAY,
  BANK,
  CASH,
}

export type Medication = {
  id: string;
  name?: string;
  price?: number | null;
};

export type PrescriptionItem = {
  id: string;
  medication_id: string | null;
  amount: number | null;
  medication?: Medication | null;
};

export type Prescription = {
  id: string;
  patient_id: string | null;
  doctor_id: string | null;
  status: string | null;
  prescription_item: PrescriptionItem[];
};

// ================================ Tracking =================================
export enum TrackingStatus {
  PREPARE = 'PREPARE',
  SENDING = 'SENDING',
  SUCCESS = 'SUCCESS',
}

export type Tracking = {
  id: string;
  payment_id: string;
  status: TrackingStatus;
  location: string;
}