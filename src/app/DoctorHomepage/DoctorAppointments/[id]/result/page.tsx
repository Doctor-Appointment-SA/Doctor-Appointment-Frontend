// ------------------------------------------------------------
// File: src/app/doctor/appointments/[id]/note/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

type PatientDetails = {
  id: string;
  name: string;
  appointment: { date: string; time: string };
  profilePic?: string;
  citizenId?: string;
  gender?: string;
  age?: number;
  weight?: number;
  height?: number;
  phone?: string;
  allergies?: string[];
  conditions?: string[];
  address?: string;
  lastUpdated?: string; // ISO
  notes?: string;
};

export default function AppointmentNotePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  // form states
  const [fullName, setFullName] = useState("");
  const [caseType, setCaseType] = useState("");
  const [note, setNote] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [sendHome, setSendHome] = useState(false);

  // โหลดข้อมูล mock ตาม id
  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/mock/patients/${id}`, { cache: "no-store" });
        if (!res.ok) throw new Error("not-found");
        const data: PatientDetails = await res.json();
        setPatient(data);

        // ตั้งค่าเริ่มต้นฟอร์มจาก mock
        setFullName(data.name || "");
        setCaseType(data.conditions?.[0] || "ทั่วไป");
        setNote("");
      } catch (e) {
        console.error(e);
        setError("ไม่พบข้อมูลคนไข้");
        setPatient(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  function onConfirm() {
    // DEMO only
    console.log("save note", { id, fullName, caseType, note, followUp, sendHome });
    alert("บันทึกโน้ตเดโม่แล้ว (ยังไม่เชื่อม API)");
    router.push(`/DoctorHomepage/DoctorAppointments/${String(id)}`);
  }

  const disabled = !fullName.trim() || !caseType.trim();

  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-gray-50 px-4 py-6">
      <h1 className="text-xl font-semibold">Good morning, Docta</h1>

      {loading ? (
        <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-600">กำลังโหลด…</div>
      ) : error || !patient ? (
        <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-600">
          {error || `ไม่พบข้อมูลคนไข้ ID: ${String(id)}`}
        </div>
      ) : (
        <>
          {/* สรุปการนัดแบบย่อ */}
          <section className="mt-4 flex items-center justify-between rounded-2xl bg-blue-300/80 p-4">
            <div>
              <p className="text-base font-medium">{patient.name}</p>
              <p className="text-sm text-gray-700">
                {patient.appointment.date} • {patient.appointment.time}
              </p>
            </div>
            <img
              src={patient.profilePic || "https://i.pravatar.cc/160?img=1"}
              alt={patient.name}
              className="h-14 w-14 rounded-full object-cover ring-2 ring-white/70 shadow-md"
            />
          </section>

          {/* ฟอร์มบันทึกโน้ต */}
          <section className="mt-4 rounded-2xl bg-white p-4">
            <h2 className="text-lg font-semibold">Health information</h2>

            <div className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm text-gray-700">Full Name</label>
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Value"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Case</label>
                <input
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value)}
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-gray-700">Medical note</label>
                <textarea
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="บันทึกสั้นๆ"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
          </section>

          
        </>
      )}

      {/* Sticky footer */}
      <div className="sticky bottom-0 mt-6 flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.08)] backdrop-blur">
        <button
          onClick={() => router.back()}
          className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Back
        </button>
        <button
          onClick={onConfirm}
          disabled={disabled}
          className={`rounded-lg px-4 py-2 text-sm font-medium text-white ${
            disabled ? "bg-gray-300 cursor-not-allowed" : "bg-black hover:opacity-90"
          }`}
        >
          Confirm
        </button>
      </div>
    </main>
  );
}
