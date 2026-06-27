import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── PATCH /api/products/[slug]/inventory ────────────────────────────────────
// Admin: replace the sizeInventory object for a product.
// Body: { sizeInventory: { "38": 20, "40": 15, "42": 10 } }
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    sizeInventory?: unknown;
  };

  if (
    !body.sizeInventory ||
    typeof body.sizeInventory !== "object" ||
    Array.isArray(body.sizeInventory)
  ) {
    return NextResponse.json(
      { success: false, error: "sizeInventory must be a plain object e.g. { '38': 20 }" },
      { status: 400 },
    );
  }

  // Validate all values are non-negative integers
  for (const [size, qty] of Object.entries(body.sizeInventory as Record<string, unknown>)) {
    if (typeof qty !== "number" || !Number.isInteger(qty) || qty < 0) {
      return NextResponse.json(
        { success: false, error: `Invalid quantity for size ${size}: must be a non-negative integer` },
        { status: 400 },
      );
    }
  }

  try {
    const product = await prisma.product.update({
      where: { id: slug }, // caller passes cuid as the URL segment
      data: { sizeInventory: body.sizeInventory as Record<string, number> },
    });
    return NextResponse.json({ success: true, product });
  } catch {
    return NextResponse.json({ success: false, error: "not_found" }, { status: 404 });
  }
}
