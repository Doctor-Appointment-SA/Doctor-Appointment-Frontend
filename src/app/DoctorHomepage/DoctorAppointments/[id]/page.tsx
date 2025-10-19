// ------------------------------------------------------------
// File: src/app/doctor/appointments/[id]/page.tsx
"use client";
import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

export type PatientDetails = {
  id: string;
  name: string;
  appointment: { date: string; time: string };
  profilePic?: string;
  citizenId?: string;
  phone?: string;
  hospitalNumber?: string;
  bloodDrawnAt?: string;    // ISO date
  missedArvDays?: number;   // Int
  notes?: string;           // symptom_note
  lastUpdated?: string;     // ISO date
};

/** ---------- Types ที่ตรง backend (ยืดหยุ่นต่อ alias) ---------- */
type AppointmentAPI = {
  id: string;
  appoint_date: string | null;
  status?: string | null;
  detail?: string | null;
  patient?: {
    id: string;
    hospital_number?: string | null;
    symptom_note?: string | null;
    blood_drawn_at?: string | null;
    missed_arv_days?: number | null;
    user_patient_idTouser?: {
      name?: string | null;
      lastname?: string | null;
      id_card?: string | null;
      phone?: string | null;
    } | null;
  } | null;
  doctor?: { id: string } | null;
};

type PatientAPI = {
  id: string;
  hospital_number?: string | null;
  symptom_note?: string | null;
  blood_drawn_at?: string | null;
  missed_arv_days?: number | null;
  user_patient_idTouser?: {
    name?: string | null;
    lastname?: string | null;
    id_card?: string | null;
    phone?: string | null;
  } | null;
};

