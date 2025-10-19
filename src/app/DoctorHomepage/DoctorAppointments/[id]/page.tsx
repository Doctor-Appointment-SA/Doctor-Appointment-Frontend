// ------------------------------------------------------------
// File: src/app/doctor/appointments/[id]/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

// ใช้ type กลาง ถ้ามีไฟล์ src/lib/types.ts อยู่แล้ว ให้ import จากที่นั่นแทน
export type PatientDetails = {
  id: string;
  name: string;
  appointment: { date: string; time: string };
  profilePic?: string;
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

export default function AppointmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [data, setData] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);

  // โหลดจาก mock API
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const res = await fetch(`/mock/patients/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("not-found");
        const d: PatientDetails = await res.json();
        setData(d);
      } catch (e) {
        console.error(e);
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const avatarSrc = data?.profilePic || "https://i.pravatar.cc/160?img=1";

  return (
    <main className="mx-auto max-w-2xl bg-gray-50 px-4 py-6">
      <h1 className="text-xl font-semibold">ข้อมูลคนไข้</h1>

      {loading ? (
        <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-600">
          กำลังโหลด…
        </div>
      ) : !data ? (
        <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-600">
          ไม่พบข้อมูลคนไข้ ID: {String(id)}
        </div>
      ) : (
        <>
          {/* Appointment summary */}
          <section className="mt-4 flex items-center justify-between rounded-2xl bg-blue-300/80 p-4">
            <div>
              <p className="text-base font-medium">{data.name}</p>
              <p className="text-sm text-gray-600">
                {data.appointment.date} • {data.appointment.time}
              </p>
            </div>
            <img
              src={avatarSrc}
              alt="avatar"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white/70 shadow-md"
            />
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
              <p className="whitespace-pre-wrap text-sm text-gray-800">
                {data.notes || "—"}
              </p>
            </Card>

            <p className="text-xs text-gray-500">
              อัปเดตล่าสุด:{" "}
              {data.lastUpdated
                ? new Date(data.lastUpdated).toLocaleString()
                : "—"}
            </p>
          </section>
        </>
      )}

      {/* Bottom actions */}
      <div className="sticky bottom-0 mt-6 flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.08)] backdrop-blur">
        <button
          onClick={() => router.back()}
          className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Back
        </button>
        {data && (
          <button
            onClick={() =>
              router.push(`/DoctorHomepage/DoctorAppointments/${String(id)}/result`)
            }
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Next
          </button>
        )}
      </div>
    </main>
  );
}

/* ---------------- helper components ---------------- */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl bg-white p-4">
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
    <div className="rounded-lg p-3 text-center">
      <div className="text-xs text-gray-500">{label}</div>
      <div className="mt-1 text-base font-semibold text-gray-900">{value}</div>
    </div>
  );
}

function Tags({ items, empty }: { items?: string[]; empty?: string }) {
  if (!items || items.length === 0)
    return <p className="text-sm text-gray-600">{empty || "—"}</p>;
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((t, i) => (
        <span key={i} className="rounded-full px-2 py-1 text-xs text-gray-700">
          {t}
        </span>
      ))}
    </div>
  );
}

function fmtNumber(n?: number, suffix?: string) {
  if (n === null || n === undefined || Number.isNaN(n)) return "-";
  return `${n}${suffix ? " " + suffix : ""}`;
}
