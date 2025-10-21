"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { getCookie } from "@/lib/authentication";
import { useAuth } from "@/components/authen/AuthProvider";

/* =========================
 * Types
 * ========================= */
type PatientProfile = {
  id: string;
  user?: { name?: string | null; lastname?: string | null } | null;
};

type RawAppointment = {
  id: string;
  appoint_date: string; // ISO (UTC)
  status?: string | null;
  doctor?: {
    id: string;
    user?: { name?: string | null; lastname?: string | null } | null;
  } | null;
};

/* =========================
 * Helpers
 * ========================= */
const startOfTodayLocalISO = () =>
  new Date(new Date().setHours(0, 0, 0, 0)).toISOString();

const formatDateTH = (isoUTC: string) =>
  new Date(isoUTC).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    timeZone: "Asia/Bangkok",
  });

const formatTimeTH = (isoUTC: string) =>
  new Date(isoUTC).toLocaleTimeString("th-TH", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Asia/Bangkok",
  });

const buildHeaders = (token?: string | null) =>
  token ? { Authorization: `Bearer ${token}` } : undefined;

/* =========================
 * Page
 * ========================= */
export default function PatientHomePage() {
  const router = useRouter();
  const { user } = useAuth();

  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [appointments, setAppointments] = useState<RawAppointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const base = process.env.NEXT_PUBLIC_API_BASE;

  useEffect(() => {
    if (!base) {
      setErr("NEXT_PUBLIC_API_BASE is not set");
      setLoading(false);
      return;
    }

    const ctrl = new AbortController();

    const loadData = async () => {
      try {
        setLoading(true);
        setErr(null);

        const token = getCookie("access_token");

        // หา patientId
        let patientId: string | undefined = user?.id || undefined;
        if (!patientId) {
          const res = await fetch(`${base}/patient/me`, {
            credentials: "include",
            headers: buildHeaders(token),
            signal: ctrl.signal,
            cache: "no-store",
          });
          if (res.ok) {
            const pj = (await res.json()) as PatientProfile;
            if (pj?.id) patientId = pj.id;
            setPatient(pj ?? null);
          }
        } else {
          setPatient((p) => p ?? { id: patientId! });
        }

        // ดึงนัดวันนี้+
        const qs = new URLSearchParams();
        qs.set("dateFrom", startOfTodayLocalISO());
        if (patientId) qs.set("patientId", patientId);
        qs.set("take", "9999");
        qs.set("_ts", String(Date.now()));

        const apptRes = await fetch(`${base}/appointments?${qs}`, {
          cache: "no-store",
          signal: ctrl.signal,
          headers: buildHeaders(token),
        });
        if (!apptRes.ok)
          throw new Error(`Load appointments failed (${apptRes.status})`);

        const appts: RawAppointment[] = await apptRes.json();
        setAppointments(appts);
      } catch (e: any) {
        if (e?.name !== "AbortError") {
          console.error(e);
          setErr(e?.message || "โหลดข้อมูลไม่สำเร็จ");
        }
      } finally {
        setLoading(false);
      }
    };

    loadData();
    return () => ctrl.abort();
  }, [user?.id, base]);

  const upcomingSorted = useMemo(
    () =>
      [...appointments].sort(
        (a, b) =>
          new Date(a.appoint_date).getTime() -
          new Date(b.appoint_date).getTime()
      ),
    [appointments]
  );

  const greetingName = useMemo(() => {
    const nm = [patient?.user?.name, patient?.user?.lastname]
      .filter(Boolean)
      .join(" ")
      .trim();
    return nm || "Patient";
  }, [patient]);

  /* =========================
   * UI
   * ========================= */
  return (
    <main className="relative mx-auto min-h-screen max-w-2xl bg-gray-50 px-4 py-6">
      {/* Greeting */}
      <h1 className="text-xl font-semibold">Good morning, {greetingName}</h1>

      {/* Buttons */}
      <div className="mt-4 grid gap-4">
        <button
          onClick={() => router.push("/patient-appointment")}
          className="w-full rounded-xl bg-[#8BC3FF] px-4 py-4 text-center text-sm font-medium text-white shadow-sm hover:opacity-95 active:scale-[0.99]"
        >
          ทำรายการ
        </button>
        <button
          onClick={() => router.push("/patient-appointment")}
          className="w-full rounded-xl bg-[#8BC3FF] px-4 py-4 text-center text-sm font-medium text-white shadow-sm hover:opacity-95 active:scale-[0.99]"
        >
          Tracking medicine
        </button>
      </div>

      {/* Appointments */}
      <section className="mt-6">
        <h2 className="text-sm font-medium text-gray-800">
          Upcoming Appointments
        </h2>

        {loading ? (
          <p className="mt-3 text-sm text-gray-500">กำลังโหลด…</p>
        ) : err ? (
          <p className="mt-3 text-sm text-red-600">เกิดข้อผิดพลาด: {err}</p>
        ) : upcomingSorted.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">ไม่มีนัดในอนาคต</p>
        ) : (
          <div className="mt-3 grid gap-3">
            {upcomingSorted.map((a) => {
              const doctorName =
                [a.doctor?.user?.name, a.doctor?.user?.lastname]
                  .filter(Boolean)
                  .join(" ")
                  .trim() || "Unknown doctor";

              return (
                <div
                  key={a.id}
                  className="flex items-center gap-3 rounded-2xl bg-[#8BC3FF] px-4 py-3 text-gray-900 shadow-sm"
                >
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-white/90 text-lg">
                    🧑
                  </div>

                  <div className="flex-1">
                    <p className="text-[15px] font-semibold">
                      Dr. {doctorName}
                    </p>
                    <div className="mt-1 flex items-center gap-6 text-xs text-gray-800">
                      <span>{formatDateTH(a.appoint_date)}</span>
                      <span>{formatTimeTH(a.appoint_date)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Sticky Back Button */}
      <div className="fixed bottom-0 mt-6 flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.08)] backdrop-blur">
        <button
          // onClick={() => }
          className="rounded-lg px-6 py-3 text-sm font-medium bg-[#8BC3FF] "
          type="button"
        >
          ชำระเงิน
        </button>
      </div>
    </main>
  );
}