export default function AppointmentDetailPage() {
  const params = useParams<{ id: string }>();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const router = useRouter();

  const [data, setData] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE;
        if (!base) throw new Error("NEXT_PUBLIC_API_BASE is not set");

        // 1) ดึงนัดตาม id (ควร include patient.user_patient_idTouser)
        const res = await fetch(`${base}/appointments/${id}`, {
          cache: "no-store",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`ไม่สามารถโหลดนัดได้ (${res.status})`);
        const appt: AppointmentAPI = await res.json();

        // วัน-เวลาใบนัด
        const d = appt.appoint_date ? new Date(appt.appoint_date) : null;
        const date = d
          ? d.toLocaleDateString("th-TH", { year: "numeric", month: "short", day: "2-digit" })
          : "-";
        const time = d ? d.toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" }) : "-";

        // ชื่อ/เลขบัตร/เบอร์โทร จาก relation user
        const u = appt.patient?.user_patient_idTouser;
        const patientName =
          [u?.name, u?.lastname].filter(Boolean).join(" ").trim() || "ไม่ทราบชื่อ";

        // 2) (ออปชัน) ดึง patient เพิ่ม ถ้ามี endpoint แยก
        let patientExtra: PatientAPI | null = null;
        if (appt.patient?.id) {
          try {
            const pr = await fetch(`${base}/patients/${appt.patient.id}`, {
              cache: "no-store",
              credentials: "include",
            });
            if (pr.ok) patientExtra = await pr.json();
          } catch {
            /* เงียบ ๆ */
          }
        }

        // 3) รวมข้อมูลตาม schema จริง
        const merged = {
          hospital_number:
            appt.patient?.hospital_number ?? patientExtra?.hospital_number ?? undefined,
          symptom_note:
            appt.patient?.symptom_note ?? patientExtra?.symptom_note ?? undefined,
          blood_drawn_at:
            appt.patient?.blood_drawn_at ?? patientExtra?.blood_drawn_at ?? undefined,
          missed_arv_days:
            appt.patient?.missed_arv_days ?? patientExtra?.missed_arv_days ?? undefined,
          user: {
            id_card:
              u?.id_card ?? patientExtra?.user_patient_idTouser?.id_card ?? undefined,
            phone:
              u?.phone ?? patientExtra?.user_patient_idTouser?.phone ?? undefined,
          },
        };

        const mapped: PatientDetails = {
          id: appt.patient?.id || "unknown",
          name: patientName,
          appointment: { date, time },
          profilePic: undefined, // ไม่มีฟิลด์รูปใน schema → ใช้ placeholder หากต้องการ
          citizenId: merged.user.id_card || "-",
          phone: merged.user.phone || "-",
          hospitalNumber: merged.hospital_number || "-",
          bloodDrawnAt: merged.blood_drawn_at || undefined,
          missedArvDays:
            typeof merged.missed_arv_days === "number" ? merged.missed_arv_days : undefined,
          notes: merged.symptom_note ?? appt.detail ?? undefined,
          lastUpdated: new Date().toISOString(),
        };

        setData(mapped);
      } catch (e: any) {
        console.error(e);
        setErr(e?.message || "โหลดข้อมูลล้มเหลว");
        setData(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const avatarSrc = data?.profilePic || "https://i.pravatar.cc/160?img=1";

  return (
    <main className="mx-auto min-h-screen max-w-2xl bg-gray-50 px-4 py-6">
      <h1 className="text-xl font-semibold">ข้อมูลคนไข้</h1>

      {loading ? (
        <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-600">กำลังโหลด…</div>
      ) : err ? (
        <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-red-600">
          เกิดข้อผิดพลาด: {err}
        </div>
      ) : !data ? (
        <div className="mt-4 rounded-2xl bg-white p-4 text-sm text-gray-600">
          ไม่พบข้อมูลคนไข้ ID: {String(id)}
        </div>
      ) : (
        <>
          {/* Appointment summary */}
          <section className="mt-4 flex items-center justify-between rounded-2xl bg-blue-300/80 p-4">
            <div>
              <p className="text-base font-medium">{data.name}</p>
              <p className="text-sm text-gray-600">
                {data.appointment.date} • {data.appointment.time}
              </p>
            </div>
            <img
              src={avatarSrc}
              alt="avatar"
              className="h-16 w-16 rounded-full object-cover ring-2 ring-white/70 shadow-md"
            />
          </section>

          {/* Read-only details: เฉพาะฟิลด์ที่มีใน schema */}
          <section className="mt-4 grid gap-4">
            <Card title="ข้อมูลทั่วไป">
              <Row label="เลขบัตรประชาชน" value={data.citizenId || "-"} />
              <Row label="เบอร์โทร" value={data.phone || "-"} />
              <Row label="HN" value={data.hospitalNumber || "-"} />
              <Row
                label="เจาะเลือดล่าสุด"
                value={
                  data.bloodDrawnAt
                    ? new Date(data.bloodDrawnAt).toLocaleDateString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "2-digit",
                      })
                    : "-"
                }
              />
              <Row
                label="ขาดยา ARV (วัน)"
                value={typeof data.missedArvDays === "number" ? data.missedArvDays : "-"}
              />
            </Card>

            <Card title="บันทึกอาการ">
              <p className="whitespace-pre-wrap text-sm text-gray-800">
                {data.notes || "—"}
              </p>
            </Card>

            <p className="text-xs text-gray-500">
              อัปเดตล่าสุด: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : "—"}
            </p>
          </section>
        </>
      )}

      {/* Bottom actions (อยู่ในกล่องเทา) */}
      <div className="sticky bottom-0 mt-6 flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.08)] backdrop-blur">
        <button
          onClick={() => router.back()}
          className="rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-50"
        >
          Back
        </button>
        {data && (
          <button
            onClick={() =>
              router.push(`/DoctorHomepage/DoctorAppointments/${String(id)}/result`)
            }
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90"
          >
            Next
          </button>
        )}
      </div>
    </main>
  );
}

/* ---------------- helper components ---------------- */
function Card({ title, children }: { title: string; children: React.ReactNode }) {
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
