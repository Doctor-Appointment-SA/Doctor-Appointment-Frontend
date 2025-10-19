import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  // Minimal validation for the demo
  if (!body || !body.doctor_id || !body.patient_id || !Array.isArray(body.items) || body.items.length === 0) {
    return NextResponse.json({ message: "Invalid payload" }, { status: 400 });
  }

  // Pretend we saved it and return an id
  const id = `rx_${Date.now()}`;
  return NextResponse.json({ id, status: "created", echo: body });
}
