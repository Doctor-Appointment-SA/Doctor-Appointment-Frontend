"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { getCookie } from "@/lib/authentication";

/* ========= TYPES ========= */
type Medicine = {
  id: string;
  name: string;
  strength?: string;
  form?: string;
  unit?: string;
  price?: number;
};
type CartItem = { medicine: Medicine; qty: number; note?: string };

/* ========= API ========= */
// src/app/pharmacy/page.tsx
const API = {
  context: `${process.env.NEXT_PUBLIC_API_URL_PHA}/pharmacy/context`,
  medicines: `${process.env.NEXT_PUBLIC_API_URL_PHA}/pharmacy/medicines`,
  createPrescription: `${process.env.NEXT_PUBLIC_API_URL_PHA}/pharmacy/prescriptions`,
};

export default function PharmacyPage() {
  /* IDs from backend (read-only) */
  const [doctorId, setDoctorId] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [ctxLoading, setCtxLoading] = useState(false);

  /* data */
  const [query, setQuery] = useState("");
  const [allMeds, setAllMeds] = useState<Medicine[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(true);

  /* cart */
  const [items, setItems] = useState<CartItem[]>([]);
  const [globalNote, setGlobalNote] = useState("");
  const [followUp, setFollowUp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const params = useSearchParams();
  const patient_id = params.get("patient_id") || "";
  const doctor_id = params.get("doctor_id") || "";

  console.log("patient_id", patient_id);
  /* fetch context (doctor/patient) */
  useEffect(() => {
    //   try {
    //     const res = await axios.get<{ doctor_id: string; patient_id: string }>(
    //       API.context
    //     );
    //     setDoctorId(res.data.doctor_id);
    //     setPatientId(res.data.patient_id);
    //   } catch (e) {
    //     console.error("context fetch failed", e);
    //     // fallback demo values so UI still works
    //     setDoctorId("doc_demo_public");
    //     setPatientId("pat_demo_001");
    //   } finally {
    //     setCtxLoading(false);
    //   }
    // })();
    setDoctorId(doctor_id);
    setPatientId(patient_id);
  }, []);

  /* fetch medicines */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<Medicine[]>(API.medicines);
        setAllMeds(res.data ?? []);
      } catch (e) {
        console.error("fetch medicines failed", e);
        setAllMeds([]);
      } finally {
        setLoadingMeds(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allMeds;
    return allMeds.filter((m) =>
      [m.name, m.strength, m.form]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q))
    );
  }, [allMeds, query]);

  const total = useMemo(
    () => items.reduce((s, it) => s + (it.medicine.price ?? 0) * it.qty, 0),
    [items]
  );

  const add = (m: Medicine) =>
    setItems((curr) => {
      const ex = curr.find((c) => c.medicine.id === m.id);
      if (ex)
        return curr.map((c) =>
          c.medicine.id === m.id ? { ...c, qty: c.qty + 1 } : c
        );
      return [...curr, { medicine: m, qty: 1 }];
    });

  const setQty = (id: string, qty: number) =>
    setItems((curr) =>
      qty <= 0
        ? curr.filter((c) => c.medicine.id !== id)
        : curr.map((c) =>
            c.medicine.id === id ? { ...c, qty: Math.floor(qty) } : c
          )
    );

  const router = useRouter();
  const submit = async () => {
    setMsg(null);

    if (!patientId.trim()) return setMsg("ไม่พบ Patient ID");
    if (items.length === 0) return setMsg("ยังไม่ได้เลือกยา");

    setSubmitting(true);
    try {
      const payload = {
        doctor_id: doctorId,
        patient_id: patientId,
        note: globalNote + (followUp ? " | นัดครั้งถัดไป" : ""),
        items: items.map((it) => ({
          medicine_id: it.medicine.id,
          qty: it.qty,
          note: it.note,
        })),
      };

      // attach token only if available; still send even if missing
      const token = getCookie("access_token");
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      if (token) headers.Authorization = `Bearer ${token}`;

      await axios.post(API.createPrescription, payload, { headers });

      // success UI
      setMsg("ส่งใบสั่งยาเรียบร้อย ✅");
      setItems([]);
      setGlobalNote("");
      setFollowUp(false);

      router.push(`/doctor-home-page/doctor-make-appointment?patient_id=${patient_id}`);
    } catch (e: any) {
      // show backend’s reason
      const status = e?.response?.status;
      if (status === 401)
        setMsg("ถูกปฏิเสธโดยเซิร์ฟเวอร์: ต้องเข้าสู่ระบบ (401)");
      else if (status === 403)
        setMsg("ถูกปฏิเสธโดยเซิร์ฟเวอร์: ไม่มีสิทธิ์ (403)");
      else setMsg(e?.response?.data?.message ?? "ส่งไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex justify-center bg-slate-50">
      <div className="w-full max-w-sm pb-24">
        {/* ===== Sticky Header: IDs (read-only) ===== */}
        <div className="sticky top-0 z-20 backdrop-blur bg-slate-50/90 border-b">
          <div className="px-4 pt-4 pb-3">
            <div className="mb-2">
              <p className="text-xs text-gray-500">Good morning,</p>
              <h1 className="text-lg font-semibold text-slate-900">Docta</h1>
            </div>

            {/* Doctor/Patient IDs from backend */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl border px-3 py-2">
                <label className="block text-[11px] text-gray-500">
                  Doctor ID
                </label>
                <div className="text-sm font-medium">
                  {ctxLoading ? "Loading…" : doctorId}
                </div>
              </div>
              <div className="bg-white rounded-xl border px-3 py-2">
                <label className="block text-[11px] text-gray-500">
                  Patient ID
                </label>
                <div className="text-sm font-medium">
                  {ctxLoading ? "Loading…" : patientId}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Body ===== */}
        <div className="px-4 pt-3">
          {/* Search */}
          <div className="bg-white rounded-2xl p-3 shadow-sm mb-3">
            <label className="block text-[11px] mb-1 text-gray-500">
              Search Medicines
            </label>
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm"
              placeholder="Paracetamol, 500 mg, tablet…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          {/* Medicine list with explicit Add button */}
          <div className="space-y-3">
            {loadingMeds ? (
              <div className="text-sm text-gray-500">Loading medicines…</div>
            ) : filtered.length === 0 ? (
              <div className="text-sm text-gray-500">
                ไม่มียาตรงกับ “{query}”
              </div>
            ) : (
              filtered.map((m) => (
                <div
                  key={m.id}
                  className="w-full rounded-2xl p-3 flex items-start justify-between bg-indigo-50"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-slate-900">{m.name}</p>
                    <p className="text-xs text-gray-600">
                      {m.strength ? `${m.strength} · ` : ""}
                      {m.form ?? ""}
                    </p>
                    <p className="text-xs text-gray-600">
                      {typeof m.price === "number" ? `ราคา ${m.price} บาท` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs rounded-xl px-2 py-1 bg-white/90 border text-gray-700">
                      {m.unit ?? ""}
                    </span>
                    <button
                      onClick={() => add(m)}
                      className="rounded-xl px-3 py-1.5 text-xs bg-slate-900 text-white"
                    >
                      Add
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Cart */}
          <div className="mt-4 bg-white rounded-2xl p-3 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-slate-900">Prescription</p>
              <span className="text-sm text-gray-500">
                {items.length} รายการ
              </span>
            </div>

            {items.length === 0 ? (
              <p className="text-sm text-gray-500">
                ยังไม่ได้เลือกยา กด “Add” ที่รายการด้านบน
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.medicine.id} className="border rounded-xl p-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">
                          {it.medicine.name}
                        </p>
                        <p className="text-xs text-gray-600">
                          {it.medicine.strength ?? ""}
                          {it.medicine.form ? ` · ${it.medicine.form}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          className="w-16 rounded-lg border px-2 py-1 text-sm"
                          value={it.qty}
                          onChange={(e) =>
                            setQty(
                              it.medicine.id,
                              Math.max(
                                1,
                                Math.floor(Number(e.target.value) || 1)
                              )
                            )
                          }
                        />
                        <button
                          onClick={() => setQty(it.medicine.id, 0)}
                          className="text-xs px-2 py-1 rounded-lg bg-gray-200"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                <label className="mt-2 flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={followUp}
                    onChange={(e) => setFollowUp(e.target.checked)}
                  />
                  นัดครั้งถัดไป
                </label>

                <textarea
                  className="mt-2 w-full rounded-xl border px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Global instruction…"
                  value={globalNote}
                  onChange={(e) => setGlobalNote(e.target.value)}
                />

                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">
                    รวม: {total.toFixed(2)} บาท
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="rounded-xl px-3 py-2 text-sm border text-gray-600 bg-white"
                      onClick={() => setItems([])}
                    >
                      Nah, No Med
                    </button>
                    <button
                      disabled={submitting || ctxLoading || items.length === 0}
                      onClick={submit}
                      className="rounded-xl px-4 py-2 text-sm bg-slate-900 text-white disabled:opacity-60"
                    >
                      {submitting ? "Saving…" : "Confirm"}
                    </button>
                  </div>
                </div>
                {msg && (
                  <p
                    className={`text-sm mt-1 ${
                      msg.includes("✅") ? "text-emerald-600" : "text-red-600"
                    }`}
                  >
                    {msg}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="h-10" />
        </div>
      </div>
    </div>
  );
}
