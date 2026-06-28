import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

/** GET ,return all orders for the verified phone from cookie */
export async function GET() {
  const phone = (await cookies()).get("wm_phone")?.value;
  if (!phone) return NextResponse.json({ orders: [] });

  const orders = await prisma.order.findMany({
    where: { phone },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      orderNumber: true,
      orderStatus: true,
      finalAmount: true,
      createdAt: true,
    },
  });

  return NextResponse.json({ orders });
}
