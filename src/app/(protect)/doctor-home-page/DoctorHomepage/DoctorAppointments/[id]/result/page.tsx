// ------------------------------------------------------------
// File: src/app/DoctorHomepage/DoctorAppointments/[id]/result/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getCookie } from "@/lib/authentication";

const API_BASE = process.env.NEXT_PUBLIC_API_URL_PRO || "http://localhost:3001";

/* ---------- Types ---------- */
type Appointment = {
  id: string;
  appoint_date?: string | null;
  detail?: string | null;
  doctor_id?: string | null;
  patient_id?: string | null;
  doctor?: { id: string } | null;
  patient?: { id: string } | null;
};

type MedicalRecord = {
  id: string;
  doctor_id: string;
  patient_id: string;
  diagnosis?: string | null;
  notes?: string | null;
  createdAt?: number | null; // seconds
};

type Patient = {
  id: string;
  user?: { name?: string | null; lastname?: string | null } | null;
  user_patient_idTouser?: {
    name?: string | null;
    lastname?: string | null;
  } | null;
  name?: string | null;
  lastname?: string | null;
};

export default function ResultPage() {
  const params = useParams<{ id: string }>();
  const appointmentId = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const [doctorId, setDoctorId] = useState("");
  const [patientId, setPatientId] = useState("");
  const [patientName, setPatientName] = useState("");
  const [apptDate, setApptDate] = useState<string>("-");
  const [apptTime, setApptTime] = useState<string>("-");

  const [record, setRecord] = useState<MedicalRecord | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [notes, setNotes] = useState("");

  const createdAtText = useMemo(() => {
    if (!record?.createdAt) return "-";
    return new Date(record.createdAt * 1000).toLocaleString();
  }, [record?.createdAt]);

  /* ---------- Helpers ---------- */
  async function fetchAppointment(aid: string): Promise<Appointment> {
    const access_token = getCookie("access_token");

    const r = await fetch(`${API_BASE}/appointments/${aid}`, {
      headers: {
        Authorization: `Bearer ${access_token}`, // replace with your token variable
      },
    });
    if (!r.ok) throw new Error(`Fetch appointment failed: ${r.status}`);
    return r.json();
  }

  async function fetchPatientName(pid: string) {
    try {
      const access_token = getCookie("access_token");

      const r = await fetch(`${API_BASE}/patients/${pid}`, {
        headers: {
          Authorization: `Bearer ${access_token}`, // replace with your token variable
        },
      });
      if (!r.ok) return setPatientName(pid);
      const p: Patient = await r.json();
      const n = p.user?.name ?? p.user_patient_idTouser?.name ?? p.name ?? "";
      const l =
        p.user?.lastname ??
        p.user_patient_idTouser?.lastname ??
        p.lastname ??
        "";
      const full = [n, l].filter(Boolean).join(" ").trim();
      setPatientName(full || pid);
    } catch {
      setPatientName(pid);
    }
  }

  async function fetchRecordByPair(did: string, pid: string) {
    const access_token = getCookie("access_token");

    const r = await fetch(`${API_BASE}/medical_record/of/${did}/${pid}`, {
      headers: {
        Authorization: `Bearer ${access_token}`, // replace with your token variable
      },
    });
    if (r.status === 404) {
      setRecord(null);
      setDiagnosis("");
      setNotes("");
      return;
    }
    if (!r.ok) throw new Error(`Fetch record failed: ${r.status}`);
    const rec: MedicalRecord = await r.json();
    setRecord(rec);
    setDiagnosis(rec.diagnosis ?? "");
    setNotes(rec.notes ?? "");
  }

  const fetchAll = async () => {
    setErr(null);
    setLoading(true);
    try {
      if (!appointmentId || appointmentId === "undefined") {
        throw new Error("appointmentId is undefined");
      }

      // 1) Appointment → เอา doctor_id / patient_id + เวลา
      const appt = await fetchAppointment(String(appointmentId));
      const did = appt.doctor_id ?? appt.doctor?.id;
      const pid = appt.patient_id ?? appt.patient?.id;
      if (!did || !pid)
        throw new Error("Appointment missing doctor_id or patient_id");

      setDoctorId(did);
      setPatientId(pid);

      const d = appt.appoint_date ? new Date(appt.appoint_date) : null;
      setApptDate(
        d
          ? d.toLocaleDateString("th-TH", {
              year: "numeric",
              month: "short",
              day: "2-digit",
            })
          : "-"
      );
      setApptTime(
        d
          ? d.toLocaleTimeString("th-TH", {
              hour: "2-digit",
              minute: "2-digit",
            })
          : "-"
      );

      // 2) ชื่อคนไข้
      await fetchPatientName(pid);

      // 3) โหลด/เช็ค medical record ของคู่
      await fetchRecordByPair(did, pid);
    } catch (e: any) {
      setErr(e?.message || "Load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!appointmentId || appointmentId === "undefined") return;
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appointmentId]);

  const handleSave = async () => {
    try {
      setSaving(true);
      setErr(null);
      const access_token = getCookie("access_token");
      console.log("diagnosis", diagnosis, " notes:", notes);
      const r = await fetch(
        `${API_BASE}/medical_record/of/${doctorId}/${patientId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${access_token}`, // replace with your token variable
          },
          credentials: "include",
          body: JSON.stringify({ diagnosis, notes }),
        }
      );
      if (!r.ok) throw new Error(`Save failed: ${r.status}`);
      await fetchAll();
    } catch (e: any) {
      setErr(e?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  /* ---------- UI ---------- */
  const avatarSrc = "https://i.pravatar.cc/160?img=1";

  if (loading) {
    return (
      <main className="mx-auto min-h-screen max-w-2xl bg-gray-50 px-4 py-6">
        <h1 className="text-xl font-semibold">Edit Medical Record</h1>
        <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-600">
          กำลังโหลด…
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-gray-50 px-4 py-6">
      <h1 className="text-xl font-semibold">Edit Medical Record</h1>

      {err && (
        <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-red-600">
          {err}
        </div>
      )}

      {/* สรุปด้านบน: เหมือนหน้าแรก */}
      <section className="mt-4 flex items-center justify-between rounded-2xl bg-blue-300/80 p-4">
        <div>
          <p className="text-base font-medium">{patientName || "-"}</p>
          <p className="text-sm text-gray-600">
            {apptDate} • {apptTime}
          </p>
        </div>
        <img
          src={avatarSrc}
          alt="avatar"
          className="h-16 w-16 rounded-full object-cover ring-2 ring-white/70 shadow-md"
        />
      </section>

      {/* การ์ดข้อมูล (อ่านอย่างเดียว) ให้หน้าตาเหมือนกัน */}
      <section className="mt-4 grid gap-4">
        <Card title="ข้อมูลเวชระเบียน">
          <Row label="Record ID" value={record?.id || "—"} />
          <Row label="Created At" value={createdAtText} />
        </Card>

        {/* การ์ดแก้ไข: Diagnosis & Notes */}
        <Card title="สรุปการรักษา">
          <div className="space-y-3">
            <div>
              <div className="mb-1 text-xs text-gray-600">Diagnosis</div>
              <input
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                placeholder="e.g., Influenza"
              />
            </div>

            <div>
              <div className="mb-1 text-xs text-gray-600">บันทึกอาการ</div>
              <textarea
                rows={5}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-black/5"
                placeholder="เช่น ให้ยาลดไข้ พักผ่อน 2–3 วัน"
              />
            </div>
          </div>
        </Card>
      </section>

      {/* ปุ่มด้านล่าง (sticky) — โทนเดียวกับหน้าแรก */}
      <div className="sticky bottom-0 mt-6 flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.08)] backdrop-blur">
        <button
          onClick={() => router.back()}
          className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchAll}
            className="rounded-lg px-3 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Refresh
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </main>
  );
}

/* ---------------- helper components (หน้าตาเดียวกับหน้าแรก) ---------------- */
function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl bg-white p-4">
      <h2 className="text-sm font-medium text-gray-800">{title}</h2>
      <div className="mt-2 space-y-2">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 text-sm">
      <div className="w-36 shrink-0 text-gray-500">{label}</div>
      <div className="flex-1 text-gray-900">{value}</div>
    </div>
  );
}
