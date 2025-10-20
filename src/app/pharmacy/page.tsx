"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

/* ========= THEME TOKENS ========= */
type ThemeName = "light" | "indigo" | "emerald";
const THEMES: Record<ThemeName, Record<string, string>> = {
  light: {
    "--bg": "#f5f6fa",
    "--card": "#e7f0ff",
    "--primary": "#111827",
    "--muted": "#6b7280",
    "--accent": "#2563eb",
    "--accent-2": "#1f2937",
    "--ok": "#059669",
    "--danger": "#ef4444",
    "--btn": "#111827",
    "--btnText": "#ffffff",
  },
  indigo: {
    "--bg": "#f6f7ff",
    "--card": "#dfe4ff",
    "--primary": "#111827",
    "--muted": "#6b6e99",
    "--accent": "#4f46e5",
    "--accent-2": "#312e81",
    "--ok": "#16a34a",
    "--danger": "#ef4444",
    "--btn": "#4f46e5",
    "--btnText": "#ffffff",
  },
  emerald: {
    "--bg": "#f4fbf7",
    "--card": "#dff7ea",
    "--primary": "#0b3b2e",
    "--muted": "#5b746b",
    "--accent": "#059669",
    "--accent-2": "#064e3b",
    "--ok": "#059669",
    "--danger": "#ef4444",
    "--btn": "#059669",
    "--btnText": "#ffffff",
  },
};

/* ========= TYPES ========= */
type Medicine = {
  id: string;
  name: string;
  strength?: string;
  form?: string;
  stock?: number;
  unit?: string;
  price?: number;
};
type CartItem = { medicine: Medicine; qty: number; note?: string };

/* ========= API ========= */
const API_BASE = "http://localhost:3001";
const API = {
  context: `${API_BASE}/pharmacy/context`, // NEW: doctor/patient from backend
  medicines: `${API_BASE}/pharmacy/medicines`,
  createPrescription: `${API_BASE}/pharmacy/prescriptions`,
};

