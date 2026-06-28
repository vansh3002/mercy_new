import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { notifyBuyNowClicked } from "@/lib/mailer";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    productTitle?: string;
    size?: string;
  };

  const jar = await cookies();
  const phone = jar.get("wm_phone")?.value ?? "unknown";

  const productTitle = body.productTitle ?? "Unknown product";
  const size = body.size ?? "?";

  // Fire-and-forget ,client doesn't need to wait for this
  notifyBuyNowClicked(phone, productTitle, size);

  return NextResponse.json({ ok: true });
}
