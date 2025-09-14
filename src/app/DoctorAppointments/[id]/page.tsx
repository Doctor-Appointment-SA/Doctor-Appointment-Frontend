// Fix input widths so they don't overflow into adjacent fields.
// Use flex with basis / flex-1 so inputs share space correctly.

// ------------------------------------------------------------
// File: src/app/doctor/appointments/[id]/page.tsx
"use client";
import { useParams, useRouter } from "next/navigation";

// --- MOCK DATA ONLY (no API) ---
export type PatientDetails = {
  id: string;
  name: string;
  appointment: { date: string; time: string };
  citizenId?: string;
  gender?: string;
  age?: number;
  weight?: number; // kg
  height?: number; // cm
  phone?: string;
  allergies?: string[];
  conditions?: string[];
  address?: string;
  lastUpdated?: string; // ISO date
  notes?: string;
};

const MOCKS: Record<string, PatientDetails> = {
  "1": {
    id: "1",
    name: "คนไข้ เบอร์ 001",
    appointment: { date: "Dec 15, 2025", time: "10:30 AM" },
    citizenId: "1234567890123",
    gender: "ชาย",
    age: 34,
    weight: 68,
    height: 172,
    phone: "081-234-5678",
    allergies: ["เพนนิซิลลิน"],
    conditions: ["เบาหวาน"],
    address: "123/45 บางเขน กรุงเทพฯ",
    lastUpdated: "2025-06-01T10:00:00Z",
    notes: "ปวดหัวเรื้อรังช่วงเช้า ไม่มีไข้",
  },
  "2": {
    id: "2",
    name: "คนไข้ เบอร์ 002",
    appointment: { date: "Dec 15, 2025", time: "10:30 AM" },
    gender: "หญิง",
    age: 29,
    weight: 52,
    height: 160,
    phone: "089-000-1122",
    allergies: [],
    conditions: ["หอบหืด"],
    address: "เมือง เชียงใหม่",
    lastUpdated: "2025-05-20T09:12:00Z",
    notes: "ไอเรื้อรัง 1 สัปดาห์ ไม่มีเสมหะ",
  },
};

export default function AppointmentDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const data = MOCKS[String(id)] || null;


  return (
    <main className="mx-auto max-w-2xl bg-gray-50 px-4 py-6">
      <h1 className="text-xl font-semibold">ข้อมูลคนไข้</h1>

      {!data ? (
        <div className="mt-4 rounded-2xl  bg-white p-4 text-sm text-gray-600">
          ไม่พบข้อมูลคนไข้ ID: {String(id)}
        </div>
      ) : (
        <>
          {/* Appointment summary */}
          <section className="mt-4 rounded-2xl  bg-blue-300/80 p-4">
            <p className="text-base font-medium">{data.name}</p>
            <p className="text-sm text-gray-600">{data.appointment.date} • {data.appointment.time}</p>
          </section>

          {/* Read-only details */}
          <section className="mt-4 grid gap-4">
            <Card title="ข้อมูลทั่วไป">
              <Row label="เลขบัตรประชาชน" value={data.citizenId || "-"} />
              <Row label="เพศ" value={data.gender || "-"} />
              <Row label="อายุ" value={fmtNumber(data.age, "ปี")} />
              <Row label="เบอร์โทร" value={data.phone || "-"} />
              <Row label="ที่อยู่" value={data.address || "-"} />
            </Card>

            <Card title="Vitals">
              <div className="grid grid-cols-3 gap-3">
                <Stat label="น้ำหนัก" value={fmtNumber(data.weight, "กก.")} />
                <Stat label="ส่วนสูง" value={fmtNumber(data.height, "ซม.")} />
              </div>
            </Card>

            <Card title="การแพ้ยา/อาหาร">
              <Tags items={data.allergies} empty="ไม่พบข้อมูล" />
            </Card>

            <Card title="โรคประจำตัว">
              <Tags items={data.conditions} empty="ไม่พบข้อมูล" />
            </Card>

            <Card title="บันทึกจากครั้งก่อน">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{data.notes || "—"}</p>
            </Card>

            <p className="text-xs text-gray-500">อัปเดตล่าสุด: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "—"}</p>
          </section>
        </>
      )}

      {/* Bottom actions */}
      <div className="sticky bottom-0 mt-6 flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.08)] backdrop-blur">
        <button onClick={() => router.back()} className="rounded-lg  px-4 py-2 text-sm font-medium hover:bg-gray-50">Back</button>
        <button onClick={() => router.push(`/DoctorAppointments/${String(id)}/result`)}className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90">Next</button>
      </div>
    </main>
  );
}

/* ---------------- helper components ---------------- */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl  bg-white p-4">
      <h2 className="text-sm font-medium text-gray-800">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-36 shrink-0 text-gray-500">{label}</div>
      <div className="flex-1 text-gray-900">{value}</div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="rounded-lg  p-3 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-base font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function Tags({ items, empty }: { items?: string[]; empty?: string }) {
  if (!items || items.length === 0) return <p className="text-sm text-gray-600">{empty || "—"}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t, i) => (
        <span key={i} className="rounded-full  px-2 py-1 text-xs text-gray-700">{t}</span>
      ))}
    </div>
  );
}

function fmtNumber(n?: number, suffix?: string) {
  if (n === null || n === undefined || Number.isNaN(n)) return "-";
  return `${n}${suffix ? " " + suffix : ""}`;
}
