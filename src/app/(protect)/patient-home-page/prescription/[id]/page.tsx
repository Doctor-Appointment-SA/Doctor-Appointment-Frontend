"use client";

import { use } from "react";
import PrescriptionDetail from "../_PrescriptionDetail";

export default function Page({ params }: { params: Promise<{ id: string }> }) {
  const resolved = use(params); // unwrap once here
  return <PrescriptionDetail params={resolved} />;
}

