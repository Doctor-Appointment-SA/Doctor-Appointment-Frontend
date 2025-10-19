"use client";
import React, { useMemo, useState } from "react";
import PatientAppointmentCard, { PatientAppointment } from "@/components/PatientAppointmentCard";


const DEMO: PatientAppointment[] = [
{ id: "1", name: "คนไข้ เบอร์ 001", date: "Dec 15, 2025", time: "10:30 AM" },
{ id: "2", name: "คนไข้ เบอร์ 002", date: "Dec 15, 2025", time: "10:30 AM" },
{ id: "3", name: "คนไข้ เบอร์ 003", date: "Dec 15, 2025", time: "10:30 AM" },
{ id: "4", name: "ดุ๊กดิ๊ก ดุ๊กดิ๊ก", date: "Dec 15, 2025", time: "10:30 AM" },
{ id: "5", name: "Omen smoke heaven", date: "Dec 15, 2025", time: "10:30 AM" },
{ id: "6", name: "Jett revive me", date: "Dec 15, 2025", time: "10:30 AM" },
];


export default function DoctorAppointmentsPage() {
const [query, setQuery] = useState("");
const [category, setCategory] = useState("คนไข้");
const [items, setItems] = useState<PatientAppointment[]>(DEMO);


const filtered = useMemo(() => {
const q = query.trim();
return items.filter((it) => (q ? it.name.includes(q) : true));
}, [items, query]);


function handleDelete(id: string) {
setItems((prev) => prev.filter((x) => x.id !== id));
}


return (
<main className="mx-auto max-w-md px-4 py-6 sm:max-w-3xl">
<h1 className="text-xl font-semibold">Good morning, Docta</h1>


{/* Search */}
<div className="mt-3">
<label className="sr-only" htmlFor="search">ค้นหาชื่อคนไข้</label>
<input
id="search"
value={query}
onChange={(e) => setQuery(e.target.value)}
placeholder="ค้นหาชื่อคนไข้"
className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
/>
</div>


{/* Category select */}
<div className="mt-3">
<label htmlFor="cat" className="block text-sm text-gray-700 mb-1">ประเภทคนไข้</label>
<select
id="cat"
value={category}
onChange={(e) => setCategory(e.target.value)}
className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
>
<option value="คนไข้">คนไข้</option>
<option value="ทั้งหมด">ทั้งหมด</option>
</select>
</div>


<h2 className="mt-4 text-sm font-medium text-gray-800">Appointment {category}</h2>


<div className="mt-3 grid gap-3">
{filtered.map((item) => (
<PatientAppointmentCard key={item.id} item={item} onDelete={handleDelete} />
))}
</div>
</main>
);
}