"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PatientAppointmentCard, {
  PatientAppointment,
} from "@/components/PatientAppointmentCard";
import { getCookie } from "@/lib/authentication";
import { useAuth } from "@/components/authen/AuthProvider";

type RawAppointment = {
  id: string;
  appoint_date: string;
  status?: string;
  doctor?: { id: string; user?: { name?: string; lastname?: string } };
  patient?: {
    id: string;
    user_patient_idTouser?: {
      name?: string;
      lastname?: string;
    };
  };
};

function startOfTodayLocalISO() {
  return new Date(new Date().setHours(0, 0, 0, 0)).toISOString();
}

export default function DoctorAppointmentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"วันนี้" | "ทั้งหมด">("คนไข้" as any); // คง UI เดิม; filter ใช้จริงด้านล่าง
  const [items, setItems] = useState<PatientAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const ctrl = new AbortController();
    (async () => {
      setErr(null);
      setLoading(true);
      setItems([]); // กันค้างรายการของหมอเก่า

      try {
        const base = process.env.NEXT_PUBLIC_API_URL_PRO;
        if (!base) throw new Error("NEXT_PUBLIC_API_URL_PRO is not set");

        // read token inside effect
        const access_token = getCookie("access_token");

        // 1) หา doctorId ปัจจุบัน: ?doctorId -> user.id -> /doctor/me
        let doctorId: string | undefined =
          (searchParams.get("doctorId") || undefined) ??
          (user?.id || undefined);

        if (!doctorId) {
          const me = await fetch(`${base}/doctor/me`, {
            credentials: "include",
            headers: access_token
              ? { Authorization: `Bearer ${access_token}` }
              : {},
            signal: ctrl.signal,
            cache: "no-store",
          });
          if (me.ok) {
            const j = await me.json();
            if (j?.id) doctorId = j.id;
          }
        }

        // 2) query params
        const params = new URLSearchParams();
        const dateFrom = startOfTodayLocalISO(); // รวมทั้งวันของวันนี้เป็นต้นไป
        params.set("dateFrom", dateFrom);
        if (doctorId) params.set("doctorId", doctorId);

        // ถ้ามี status ใน URL ให้ส่งตามนั้น (เช่น CONFIRMED/PENDING)
        const statusParam = searchParams.get("status");
        if (statusParam) params.set("status", statusParam.toUpperCase());

        // เผื่อ BE มีหน้า/จำนวน ให้ขอดึงเยอะหน่อย
        params.set("take", "9999");
        params.set("_ts", String(Date.now())); // กัน cache

        const res = await fetch(`${base}/appointments?${params.toString()}`, {
          cache: "no-store",
          signal: ctrl.signal,
          headers: access_token
            ? { Authorization: `Bearer ${access_token}` }
            : {},
        });
        if (!res.ok) throw new Error(`Fetch failed (${res.status})`);

        const data: RawAppointment[] = await res.json();

        const mapped: PatientAppointment[] = data.map((a) => {
          const u = a.patient?.user_patient_idTouser;
          const name = [u?.name, u?.lastname].filter(Boolean).join(" ") || "ไม่ทราบชื่อ";

          const d = new Date(a.appoint_date);
          return {
            id: a.id,
            name,
            fullDate: d,
            date: d.toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "2-digit",
              timeZone: "UTC",
            }),
            time: d.toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
              timeZone: "UTC",
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
  }, [user?.id, searchParams]);

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

      {/* Category */}
      <div className="mt-3">
        <label htmlFor="cat" className="mb-1 block text-sm text-gray-700">
          แสดงผล
        </label>
        <select
          id="cat"
          value={category}
          onChange={(e) => setCategory(e.target.value as "วันนี้" | "ทั้งหมด")}
          className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="ทั้งหมด">ทั้งหมด</option>
          <option value="วันนี้">วันนี้</option>
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
