import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ensureCartId } from "@/lib/cart-cookie";
import { getOrCreateCart } from "@/features/cart/store";
import { buildCartView } from "@/features/cart/view";

// POST /api/checkout/check-stock
// Checks inventory for all cart items without deducting stock.
// Returns the first out-of-stock item found, or { success: true } if all available.
export async function POST() {
  const cartId = await ensureCartId();
  const cart = await getOrCreateCart(cartId);
  const view = await buildCartView(cart);

  for (const line of view.lines) {
    const product = await prisma.product.findUnique({ where: { id: line.productId } });
    if (!product) {
      return NextResponse.json(
        { error: "insufficient_stock", productTitle: line.title, size: line.size },
        { status: 400 },
      );
    }
    const inv = (product.sizeInventory ?? {}) as Record<string, number>;
    const available = inv[line.size] ?? 0;
    if (available < line.qty) {
      return NextResponse.json(
        { error: "insufficient_stock", productTitle: product.title, size: line.size },
        { status: 400 },
      );
    }
  }

  return NextResponse.json({ success: true });
}
