import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const jar = await cookies();
  const phone = jar.get("wm_phone")?.value ?? null;
  return NextResponse.json({ verified: !!phone, phone });
}
