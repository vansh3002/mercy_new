import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { notifyRestockRequest } from "@/lib/mailer";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    productTitle?: string;
    size?: string;
  };

  if (!body.productTitle || !body.size) {
    return NextResponse.json({ ok: false, error: "missing_fields" }, { status: 400 });
  }

  const jar = await cookies();
  const phone = jar.get("wm_phone")?.value ?? null;

  notifyRestockRequest(phone, body.productTitle, body.size);

  return NextResponse.json({ ok: true });
}