export default function PharmacyPage() {
  /* theme */
  const [theme, setTheme] = useState<ThemeName>("light");
  useEffect(() => {
    const root = document.documentElement;
    const vars = THEMES[theme];
    Object.keys(vars).forEach((k) => root.style.setProperty(k, vars[k]));
  }, [theme]);

  /* IDs from backend (read-only) */
  const [doctorId, setDoctorId] = useState<string>("");
  const [patientId, setPatientId] = useState<string>("");
  const [ctxLoading, setCtxLoading] = useState(true);

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

  /* fetch context (doctor/patient) */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<{ doctor_id: string; patient_id: string }>(API.context);
        setDoctorId(res.data.doctor_id);
        setPatientId(res.data.patient_id);
      } catch (e) {
        console.error("context fetch failed", e);
        // fallback demo values so UI still works
        setDoctorId("doc_demo_public");
        setPatientId("pat_demo_001");
      } finally {
        setCtxLoading(false);
      }
    })();
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
      [m.name, m.strength, m.form].filter(Boolean).some((s) =>
        String(s).toLowerCase().includes(q)
      )
    );
  }, [allMeds, query]);

  const total = useMemo(
    () => items.reduce((s, it) => s + (it.medicine.price ?? 0) * it.qty, 0),
    [items]
  );

  const add = (m: Medicine) =>
    setItems((curr) => {
      const ex = curr.find((c) => c.medicine.id === m.id);
      if (ex) return curr.map((c) => (c.medicine.id === m.id ? { ...c, qty: c.qty + 1 } : c));
      return [...curr, { medicine: m, qty: 1 }];
    });

  const setQty = (id: string, qty: number) =>
    setItems((curr) =>
      qty <= 0 ? curr.filter((c) => c.medicine.id !== id)
        : curr.map((c) => (c.medicine.id === id ? { ...c, qty } : c))
    );

  const submit = async () => {
    setMsg(null);
    if (ctxLoading) return; // wait until IDs loaded
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
      await axios.post(API.createPrescription, payload);
      setMsg("ส่งใบสั่งยาเรียบร้อย ✅");
      setItems([]);
      setGlobalNote("");
      setFollowUp(false);
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? "ส่งไม่สำเร็จ");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex justify-center" style={{ background: "var(--bg)" }}>
      <div className="w-full max-w-sm pb-24">
        {/* ===== Sticky Header: IDs + Theme (read-only) ===== */}
        <div className="sticky top-0 z-20 backdrop-blur bg-[color:var(--bg)]/90 border-b">
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>Good morning,</p>
                <h1 className="text-lg font-semibold" style={{ color: "var(--primary)" }}>
                  Docta
                </h1>
              </div>
              <select
                className="text-xs rounded-lg border px-2 py-1"
                value={theme}
                onChange={(e) => setTheme(e.target.value as ThemeName)}
              >
                <option value="light">Light</option>
                <option value="indigo">Indigo</option>
                <option value="emerald">Emerald</option>
              </select>
            </div>

            {/* Doctor/Patient IDs from backend */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl border px-3 py-2">
                <label className="block text-[11px]" style={{ color: "var(--muted)" }}>
                  Doctor ID
                </label>
                <div className="text-sm font-medium">
                  {ctxLoading ? "Loading…" : doctorId}
                </div>
              </div>
              <div className="bg-white rounded-xl border px-3 py-2">
                <label className="block text-[11px]" style={{ color: "var(--muted)" }}>
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
            <label className="block text-[11px] mb-1" style={{ color: "var(--muted)" }}>
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
              <div className="text-sm" style={{ color: "var(--muted)" }}>
                Loading medicines…
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-sm" style={{ color: "var(--muted)" }}>
                ไม่มียาตรงกับ “{query}”
              </div>
            ) : (
              filtered.map((m) => (
                <div
                  key={m.id}
                  className="w-full rounded-2xl p-3 flex items-start justify-between"
                  style={{ background: "var(--card)" }}
                >
                  <div className="min-w-0">
                    <p className="font-medium" style={{ color: "var(--primary)" }}>
                      {m.name}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {m.strength ? `${m.strength} · ` : ""}{m.form ?? ""}
                    </p>
                    <p className="text-xs" style={{ color: "var(--muted)" }}>
                      {typeof m.price === "number" ? `ราคา ${m.price} บาท` : ""}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs rounded-xl px-2 py-1 bg-white/90 border">
                      {m.stock ?? 0} {m.unit ?? ""}
                    </span>
                    <button
                      onClick={() => add(m)}
                      className="rounded-xl px-3 py-1.5 text-xs"
                      style={{ background: "var(--btn)", color: "var(--btnText)" }}
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
              <p className="font-medium" style={{ color: "var(--primary)" }}>Prescription</p>
              <span className="text-sm" style={{ color: "var(--muted)" }}>
                {items.length} รายการ
              </span>
            </div>

            {items.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                ยังไม่ได้เลือกยา กด “Add” ที่รายการด้านบน
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((it) => (
                  <div key={it.medicine.id} className="border rounded-xl p-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-medium">{it.medicine.name}</p>
                        <p className="text-xs" style={{ color: "var(--muted)" }}>
                          {it.medicine.strength ?? ""} {it.medicine.form ? `· ${it.medicine.form}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          min={1}
                          className="w-16 rounded-lg border px-2 py-1 text-sm"
                          value={it.qty}
                          onChange={(e) =>
                            setQty(it.medicine.id, Math.max(1, Math.floor(Number(e.target.value) || 1)))
                          }
                        />
                        <button
                          onClick={() => setQty(it.medicine.id, 0)}
                          className="text-xs px-2 py-1 rounded-lg"
                          style={{ background: "#eee" }}
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
                      className="rounded-xl px-3 py-2 text-sm border"
                      style={{ color: "var(--muted)", background: "#fff" }}
                      onClick={() => setItems([])}
                    >
                      Nah, No Med
                    </button>
                    <button
                      disabled={submitting || ctxLoading || items.length === 0}
                      onClick={submit}
                      className="rounded-xl px-4 py-2 text-sm"
                      style={{ background: "var(--btn)", color: "var(--btnText)", opacity: (submitting || ctxLoading || items.length === 0) ? 0.6 : 1 }}
                    >
                      {submitting ? "Saving…" : "Confirm"}
                    </button>
                  </div>
                </div>
                {msg && (
                  <p className="text-sm mt-1" style={{ color: msg.includes("✅") ? "var(--ok)" : "var(--danger)" }}>
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
