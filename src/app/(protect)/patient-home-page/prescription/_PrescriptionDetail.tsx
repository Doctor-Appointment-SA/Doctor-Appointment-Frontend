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
  form?: string; // medication.description
  unit?: string;
  price?: number;
};
type RxItem = { medicine_id: string; qty: number; note?: string };
type UiRxItemView = {
    medicine_id: string;
    qty: number;
    // enriched (if medication is included)
    name?: string;
    strength?: string;
    form?: string; // medication.description
    unit?: string;
    price?: number;
};
type Rx = {
  id: string;
  doctor_id: string;
  patient_id: string;

  // NEW for header/identity
  doctor_name?: string;
  doctor_lastname?: string;
  patient_name?: string;
  patient_lastname?: string;
  patient_username?: string;

  note?: string;
  status: string;
  total: number;
  createdAt?: string;
  items: UiRxItemView[];
};

/* ========= API ========= */
const API = {
  // only patient flow for fetching:
  latestByPatient: (patientId: string) =>
    `${
      process.env.NEXT_PUBLIC_API_URL_PHA
    }/pharmacy/patients/${encodeURIComponent(patientId)}/prescriptions/latest`,

  // still needed for status updates (uses rx.id returned from latestByPatient)
  rxStatus: (rxId: string) =>
    `${
      process.env.NEXT_PUBLIC_API_URL_PHA
    }/pharmacy/prescriptions/${encodeURIComponent(rxId)}/status`,

  // used to enrich (name/strength/price) for display
  meds: `${process.env.NEXT_PUBLIC_API_URL_PHA}/pharmacy/medicines`,
};

/* ========= HELPERS ========= */
const normalizeStatus = (s?: string) => {
  if (!s) return "ready";
  if (s === "unpaid") return "awaiting_payment"; // backend → UI vocab
  return s as Rx["status"];
};

// UUID v4-ish check (len 36 and hex+hyphens). Adjust if your IDs differ.
const isUuidLike = (v: string) =>
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    v
  );

