"use client";
import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import SuspenseHelper from "@/components/SuspenseHelper";

export default function PrescriptionIndex() {
  const router = useRouter();
  const q = useSearchParams();
  const id = q.get("id") || q.get("patient");

  useEffect(() => {
    if (id) router.replace(`/prescription/${id}`);
  }, [id, router]);

  return (
    <SuspenseHelper>
      (
      <div className="p-6">
        <h1 className="text-xl font-semibold mb-2">Prescription Viewer</h1>
        <p className="text-sm text-gray-600">
          Go to <code>/prescription/&lt;id&gt;</code> (prescription or patient
          id), or pass <code>?id=&lt;id&gt;</code>.
        </p>
      </div>
      )
    </SuspenseHelper>
  );
}
