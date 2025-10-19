"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CalendarCheck, CheckCircle } from "lucide-react";

/** ---------------- Types (match your schema) ---------------- */
type DoctorProfile = {
  id: string;
  specialty?: string | null;
  detail?: string | null;
  user?: { name?: string | null; lastname?: string | null; username?: string | null; phone?: string | null } | null;
};

type RawAppointment = {
  id: string;
  appoint_date: string | null;
  status?: "PENDING" | "CONFIRMED" | "COMPLETE" | "CANCEL";
  doctor?: { id: string; user?: { name?: string; lastname?: string } | null } | null;
  patient?: { id: string; user_patient_idTouser?: { name?: string; lastname?: string } | null } | null;
};

/** ---------------- Helpers ---------------- */
const getFromQuery = (key: string) => {
  if (typeof window === "undefined") return null;
  const v = new URLSearchParams(window.location.search).get(key);
  return v && v.trim() ? v : null;
};

const getFromLocalStorage = (key: string) => {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(key);
    return v && v.trim() ? v : null;
  } catch {
    return null;
  }
};

async function resolveDoctorId(base: string): Promise<string | null> {
  // 1) localStorage
  const fromLS = getFromLocalStorage("doctorId");
  if (fromLS) return fromLS;

  // 2) ?doctorId=
  const fromQuery = getFromQuery("doctorId");
  if (fromQuery) return fromQuery;

  // 3) env
  if (process.env.NEXT_PUBLIC_DOCTOR_ID) return process.env.NEXT_PUBLIC_DOCTOR_ID;

  // 4) session endpoint (ถ้ามี)
  try {
    const me = await fetch(`${base}/doctor/me`, { credentials: "include" });
    if (me.ok) {
      const j: DoctorProfile | { message?: string } = await me.json();
      if ((j as DoctorProfile)?.id) return (j as DoctorProfile).id;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function getPatientName(a: RawAppointment) {
  const u = a.patient?.user ?? a.patient?.user_patient_idTouser;
  const name = [u?.name, u?.lastname].filter(Boolean).join(" ").trim();
  return name || "ไม่ทราบชื่อ";
}

function formatDateTime(iso: string | null) {
  if (!iso) return { date: "-", time: "-" };
  const d = new Date(iso);
  const date = d.toLocaleDateString("th-TH", { month: "short", day: "2-digit" });
  const time = d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" });
  return { date, time };
}

/** ---------------- Page ---------------- */
export default function DoctorHomepage() {
  const [doctorId, setDoctorId] = useState<string | null>(null);
  const [doctorName, setDoctorName] = useState<string | null>(null);

  const [appointments, setAppointments] = useState<RawAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE;
        if (!base) throw new Error("NEXT_PUBLIC_API_BASE is not set");

        // 1) หา doctorId
        const id = await resolveDoctorId(base);
        setDoctorId(id);

        // 2) ดึงชื่อหมอ
        if (id) {
          try {
            const res = await fetch(`${base}/doctor/${id}`, {
              cache: "no-store",
              credentials: "include",
            });
            if (res.ok) {
              const doc: DoctorProfile = await res.json();
              const nm = [doc.user?.name, doc.user?.lastname].filter(Boolean).join(" ").trim();
              setDoctorName(nm || null);
            }
          } catch {
            /* ชื่อไม่มาก็โชว์ 'Doctor' แทนได้ */
          }
        }

        // 3) ดึงนัด
        const qs = new URLSearchParams();
        qs.set("status", "CONFIRMED"); // หรือ "PENDING" ถ้าต้องการนัดรอ หรือ "scheduled" ถ้า backend คุณใช้คำนี้
        qs.set("dateFrom", new Date().toISOString());
        if (id) qs.set("doctorId", id);

        const res2 = await fetch(`${base}/appointments?${qs.toString()}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res2.ok) throw new Error(`Fetch appointments failed (${res2.status})`);
        const data: RawAppointment[] = await res2.json();
        setAppointments(data);
      } catch (e: any) {
        console.error(e);
        setErr(e?.message || "โหลดข้อมูลไม่สำเร็จ");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <main className="mx-auto max-w-2xl bg-gray-50 px-4 py-6">
      <h1 className="text-xl font-semibold">
        Good morning, {doctorName ? `Dr. ${doctorName}` : "Doctor"}
      </h1>

      {/* Action buttons */}
      <div className="mt-3 grid gap-3">
        <ActionCard label="Book Appointment" href="/DoctorAppointments" Icon={CalendarCheck} />
        <ActionCard label="Approve Appointment" href="/DoctorAppointments/approve" Icon={CheckCircle} />
      </div>

      {/* Upcoming Appointments */}
      <section className="mt-4">
        <h2 className="text-sm font-medium text-gray-800">Upcoming Appointments</h2>

        {loading ? (
          <p className="mt-2 text-sm text-gray-500">กำลังโหลด...</p>
        ) : err ? (
          <p className="mt-2 text-sm text-red-600">{err}</p>
        ) : appointments.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">ยังไม่มีนัดข้างหน้า</p>
        ) : (
          <div className="mt-3 grid gap-3">
            {appointments.slice(0, 3).map((a) => {
              const { date, time } = formatDateTime(a.appoint_date);
              return (
                <InfoRow
                  key={a.id}
                  label={getPatientName(a)}
                  sub={`${date} • ${time}`}
                  href={`/DoctorAppointments/${a.id}`}
                />
              );
            })}
          </div>
        )}
      </section>

      {/* Patients (static demo) */}
      <section className="mt-4">
        <h2 className="text-sm font-medium text-gray-800">Patients</h2>
        <div className="mt-3 grid gap-3">
          <InfoRow label="New Patient" count={25} />
          <InfoRow label="ผู้ป่วยส่งต่อ" count={2} />
          <InfoRow label="ประวัติรายการรักษา" color="pink" />
        </div>
      </section>

      {/* Dev helper */}
      <p className="mt-6 text-[11px] text-gray-500">
        Using doctorId: {doctorId || "(none)"} — ตั้งชั่วคราว:&nbsp;
        <code>localStorage.setItem("doctorId","YOUR_UUID")</code>
      </p>
    </main>
  );
}

/* ---------------- UI Components ---------------- */
function ActionCard({ label, href, Icon }: { label: string; href: string; Icon: React.ElementType }) {
  return (
    <Link
      href={href}
      className="block w-full rounded-2xl bg-blue-300/80 px-4 py-3 shadow-sm ring-1 ring-blue-400/50 transition hover:bg-blue-400/90 active:scale-[0.98]"
    >
      <div className="flex items-center justify-center gap-2 text-gray-900">
        <Icon className="h-5 w-5 text-gray-800" />
        <span className="text-[15px] font-semibold">{label}</span>
      </div>
    </Link>
  );
}

function InfoRow({
  label,
  sub,
  count,
  color,
  href,
}: {
  label: string;
  sub?: string;
  count?: number;
  color?: "pink" | undefined;
  href?: string;
}) {
  const colorClass = color === "pink" ? "bg-pink-400/90 ring-pink-300" : "bg-blue-300/80 ring-blue-400/50";

  const content = (
    <div className={`flex items-center justify-between rounded-2xl ${colorClass} px-4 py-3 shadow-sm ring-1`}>
      <div className="flex flex-col">
        <p className="text-[15px] font-semibold text-gray-900">{label}</p>
        {sub && <p className="text-xs text-gray-700">{sub}</p>}
      </div>
      {typeof count === "number" && (
        <div className="grid h-8 w-8 place-items-center rounded-full bg-gray-200 text-sm font-semibold text-gray-700">
          {count}
        </div>
      )}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
