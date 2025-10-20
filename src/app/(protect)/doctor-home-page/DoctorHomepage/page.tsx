"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/components/authen/AuthProvider";

/** ---------------- Types (match your schema) ---------------- */
type DoctorProfile = {
  id: string;
  specialty?: string | null;
  detail?: string | null;
  user?: {
    name?: string | null;
    lastname?: string | null;
    username?: string | null;
    phone?: string | null;
  } | null;
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
  if (process.env.NEXT_PUBLIC_DOCTOR_ID)
    return process.env.NEXT_PUBLIC_DOCTOR_ID;

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

/** ---------------- Page ---------------- */
export default function DoctorHomepage() {
  const [doctorId, setDoctorId] = useState<string>();
  const [doctorName, setDoctorName] = useState<string | null>(null);

  const [countConfirmed, setCountConfirmed] = useState<number | null>(null);
  const [countPending, setCountPending] = useState<number | null>(null);

  const [err, setErr] = useState<string | null>(null);
  const loading = useMemo(
    () => countConfirmed === null || countPending === null,
    [countConfirmed, countPending]
  );

  const {user} = useAuth();

  
  useEffect(() => {
    (async () => {
      setErr(null);

      try {
        const base = process.env.NEXT_PUBLIC_API_URL_PRO;
        if (!base) throw new Error("NEXT_PUBLIC_API_URL_PRO is not set");

        // 1) หา doctorId
        // const id = await resolveDoctorId(base);
        
        const id = user?.id;
        setDoctorId(id);
        console.log("doctor_id", id);

        // 2) ดึงชื่อหมอ
        if (id) {
          try {
            const res = await fetch(`${base}/api/doctor/${id}`, {
              cache: "no-store",
              credentials: "include",
            });
            if (res.ok) {
              const doc: DoctorProfile = await res.json();
              const nm = [doc.user?.name, doc.user?.lastname]
                .filter(Boolean)
                .join(" ")
                .trim();
              setDoctorName(nm || null);
            }
          } catch {
            /* ไม่เป็นไร */
          }
        }

        // 3) นับจำนวนแต่ละสถานะ (CONFIRMED / PENDING)
        // หมายเหตุ: ถ้า backend มี /appointments/count ให้สลับไปใช้ endpoint นั้นได้
        const nowIso = new Date().toISOString();

        const qsConfirmed = new URLSearchParams();
        qsConfirmed.set("status", "CONFIRMED");
        qsConfirmed.set("dateFrom", nowIso); // เอาเฉพาะนัดในอนาคต
        if (id) qsConfirmed.set("doctorId", id);

        const qsPending = new URLSearchParams();
        qsPending.set("status", "PENDING");
        qsPending.set("dateFrom", nowIso);
        if (id) qsPending.set("doctorId", id);

        const [resC, resP] = await Promise.all([
          fetch(`${base}/appointments?${qsConfirmed.toString()}`),
          fetch(`${base}/appointments?${qsPending.toString()}`),
        ]);

        if (!resC.ok)
          throw new Error(`Fetch confirmed failed (${resC.status})`);
        if (!resP.ok) throw new Error(`Fetch pending failed (${resP.status})`);

        const arrC: unknown[] = await resC.json();
        const arrP: unknown[] = await resP.json();

        setCountConfirmed(arrC.length);
        setCountPending(arrP.length);
      } catch (e: any) {
        console.error(e);
        setErr(e?.message || "โหลดข้อมูลไม่สำเร็จ");
        setCountConfirmed(0);
        setCountPending(0);
      }
    })();
  }, [user]);

  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-gray-50 px-4 py-6">
      <h1 className="text-xl font-semibold">
        Good morning, {doctorName ? `Dr. ${doctorName}` : "Doctor"}
      </h1>

      <section className="mt-4">
        <h2 className="text-sm font-medium text-gray-800">
          Upcoming Appointments
        </h2>
        <StatButton
          className="mt-2"
          title="นัดทั้งหมดที่ยืนยันแล้วของคุณ"
          count={loading ? undefined : countConfirmed ?? 0}
          avatar="👩‍⚕️"
          href={`/doctor-home-page/DoctorHomepage/DoctorAppointments?status=CONFIRMED${
            doctorId ? `&doctorId=${doctorId}` : ""
          }`}
        />
      </section>

      <section className="mt-6">
        <h2 className="text-sm font-medium text-gray-800">
          Pending Appointments
        </h2>
        <StatButton
          className="mt-2"
          title="นัดที่ยังไม่ยืนยัน"
          count={loading ? undefined : countPending ?? 0}
          avatar="👩‍⚕️"
          href={`/doctor-home-page/DoctorHomepage/DoctorAppointments?status=PENDING${
            doctorId ? `&doctorId=${doctorId}` : ""
          }`}
        />
      </section>

      {err && <p className="mt-4 text-sm text-red-600">{err}</p>}

      {/* Dev helper */}
      <p className="mt-6 text-[11px] text-gray-500">
        Using doctorId: {doctorId || "(none)"} — ตั้งชั่วคราว:&nbsp;
        <code>localStorage.setItem("doctorId","YOUR_UUID")</code>
      </p>
    </main>
  );
}

/* ---------------- UI Components ---------------- */
/** ปุ่มการ์ดสไตล์เดิม: พื้นหลังฟ้า มุมโค้ง shadow, วงกลมตัวเลขด้านขวา */
function StatButton({
  title,
  count,
  avatar,
  href,
  className = "",
}: {
  title: string;
  count?: number; // undefined = loading
  avatar?: string; // emoji/ตัวอักษรย่อ
  href: string;
  className?: string;
}) {
  const loading = typeof count === "undefined";
  const { user } = useAuth();

  console.log("user from layout", user);

  return (
    <Link
      href={href}
      className={`block w-full rounded-2xl bg-blue-300/80 px-4 py-3 ring-1 ring-blue-400/50 shadow-sm hover:bg-blue-400/90 active:scale-[0.98] transition ${className}`}
    >
      <div className="flex items-center gap-3 text-gray-900">
        {/* Avatar */}
        <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white/90 text-sm font-semibold text-gray-700">
          {avatar || "👨‍⚕️"}
        </div>

        {/* Title */}
        <div className="flex-1">
          <p className="text-[15px] font-semibold">{title}</p>
        </div>

        {/* Count Badge */}
        <div className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm font-semibold text-gray-900">
          {loading ? "…" : count}
        </div>
      </div>
    </Link>
  );
}
