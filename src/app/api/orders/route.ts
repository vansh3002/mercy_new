import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function generateOrderNumber(): string {
  const ts = Date.now().toString(36).toUpperCase();
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `WM${ts}${rand}`;
}

interface OrderItem {
  productId: string;
  title: string;
  size: string;
  qty: number;
  price: number;
}

// ─── POST /api/orders ────────────────────────────────────────────────────────
// Customer: place a new order. Validates stock, deducts inventory, saves order.
export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    customerName?: string;
    phone?: string;
    email?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
    items?: OrderItem[];
    subtotal?: number;
    finalAmount?: number;
    shippingCharge?: number;
    discount?: number;
    paymentMethod?: string;
  };

  // ── Validate required fields ──────────────────────────────────────────────
  const required = [
    "customerName",
    "phone",
    "address",
    "city",
    "state",
    "pincode",
    "items",
    "subtotal",
    "finalAmount",
  ] as const;

  for (const field of required) {
    if (body[field] === undefined || body[field] === null || body[field] === "") {
      return NextResponse.json(
        { success: false, error: `${field} is required` },
        { status: 400 },
      );
    }
  }

  const items = body.items!;
  if (!Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { success: false, error: "items must be a non-empty array" },
      { status: 400 },
    );
  }

  // ── Check + deduct inventory inside a transaction ─────────────────────────
  try {
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) {
          throw new Error(`product_not_found:${item.productId}`);
        }

        const inv = (product.sizeInventory ?? {}) as Record<string, number>;
        const available = inv[item.size] ?? 0;

        if (available < item.qty) {
          throw new Error(
            `insufficient_stock:${product.id}:${item.size}:available=${available}:requested=${item.qty}`,
          );
        }

        // Deduct inventory
        inv[item.size] = available - item.qty;
        await tx.product.update({
          where: { id: item.productId },
          data: { sizeInventory: inv },
        });
      }

      // Save the order inside the same transaction
      const order = await tx.order.create({
        data: {
          orderNumber: generateOrderNumber(),
          customerName: body.customerName!,
          phone: body.phone!,
          email: body.email ?? null,
          address: body.address!,
          city: body.city!,
          state: body.state!,
          pincode: body.pincode!,
          items: items as any,
          subtotal: body.subtotal!,
          shippingCharge: body.shippingCharge ?? 0,
          discount: body.discount ?? 0,
          finalAmount: body.finalAmount!,
          paymentMethod: body.paymentMethod ?? "razorpay",
        },
      });

      return order;
    });

    // Re-fetch after transaction to return the saved order
    const saved = await prisma.order.findFirst({
      orderBy: { createdAt: "desc" },
      where: { customerName: body.customerName, phone: body.phone },
    });

    return NextResponse.json({ success: true, order: saved }, { status: 201 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "unknown_error";

    if (msg.startsWith("product_not_found:")) {
      return NextResponse.json(
        { success: false, error: "Product not found", detail: msg },
        { status: 404 },
      );
    }
    if (msg.startsWith("insufficient_stock:")) {
      return NextResponse.json(
        { success: false, error: "Insufficient stock", detail: msg },
        { status: 400 },
      );
    }

    console.error("[POST /api/orders]", err);
    return NextResponse.json(
      { success: false, error: "Failed to place order" },
      { status: 500 },
    );
  }
}

// ─── GET /api/orders ─────────────────────────────────────────────────────────
// Admin: return all orders, most recent first.
export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ success: true, orders });
}
