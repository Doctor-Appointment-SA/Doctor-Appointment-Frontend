"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PatientAppointmentCard, {
  PatientAppointment,
} from "@/components/PatientAppointmentCard";
import { getCookie } from "@/lib/authentication";

type RawAppointment = {
  id: string;
  appoint_date: string; // ISO datetime
  status?: string;
  doctor?: { id: string; user?: { name?: string; lastname?: string } };
  patient?: {
    id: string;
    user_patient_idTouser?: {
      name?: string;
      lastname?: string /* avatar_url?: string */;
    };
    // user_patient_hospital_numberTouser?: { ... } // ถ้าต้องใช้ในอนาคต
  };
};

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("คนไข้");
  const [items, setItems] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  // ถ้ารู้ doctorId ของหมอที่ล็อกอิน ให้ใส่เพื่อกรองเฉพาะนัดของหมอคนนั้นได้ (ดึงจาก auth/context ก็ได้)
  const DOCTOR_ID: string | undefined = undefined;

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE;
        if (!base) throw new Error("NEXT_PUBLIC_API_BASE is not set");

        const params = new URLSearchParams();
        params.set("status", "scheduled"); // ดึงเฉพาะนัดที่ยังไม่เสร็จ
        params.set("dateFrom", new Date().toISOString()); // และต้องเป็นอนาคต
        if (DOCTOR_ID) params.set("doctorId", DOCTOR_ID);
          
        const access_token = getCookie("access_token");
        const res = await fetch(`${base}/appointments?${params.toString()}`, {
          cache: "no-store",
          signal: ctrl.signal,
          headers: {
            Authorization: `Bearer ${access_token}`, // <-- your token variable here
          },
        });
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);

        const data: RawAppointment[] = await res.json();

        const mapped: PatientAppointment[] = data.map((a) => {
          const u = a.patient?.user_patient_idTouser;
          const patientName =
            [u?.name, u?.lastname].filter(Boolean).join(" ") || "ไม่ทราบชื่อ";
          const d = new Date(a.appoint_date);

          return {
            id: a.id,
            name: patientName,
            fullDate: d, // เก็บ date จริงไว้
            date: d.toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            }),
            time: d.toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          };
        });

        setItems(mapped);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setErr(e?.message || "โหลดข้อมูลล้มเหลว");
        }
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
  }, [DOCTOR_ID]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return items.filter((it) => {
      const d = new Date(it.fullDate);
      d.setHours(0, 0, 0, 0);

      const sameDay =
        d.getDate() === today.getDate() &&
        d.getMonth() === today.getMonth() &&
        d.getFullYear() === today.getFullYear();

      const inFutureOrToday = d.getTime() >= today.getTime();

      const matchSearch = q ? it.name.toLowerCase().includes(q) : true;
      if (category === "วันนี้") return matchSearch && sameDay;
      if (category === "ทั้งหมด") return matchSearch && inFutureOrToday;
      return matchSearch;
    });
  }, [items, query, category]);

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((x) => x.id !== id));
  }

  return (
    <main className="relative mx-auto min-h-screen max-w-2xl bg-gray-50 px-4 py-6">
      <h1 className="text-xl font-semibold">Good morning, Doctor</h1>

      {/* Search */}
      <div className="mt-3 bg-white">
        <label className="sr-only" htmlFor="search">
          ค้นหาชื่อคนไข้
        </label>
        <input
          id="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ค้นหาชื่อคนไข้"
          className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Category select (ยังไม่ใช้ตัวกรองจริง แต่คง UI ไว้ตามสไตล์เดิม) */}
      <div className="mt-3">
        <label htmlFor="cat" className="mb-1 block text-sm text-gray-700">
          แสดงผล
        </label>
        <select
          id="cat"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="วันนี้">วันนี้</option>
          <option value="ทั้งหมด">ทั้งหมด</option>
        </select>
      </div>

      <h2 className="mt-4 text-sm font-medium text-gray-800">
        Appointment {category}
      </h2>

      {loading ? (
        <p className="mt-3 text-sm text-gray-500">กำลังโหลด…</p>
      ) : err ? (
        <p className="mt-3 text-sm text-red-600">เกิดข้อผิดพลาด: {err}</p>
      ) : filtered.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">ไม่พบนัดในเงื่อนไขนี้</p>
      ) : (
        <div className="mt-3 grid gap-3 pb-20">
          {filtered.map((item) => (
            <PatientAppointmentCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Sticky footer */}
      <div className="fixed bottom-0 mt-6 flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.08)] backdrop-blur">
        <button
          onClick={() => router.back()}
          className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50 active:scale-95"
          type="button"
        >
          Back
        </button>
      </div>
    </main>
  );
}
