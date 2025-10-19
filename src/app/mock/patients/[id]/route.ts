import { NextResponse } from "next/server";
import { PATIENT_MAP } from "@/lib/mock/patients";

export const dynamic = "force-dynamic";
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  const item = PATIENT_MAP[params.id];
  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json(item);
}
