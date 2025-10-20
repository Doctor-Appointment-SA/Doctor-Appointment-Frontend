"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

/* ---------- Types ---------- */
type Medicine = {
  id: string;
  name: string;
  strength?: string;   // e.g., "500 mg"
  form?: string;       // e.g., "tablet", "syrup"
  stock?: number;
  unit?: string;       // e.g., "tab", "ml"
  price?: number;      // optional, if your API returns it
};

type CartItem = {
  medicine: Medicine;
  qty: number;
  note?: string;       // e.g., usage instruction per med
};

type WhoAmI = { id: string; role?: string; name?: string } | null;

/* ---------- Config: adjust to your backend ---------- */
// Example endpoints — change to match your backend routes.
const API = {
  whoAmI: "/mock/whoami",
  medicines: "/mock/medicines",
  createPrescription: "/mock/prescriptions",
};


export default function PharmacyPage() {
  /* ---------- Auth / doctor ---------- */
  const [doctor, setDoctor] = useState<WhoAmI>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  /* ---------- Browse medicines ---------- */
  const [allMeds, setAllMeds] = useState<Medicine[]>([]);
  const [loadingMeds, setLoadingMeds] = useState(true);
  const [query, setQuery] = useState("");

  /* ---------- Build prescription ---------- */
  const [patientId, setPatientId] = useState("");         // doctor types/chooses patient
  const [noteGlobal, setNoteGlobal] = useState("");       // general instructions
  const [items, setItems] = useState<CartItem[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitMsg, setSubmitMsg] = useState<string | null>(null);

  /* ---------- Effects ---------- */
  useEffect(() => {
    const run = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get(API.whoAmI, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setDoctor(res.data);
      } catch (e) {
        console.error("whoAmI failed", e);
        setDoctor(null);
      } finally {
        setLoadingAuth(false);
      }
    };
    run();
  }, []);

  useEffect(() => {
    const fetchMeds = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await axios.get<Medicine[]>(API.medicines, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllMeds(res.data ?? []);
      } catch (e) {
        console.error("fetch medicines failed", e);
        setAllMeds([]);
      } finally {
        setLoadingMeds(false);
      }
    };
    fetchMeds();
  }, []);

  /* ---------- Derived ---------- */
  const filteredMeds = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return allMeds;
    return allMeds.filter((m) =>
      [m.name, m.strength, m.form]
        .filter(Boolean)
        .some((s) => String(s).toLowerCase().includes(q))
    );
  }, [allMeds, query]);

  const totalPrice = useMemo(() => {
    return items.reduce((sum, it) => sum + (it.medicine.price ?? 0) * it.qty, 0);
  }, [items]);

  /* ---------- Handlers ---------- */
  const addToCart = (med: Medicine) => {
    setItems((curr) => {
      const exist = curr.find((c) => c.medicine.id === med.id);
      if (exist) {
        return curr.map((c) =>
          c.medicine.id === med.id ? { ...c, qty: c.qty + 1 } : c
        );
      }
      return [...curr, { medicine: med, qty: 1 }];
    });
  };

  const updateQty = (id: string, qty: number) => {
    if (qty <= 0) {
      setItems((curr) => curr.filter((c) => c.medicine.id !== id));
    } else {
      setItems((curr) =>
        curr.map((c) =>
          c.medicine.id === id ? { ...c, qty: Math.floor(qty) } : c
        )
      );
    }
  };

  const updateItemNote = (id: string, note: string) => {
    setItems((curr) =>
      curr.map((c) => (c.medicine.id === id ? { ...c, note } : c))
    );
  };

  const clearCart = () => setItems([]);

  const submitPrescription = async () => {
    setSubmitMsg(null);

    if (!doctor) {
      setSubmitMsg("Unauthorized. Please sign in again.");
      return;
    }
    if (!patientId.trim()) {
      setSubmitMsg("Please enter a Patient ID.");
      return;
    }
    if (items.length === 0) {
      setSubmitMsg("Add at least one medicine.");
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem("access_token");
      // Build payload expected by your backend
      const payload = {
        doctor_id: doctor.id,
        patient_id: patientId.trim(),
        note: noteGlobal,
        items: items.map((it) => ({
          medicine_id: it.medicine.id,
          qty: it.qty,
          note: it.note,
        })),
      };

      const res = await axios.post(API.createPrescription, payload, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSubmitMsg("Prescription created successfully.");
      clearCart();
    } catch (e: any) {
      console.error("create prescription failed", e);
      setSubmitMsg(
        e?.response?.data?.message ??
          "Failed to create prescription. Check console / backend."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* ---------- UI ---------- */
  return (
    <div className="mx-auto mt-6 w-[95%] max-w-6xl">
      <h1 className="text-2xl font-semibold mb-1">Pharmacy</h1>
      <p className="text-sm text-gray-600 mb-4">
        Browse medicines and place a prescription.
      </p>

      {/* Top bar: doctor & patient */}
      <div className="bg-white rounded-xl p-4 shadow-sm mb-4 grid gap-3 md:grid-cols-3">
        <div>
          <p className="text-xs text-gray-500 mb-1">Doctor</p>
          <div className="text-sm">
            {loadingAuth ? "Loading..." : doctor ? doctor.name ?? doctor.id : "Not signed in"}
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="text-xs text-gray-500 mb-1 block">Patient ID</label>
          <input
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
            placeholder="e.g. pat_123"
            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Main content */}
      <div className="grid md:grid-cols-5 gap-4">
        {/* Left: catalog */}
        <div className="md:col-span-3">
          <div className="bg-white rounded-xl p-4 shadow-sm mb-3">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search medicine name, strength, or form…"
              className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="bg-white rounded-xl p-2 shadow-sm overflow-hidden">
            {loadingMeds ? (
              <div className="p-4 text-sm text-gray-600">Loading medicines…</div>
            ) : filteredMeds.length === 0 ? (
              <div className="p-4 text-sm text-gray-600">
                No medicines match “{query}”.
              </div>
            ) : (
              <ul className="divide-y">
                {filteredMeds.map((m) => (
                  <li key={m.id} className="p-3 flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {m.name}{" "}
                        <span className="font-normal text-gray-600">
                          {m.strength ? `· ${m.strength}` : ""}{" "}
                          {m.form ? `· ${m.form}` : ""}
                        </span>
                      </p>
                      <p className="text-xs text-gray-500">
                        {m.unit ? `Unit: ${m.unit}` : ""}{" "}
                        {typeof m.stock === "number" ? `· Stock: ${m.stock}` : ""}{" "}
                        {typeof m.price === "number" ? `· Price: ${m.price}` : ""}
                      </p>
                    </div>

                    <button
                      onClick={() => addToCart(m)}
                      className="shrink-0 rounded-lg bg-blue-600 text-white px-3 py-1.5 hover:bg-blue-700"
                    >
                      Add
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Right: prescription builder */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-xl p-4 shadow-sm mb-3">
            <h2 className="font-semibold mb-2">Prescription</h2>

            {items.length === 0 ? (
              <p className="text-sm text-gray-600">No items yet. Add medicines from the list.</p>
            ) : (
              <div className="space-y-3">
                {items.map((it) => (
                  <div
                    key={it.medicine.id}
                    className="border rounded-lg p-3 space-y-2"
                  >
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-medium">{it.medicine.name}</p>
                        <p className="text-xs text-gray-500">
                          {it.medicine.strength ? `${it.medicine.strength} · ` : ""}
                          {it.medicine.form ?? ""}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-500">Qty</label>
                        <input
                          type="number"
                          min={1}
                          value={it.qty}
                          onChange={(e) =>
                            updateQty(it.medicine.id, Number(e.target.value) || 1)
                          }
                          className="w-20 rounded-lg border border-gray-300 px-2 py-1 text-sm"
                        />
                        <button
                          onClick={() => updateQty(it.medicine.id, 0)}
                          className="rounded-lg bg-gray-200 px-2 py-1 text-xs hover:bg-gray-300"
                        >
                          Remove
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 block mb-1">
                        Instruction (per medicine)
                      </label>
                      <input
                        value={it.note ?? ""}
                        onChange={(e) =>
                          updateItemNote(it.medicine.id, e.target.value)
                        }
                        placeholder="e.g., 1 tab PO bid after meals"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
                      />
                    </div>
                  </div>
                ))}

                <div className="flex justify-between text-sm pt-1">
                  <button
                    onClick={clearCart}
                    className="rounded-lg bg-gray-100 px-3 py-1.5 hover:bg-gray-200"
                  >
                    Clear
                  </button>
                  <div className="text-right">
                    <p className="text-gray-600">
                      Items: <span className="font-medium">{items.length}</span>
                    </p>
                    <p className="text-gray-900 font-semibold">
                      Total: {totalPrice.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="text-xs text-gray-500 block mb-1">
              General Instruction (applies to the whole prescription)
            </label>
            <textarea
              value={noteGlobal}
              onChange={(e) => setNoteGlobal(e.target.value)}
              rows={3}
              placeholder="e.g., Review in 7 days. Avoid NSAIDs."
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />

            <button
              disabled={submitting}
              onClick={submitPrescription}
              className="mt-3 w-full rounded-lg bg-green-600 text-white py-2.5 hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? "Submitting…" : "Place Prescription"}
            </button>

            {submitMsg && (
              <p className="mt-2 text-sm text-gray-700">{submitMsg}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
