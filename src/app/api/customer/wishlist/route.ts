import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { notifyWishlistAdd } from "@/lib/mailer";

async function getPhone(): Promise<string | null> {
  const jar = await cookies();
  return jar.get("wm_phone")?.value ?? null;
}

/** GET ,return the customer's saved wishlist from DB */
export async function GET() {
  const phone = await getPhone();
  if (!phone) return NextResponse.json({ wishlist: [] });

  const customer = await prisma.customer.findUnique({ where: { phone } });
  const wishlist = Array.isArray(customer?.wishlist) ? customer.wishlist as string[] : [];
  return NextResponse.json({ wishlist });
}

/** PUT ,overwrite the customer's wishlist in DB */
export async function PUT(req: Request) {
  const phone = await getPhone();
  if (!phone) return NextResponse.json({ ok: false });

  const body = (await req.json().catch(() => ({}))) as { wishlist?: unknown };
  const wishlist = Array.isArray(body.wishlist) ? body.wishlist as string[] : [];

  // Detect adds by comparing with current stored wishlist
  const current = await prisma.customer.findUnique({ where: { phone } });
  const currentIds = Array.isArray(current?.wishlist) ? current.wishlist as string[] : [];
  const added = wishlist.filter((id) => !currentIds.includes(id));

  await prisma.customer.upsert({
    where: { phone },
    create: { phone, wishlist },
    update: { wishlist, updatedAt: new Date() },
  });

  // Fire-and-forget email for each newly added product
  for (const productId of added) {
    notifyWishlistAdd(phone, productId);
  }

  return NextResponse.json({ ok: true });
}
