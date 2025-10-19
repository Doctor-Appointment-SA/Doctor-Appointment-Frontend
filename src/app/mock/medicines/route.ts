import { NextResponse } from "next/server";

const meds = [
  { id: "med_paracetamol_500", name: "Paracetamol", strength: "500 mg", form: "tablet", unit: "tab", stock: 320, price: 2.5 },
  { id: "med_ibuprofen_200",  name: "Ibuprofen",   strength: "200 mg", form: "tablet", unit: "tab", stock: 180, price: 3.0 },
  { id: "med_amoxicillin_500",name: "Amoxicillin", strength: "500 mg", form: "capsule",unit: "cap", stock: 90,  price: 5.5 },
  { id: "med_omeprazole_20",  name: "Omeprazole",  strength: "20 mg",  form: "capsule",unit: "cap", stock: 60,  price: 7.0 },
  { id: "med_cetirizine_10",  name: "Cetirizine",  strength: "10 mg",  form: "tablet", unit: "tab", stock: 200, price: 2.0 },
  { id: "med_dextromethorphan", name: "Dextromethorphan", form: "syrup", unit: "ml", stock: 1000, price: 0.03 },
  { id: "med_crack", name: "Methamphetamine", form: "powder", unit: "grams", stock: 1000, price: 0.13 },
  { id: "med_weed", name: "Cannabis", form: "leaf", unit: "sheet", stock: 1000, price: 0.06 },
];

export async function GET() {
  return NextResponse.json(meds);
}
