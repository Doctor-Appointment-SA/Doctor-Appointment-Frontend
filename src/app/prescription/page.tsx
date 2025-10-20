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
  unit?: string;
  price?: number;
};
type RxItem = { medicine_id: string; qty: number; note?: string };
type Rx = {
  id: string;
  doctor_id: string;
  patient_id: string;
  note?: string;
  items: RxItem[];
  status?: "ready" | "awaiting_payment" | "paid" | "cancelled" | string;
  total?: number;
  createdAt?: string;
};

/* ========= API ========= */
const API_BASE = "http://localhost:3001";
const API = {
  rx: (id: string) => `${API_BASE}/pharmacy/prescriptions/${id}`,
  rxStatus: (id: string) => `${API_BASE}/pharmacy/prescriptions/${id}/status`,
  meds: `${API_BASE}/pharmacy/medicines`,
};

export default function PrescriptionDetail({
  params,
}: {
  params: { id: string };
}) {
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

  /* fetch prescription */
  useEffect(() => {
    (async () => {
      setLoadingRx(true);
      try {
        const res = await axios.get<Rx>(API.rx(params.id));
        setRx(res.data);
      } catch (e) {
        console.error(e);
        setMsg("ไม่พบใบสั่งยา");
      } finally {
        setLoadingRx(false);
      }
    })();
  }, [params.id]);

  /* fetch medicines to enrich names/prices */
  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get<Medicine[]>(API.meds);
        setMeds(res.data ?? []);
      } catch (e) {
        console.error(e);
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
    return rx.items.reduce((sum, it) => {
      const m = medMap.get(it.medicine_id);
      return sum + (m?.price ?? 0) * it.qty;
    }, 0);
  }, [rx, medMap]);

  const colorForStatus = (s?: string) => {
    switch (s) {
      case "ready":
        return "var(--accent)";
      case "awaiting_payment":
        return "#d97706"; // amber
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

            {/* IDs */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl border px-3 py-2">
                <label
                  className="block text-[11px]"
                  style={{ color: "var(--muted)" }}
                >
                  Doctor ID
                </label>
                <div className="text-sm font-medium">
                  {rx?.doctor_id ?? "—"}
                </div>
              </div>
              <div className="bg-white rounded-xl border px-3 py-2">
                <label
                  className="block text-[11px]"
                  style={{ color: "var(--muted)" }}
                >
                  Patient ID
                </label>
                <div className="text-sm font-medium">
                  {rx?.patient_id ?? "—"}
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
              style={{ color: colorForStatus(rx?.status), borderColor: colorForStatus(rx?.status) }}
            >
              {rx?.status ?? "—"}
            </span>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl p-3 shadow-sm">
            <p
              className="font-medium mb-2"
              style={{ color: "var(--primary)" }}
            >
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
                          {it.note ? (
                            <p className="text-xs mt-1" style={{ color: "var(--muted)" }}>
                              Note: {it.note}
                            </p>
                          ) : null}
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-sm">× {it.qty}</p>
                          <p className="text-xs" style={{ color: "var(--muted)" }}>
                            {(m?.price ?? 0) * it.qty} บาท
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Note */}
            {rx?.note ? (
              <div className="mt-3 rounded-xl border px-3 py-2 text-sm">
                <span className="text-xs" style={{ color: "var(--muted)" }}>
                  Instruction:
                </span>{" "}
                {rx.note}
              </div>
            ) : null}

            {/* Total + actions */}
            <div className="mt-3 flex items-center justify-between">
              <p className="text-sm font-medium">
                รวม: {(rx?.total ?? computedTotal).toFixed(2)} บาท
              </p>
              <div className="flex gap-2">
                {rx?.status !== "awaiting_payment" && rx?.status !== "paid" && (
                  <button
                    disabled={working || !rx}
                    onClick={() => patchStatus("awaiting_payment")}
                    className="rounded-xl px-3 py-2 text-sm"
                    style={{
                      background: "var(--btn)",
                      color: "var(--btnText)",
                      opacity: working ? 0.6 : 1,
                    }}
                  >
                    Checkout
                  </button>
                )}
                {rx?.status === "awaiting_payment" && (
                  <button
                    disabled={working || !rx}
                    onClick={() => patchStatus("paid")}
                    className="rounded-xl px-3 py-2 text-sm border"
                    style={{ background: "#fff" }}
                  >
                    Mark as Paid
                  </button>
                )}
              </div>
            </div>

            {msg && (
              <p className="text-sm mt-2"
                style={{ color: msg.includes("✅") ? "var(--ok)" : "var(--danger)" }}>
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
