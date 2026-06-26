import { NextResponse } from "next/server";
import { getOrder } from "@/features/orders/store";

export async function GET(
  _req: Request,
  { params }: { params: { id: string } },
) {
  const order = getOrder(params.id);
  if (!order) return NextResponse.json({ error: "not_found" }, { status: 404 });
  return NextResponse.json({ order });
}
