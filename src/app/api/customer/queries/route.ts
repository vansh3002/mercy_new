import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

const ALLOWED_TYPES = ["replacement", "general", "other"] as const;

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({})) as {
    orderNumber?: string;
    phone?: string;
    customerName?: string;
    type?: string;
    message?: string;
  };

  const { orderNumber, phone, customerName, type, message } = body;

  if (!orderNumber || !phone || !customerName || !type || !message?.trim()) {
    return NextResponse.json({ error: "missing_fields" }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(type as typeof ALLOWED_TYPES[number])) {
    return NextResponse.json({ error: "invalid_type" }, { status: 400 });
  }

  // Verify the requester owns this order via cookie
  const cookieStore = cookies();
  const phoneRaw = cookieStore.get("wm_phone")?.value ?? "";
  const cookiePhone = phoneRaw.replace(/\D/g, "");
  if (!cookiePhone || cookiePhone !== phone.replace(/\D/g, "")) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Confirm the order exists and belongs to this phone
  const order = await prisma.order.findUnique({ where: { orderNumber } });
  if (!order || order.phone.replace(/\D/g, "") !== cookiePhone) {
    return NextResponse.json({ error: "order_not_found" }, { status: 404 });
  }

  const query = await prisma.customerQuery.create({
    data: {
      orderNumber,
      phone: cookiePhone,
      customerName: customerName.trim(),
      type,
      message: message.trim(),
      status: "OPEN",
    },
  });

  return NextResponse.json({ success: true, id: query.id });
}
