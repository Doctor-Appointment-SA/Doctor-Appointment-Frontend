"use client";
import React, { useState } from "react";
import { useParams, useRouter } from "next/navigation";


export default function AppointmentNotePage() {
const { id } = useParams();
const router = useRouter();


const [fullName, setFullName] = useState("คนไข้ 001");
const [caseType, setCaseType] = useState("ปวดใจ");
const [note, setNote] = useState("");
const [followUp, setFollowUp] = useState(false);
const [sendHome, setSendHome] = useState(false);


function onConfirm() {
// DEMO only
console.log("save note", { id, fullName, caseType, note, followUp, sendHome });
alert("บันทึกโน้ตเดโม่แล้ว (ยังไม่เชื่อม API)");
router.push(`/DoctorAppointments/${String(id)}`);
}


return (
<main className="mx-auto max-w-md px-4 py-6 bg-gray-50 sm:max-w-lg">
<h1 className="text-xl font-semibold">Good morning, Docta</h1>


<section className="mt-4 rounded-2xl bg-white  p-4">
<h2 className="text-lg font-semibold">Health information</h2>



<div className="mt-4 space-y-3">
<div>
<label className="mb-1 block text-sm text-gray-700">Full Name</label>
<input className="w-full rounded-lg bg-white px-3 py-2 text-sm" placeholder="Value" value={fullName} onChange={(e) => setFullName(e.target.value)} />
</div>
<div>
<label className="mb-1 block text-sm text-gray-700">Case</label>
<input className="w-full rounded-lg bg-white px-3 py-2 text-sm" value={caseType} onChange={(e) => setCaseType(e.target.value)} />
</div>
<div>
<label className="mb-1 block text-sm text-gray-700">Medical note</label>
<textarea className="w-full rounded-lg bg-white px-3 py-2 text-sm" rows={3} placeholder="บันทึกสั้นๆ" value={note} onChange={(e) => setNote(e.target.value)} />
</div>
</div>
</section>


<div className="mt-4 space-y-2">
<label className="flex items-center gap-2 text-sm">
<input type="checkbox" checked={followUp} onChange={(e) => setFollowUp(e.target.checked)} />
นัดครั้งถัดไป
</label>
<label className="flex items-center gap-2 text-sm">
<input type="checkbox" checked={sendHome} onChange={(e) => setSendHome(e.target.checked)} />
สั่งยากลับไปกินที่บ้าน
</label>
</div>



    <div className="sticky bottom-0 mt-6 flex items-center justify-between rounded-2xl bg-white/90 p-4 shadow-[0_-6px_12px_-6px_rgba(0,0,0,0.08)] backdrop-blur">
        <button onClick={() => router.back()} className="rounded-lg  px-4 py-2 text-sm font-medium hover:bg-gray-50">Back</button>
        <button onClick={onConfirm}className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90">Confirm</button>
    </div>
</main>
);
}