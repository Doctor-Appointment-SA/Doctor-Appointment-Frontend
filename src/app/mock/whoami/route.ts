import { NextResponse } from "next/server";

export async function GET() {
  // Pretend the logged-in doctor is Dr. House
  return NextResponse.json({ id: "doc_demo_001", name: "Dr. pepper", role: "doctor" });
}
