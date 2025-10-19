import { NextResponse } from "next/server";
import { PATIENT_LIST } from "@/lib/mock/patients";

export const dynamic = "force-dynamic"; // กัน cache เพื่อดีเวลอป
export async function GET() {
  return NextResponse.json(PATIENT_LIST);
}
