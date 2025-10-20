"use client";

import React, { useMemo, useState } from "react";
import axios from "axios";

/** Adjust this to your backend */
const API_BASE = process.env.NEXT_PUBLIC_API_URL_PHA;
const API = {
  submit: `${API_BASE}/screening`, // POST
};

type SpouseHiv =
  | "no_spouse"
  | "not_checked"
  | "positive"
  | "negative";

export default function ScreeningPage() {
  // If you already know patient_id/doctor_id from context, pull them here.
  const [patientId, setPatientId] = useState<string>("pat_demo_001");

  // --- Form state ---
  const [symptom, setSymptom] = useState<"yes" | "no">("no");
  const [symptomDetail, setSymptomDetail] = useState("");

  const [bloodDraw, setBloodDraw] = useState<"yes" | "no">("no");
  const [bloodDrawDate, setBloodDrawDate] = useState<string>("");

  // interpret as “missed pills / poor adherence”
  const [adherence, setAdherence] = useState<"yes" | "no_regular">("no_regular");
  const [missedDays, setMissedDays] = useState<number>(0);

  const [spouseHiv, setSpouseHiv] = useState<SpouseHiv>("no_spouse");

  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const payload = useMemo(
    () => ({
      patient_id: patientId,
      symptom: {
        has: symptom === "yes",
        detail: symptom === "yes" && symptomDetail.trim() ? symptomDetail.trim() : undefined,
      },
      blood_draw: {
        has: bloodDraw === "yes",
        date: bloodDraw === "yes" && bloodDrawDate ? bloodDrawDate : undefined, // ISO yyyy-mm-dd
      },
      adherence: {
        has_issue: adherence === "yes",
        days_missed: adherence === "yes" ? Math.max(0, Number(missedDays) || 0) : 0,
        pattern: adherence === "no_regular" ? "no_regular" : "issue",
      },
      spouse_hiv: spouseHiv, // "no_spouse" | "not_checked" | "positive" | "negative"
    }),
    [patientId, symptom, symptomDetail, bloodDraw, bloodDrawDate, adherence, missedDays, spouseHiv]
  );

  const submit = async (action: "receive_medicine" | "book_appointment") => {
    setMsg(null);
    setSubmitting(true);
    try {
      // Optional token attach (send anyway if missing)
      const token = localStorage.getItem("access_token");
      const headers: Record<string, string> = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;

      const res = await axios.post(
        API.submit,
        { ...payload, action }, // backend can branch on this
        { headers }
      );

      setMsg(
        action === "receive_medicine"
          ? "บันทึกแบบคัดกรองและส่งไปรับยาแล้ว ✅"
          : "บันทึกแบบคัดกรองและส่งไปจองคิวแล้ว ✅"
      );
    } catch (e: any) {
      const status = e?.response?.status;
      const text =
        status === 401
          ? "ถูกปฏิเสธ: ต้องเข้าสู่ระบบ (401)"
          : status === 403
            ? "ถูกปฏิเสธ: ไม่มีสิทธิ์ (403)"
            : e?.response?.data?.message || "ส่งไม่สำเร็จ";
      setMsg(text);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex justify-center bg-slate-50">
      <div className="w-full max-w-sm px-4 py-5">
        <h1 className="text-lg font-semibold text-slate-900 mb-4">กรอกข้อมูลสุขภาพเบื้องต้น</h1>

        {/* Patient ID (if you want it visible/editable) */}
        <div className="mb-3">
          <label className="block text-xs text-gray-600 mb-1">Patient ID</label>
          <input
            className="w-full rounded-xl border px-3 py-2 text-sm bg-white"
            value={patientId}
            onChange={(e) => setPatientId(e.target.value)}
          />
        </div>

        {/* 1) Symptoms */}
        <fieldset className="bg-white rounded-2xl p-3 shadow-sm mb-3">
          <legend className="font-medium text-slate-900 mb-2">
            มีอาการผิดปกติหรือไม่
          </legend>
          <label className="flex items-center gap-2 text-sm mb-2">
            <input
              type="radio"
              name="symptom"
              checked={symptom === "yes"}
              onChange={() => setSymptom("yes")}
            />
            <span>มี</span>
          </label>
          {symptom === "yes" && (
            <input
              className="w-full rounded-xl border px-3 py-2 text-sm mb-2"
              placeholder="ระบุอาการ"
              value={symptomDetail}
              onChange={(e) => setSymptomDetail(e.target.value)}
            />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="symptom"
              checked={symptom === "no"}
              onChange={() => setSymptom("no")}
            />
            <span>ไม่มี</span>
          </label>
        </fieldset>

        {/* 2) Blood draw */}
        <fieldset className="bg-white rounded-2xl p-3 shadow-sm mb-3">
          <legend className="font-medium text-slate-900 mb-2">
            เจาะเลือดแล้วหรือไม่ (ไม่เกิน 7 วัน)
          </legend>
          <label className="flex items-center gap-2 text-sm mb-2">
            <input
              type="radio"
              name="blood"
              checked={bloodDraw === "yes"}
              onChange={() => setBloodDraw("yes")}
            />
            <span>มี</span>
          </label>
          {bloodDraw === "yes" && (
            <input
              type="date"
              className="w-full rounded-xl border px-3 py-2 text-sm mb-2"
              value={bloodDrawDate}
              onChange={(e) => setBloodDrawDate(e.target.value)}
            />
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="blood"
              checked={bloodDraw === "no"}
              onChange={() => setBloodDraw("no")}
            />
            <span>ไม่มี</span>
          </label>
        </fieldset>

        {/* 3) Adherence / missed pills */}
        <fieldset className="bg-white rounded-2xl p-3 shadow-sm mb-3">
          <legend className="font-medium text-slate-900 mb-2">
            ขาดยาหรือกินยาช้าเกิน 5 นาที
          </legend>
          <label className="flex items-center gap-2 text-sm mb-2">
            <input
              type="radio"
              name="adherence"
              checked={adherence === "yes"}
              onChange={() => setAdherence("yes")}
            />
            <span>มี</span>
          </label>
          {adherence === "yes" && (
            <div className="mb-2">
              <label className="block text-xs text-gray-600 mb-1">ระบุจำนวนวัน</label>
              <input
                type="number"
                min={0}
                className="w-full rounded-xl border px-3 py-2 text-sm"
                value={missedDays}
                onChange={(e) => setMissedDays(Math.max(0, Number(e.target.value) || 0))}
              />
            </div>
          )}
          <label className="flex items-center gap-2 text-sm">
            <input
              type="radio"
              name="adherence"
              checked={adherence === "no_regular"}
              onChange={() => setAdherence("no_regular")}
            />
            <span>ไม่มียาประจำ / ไม่ขาดยา</span>
          </label>
        </fieldset>

        {/* 4) Spouse HIV Check */}
        <fieldset className="bg-white rounded-2xl p-3 shadow-sm mb-3">
          <legend className="font-medium text-slate-900 mb-2">Spouse HIV Check</legend>

          {[
            { key: "no_spouse", label: "No spouse" },
            { key: "not_checked", label: "spouse not check" },
            { key: "positive", label: "spouse positive" },
            { key: "negative", label: "spouse negative" },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 text-sm mb-1">
              <input
                type="radio"
                name="spouse"
                checked={spouseHiv === (opt.key as SpouseHiv)}
                onChange={() => setSpouseHiv(opt.key as SpouseHiv)}
              />
              <span>{opt.label}</span>
            </label>
          ))}
        </fieldset>

        {/* Actions */}
        <div className="flex items-center justify-between mt-4">
          <button
            disabled={submitting}
            onClick={() => submit("receive_medicine")}
            className="rounded-xl px-4 py-2 text-sm bg-amber-400 text-black disabled:opacity-60"
          >
            Order Medicine (chronic patient)
          </button>
          <button
            disabled={submitting}
            onClick={() => submit("book_appointment")}
            className="rounded-xl px-4 py-2 text-sm bg-sky-500 text-white disabled:opacity-60"
          >
            Book Appointment
          </button>
        </div>

        {msg && (
          <p className={`mt-3 text-sm ${msg.includes("✅") ? "text-emerald-600" : "text-red-600"}`}>
            {msg}
          </p>
        )}
      </div>
    </div>
  );
}