export default function PrescriptionDetail({
  params,
}: {
  params: { id: string }; // already unwrapped in [id]/page.tsx
}) {
  const patientId = params.id; // route is always patientId now

  /* theme */
  const [theme, setTheme] = useState<ThemeName>("light");
  useEffect(() => {
    const root = document.documentElement;
    const vars = THEMES[theme];
    Object.keys(vars).forEach((k) => root.style.setProperty(k, vars[k]));
  }, [theme]);

  const [rx, setRx] = useState<Rx | null>(null);
  const [loadingRx, setLoadingRx] = useState(true);
  const [meds, setMeds] = useState<Medicine[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [working, setWorking] = useState(false);

  const idLooksValid = isUuidLike(patientId);

  /* fetch LATEST prescription by patientId (single call) */
  useEffect(() => {
    (async () => {
      if (!idLooksValid) {
        console.warn("[prescription] Invalid patient id:", patientId);
        setMsg("Invalid patient id.");
        setLoadingRx(false);
        return;
      }

      setLoadingRx(true);
      setMsg(null);

      try {
        const res = await axios.get<Rx>(API.latestByPatient(patientId));
        setRx({ ...res.data, status: normalizeStatus(res.data.status) });
      } catch (err: any) {
        console.error("Failed fetching latest prescription:", {
          url: API.latestByPatient(patientId),
          message: err?.message,
          status: err?.response?.status,
          data: err?.response?.data,
        });
        setMsg("ไม่พบใบสั่งยาสำหรับผู้ป่วยนี้");
        setRx(null);
      } finally {
        setLoadingRx(false);
      }
    })();
  }, [patientId, idLooksValid]);

  /* fetch medicines to enrich names/prices */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<Medicine[]>(API.meds);
        setMeds(res.data ?? []);
      } catch (e: any) {
        console.error("[prescription] GET /medicines failed:", {
          url: API.meds,
          message: e?.message,
          status: e?.response?.status,
          data: e?.response?.data,
        });
      } finally {
        setLoadingMeds(false);
      }
    })();
  }, []);

  const medMap = useMemo(() => {
    const map = new Map<string, Medicine>();
    meds.forEach((m) => map.set(m.id, m));
    return map;
  }, [meds]);

  const computedTotal = useMemo(() => {
    if (!rx) return 0;
    if (typeof rx.total === "number") return rx.total;
    return rx.items.reduce((sum, it) => {
      const m = medMap.get(it.medicine_id);
      return sum + (m?.price ?? 0) * it.qty;
    }, 0);
  }, [rx, medMap]);

  const colorForStatus = (s?: string) => {
    const n = normalizeStatus(s);
    switch (n) {
      case "ready":
        return "var(--accent)";
      case "awaiting_payment":
        return "#d97706";
      case "paid":
        return "var(--ok)";
      case "cancelled":
        return "var(--danger)";
      default:
        return "var(--muted)";
    }
  };

  const patchStatus = async (status: string) => {
    if (!rx) return;
    setWorking(true);
    setMsg(null);
    try {
      await axios.patch(API.rxStatus(rx.id), { status });
      setRx({ ...rx, status });
      setMsg(
        status === "awaiting_payment"
          ? "สั่งซื้อเรียบร้อย กำลังรอการชำระเงิน ✅"
          : status === "paid"
          ? "ชำระเงินสำเร็จ ✅"
          : "อัปเดตสถานะแล้ว"
      );
    } catch (e: any) {
      setMsg(e?.response?.data?.message ?? "อัปเดตสถานะไม่สำเร็จ");
    } finally {
      setWorking(false);
    }
  };

  // Early UI for invalid patient id
  if (!idLooksValid) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center p-6">
        <div className="max-w-sm text-center">
          <h1 className="text-lg font-semibold mb-2">Prescription</h1>
          <p className="text-sm text-gray-600">
            Invalid patient ID: <code>{patientId}</code>. Use a UUID.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-[100dvh] flex justify-center"
      style={{ background: "var(--bg)" }}
    >
      <div className="w-full max-w-sm pb-24">
        {/* Sticky header */}
        <div className="sticky top-0 z-20 backdrop-blur bg-[color:var(--bg)]/90 border-b">
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-xs" style={{ color: "var(--muted)" }}>
                  {loadingRx ? "Loading…" : "Prescription"}
                </p>
                <h1
                  className="text-lg font-semibold truncate"
                  style={{ color: "var(--primary)" }}
                  title={rx?.id}
                >
                  {rx?.id ?? "—"}
                </h1>
                {/* Patient username on top */}
                <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                  Username: {rx?.patient_username ?? "—"}
                </p>
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

            {/* Names instead of IDs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl border px-3 py-2">
                <label
                  className="block text-[11px]"
                  style={{ color: "var(--muted)" }}
                >
                  Doctor
                </label>
                <div className="text-sm font-medium">
                  {rx?.doctor_name || rx?.doctor_lastname
                    ? `${rx?.doctor_name ?? ""} ${
                        rx?.doctor_lastname ?? ""
                      }`.trim()
                    : "—"}
                </div>
              </div>
              <div className="bg-white rounded-xl border px-3 py-2">
                <label
                  className="block text-[11px]"
                  style={{ color: "var(--muted)" }}
                >
                  Patient
                </label>
                <div className="text-sm font-medium">
                  {rx?.patient_name || rx?.patient_lastname
                    ? `${rx?.patient_name ?? ""} ${
                        rx?.patient_lastname ?? ""
                      }`.trim()
                    : "—"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="px-4 pt-3">
          {/* Status + created */}
          <div
            className="rounded-2xl p-3 shadow-sm mb-3 text-sm flex items-center justify-between"
            style={{ background: "var(--card)" }}
          >
            <span style={{ color: "var(--muted)" }}>
              {rx?.createdAt ? new Date(rx.createdAt).toLocaleString() : ""}
            </span>
            <span
              className="px-2 py-1 rounded-lg border"
              style={{
                color: colorForStatus(rx?.status),
                borderColor: colorForStatus(rx?.status),
              }}
            >
              {normalizeStatus(rx?.status) ?? "—"}
            </span>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl p-3 shadow-sm">
            <p className="font-medium mb-2" style={{ color: "var(--primary)" }}>
              รายการยา
            </p>

            {loadingRx || loadingMeds ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                Loading…
              </p>
            ) : !rx || rx.items.length === 0 ? (
              <p className="text-sm" style={{ color: "var(--muted)" }}>
                ไม่มีรายการ
              </p>
            ) : (
              <div className="space-y-2">
                {rx.items.map((it, idx) => {
                  const m = medMap.get(it.medicine_id);
                  return (
                    <div key={idx} className="border rounded-xl p-2">
                      <div className="flex items-center justify-between">
                        <div className="min-w-0">
                          <p className="text-sm font-medium truncate">
                            {m?.name ?? it.medicine_id}
                          </p>
                          <p
                            className="text-xs truncate"
                            style={{ color: "var(--muted)" }}
                            title={m?.strength || m?.form || ""}
                          >
                            {m?.strength ? `${m.strength} · ` : ""}
                            {m?.form ?? ""}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm">× {it.qty}</p>
                          {typeof m?.price === "number" ? (
                            <p
                              className="text-xs"
                              style={{ color: "var(--muted)" }}
                            >
                              {(m.price ?? 0) * it.qty} บาท
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Total + actions */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-medium">
                รวม: {computedTotal.toFixed(2)} บาท
              </p>

              <div className="flex gap-2">
                {normalizeStatus(rx?.status) !== "paid" && (
                  <button
                    disabled={!rx}
                    onClick={() => {
                      if (!rx) return;
                      // Redirect to a payment page for this prescription
                      window.location.href = `/payment/${rx.id}`;
                    }}
                    className="rounded-xl px-3 py-2 text-sm"
                    style={{
                      background: "var(--btn)",
                      color: "var(--btnText)",
                    }}
                  >
                    Checkout
                  </button>
                )}
              </div>
            </div>

            {msg && (
              <p
                className="text-sm mt-2"
                style={{
                  color: msg.includes("✅") ? "var(--ok)" : "var(--danger)",
                }}
              >
                {msg}
              </p>
            )}
          </div>

          <div className="h-10" />
        </div>
      </div>
    </div>
  );
}
