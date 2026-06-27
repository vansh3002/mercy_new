import { randomUUID } from "node:crypto";
import { prisma } from "@/lib/prisma";
import type { Cart, CartItem } from "./types";

// ─── Config ──────────────────────────────────────────────────────────────────

export const cartConfig = {
  FREE_SHIPPING_THRESHOLD: 999,
  COD_FEE: 30,
};

// ─── Internal helpers ─────────────────────────────────────────────────────────

function rowToCart(row: {
  id: string;
  phone: string | null;
  items: unknown;
  couponCode: string | null;
  couponAmt: number | null;
  updatedAt: Date;
}): Cart {
  // Prisma returns JSON columns as `unknown` — ensure we always get a safe array
  const rawItems = row.items;
  const items: CartItem[] = Array.isArray(rawItems) ? (rawItems as CartItem[]) : [];
  return {
    id: row.id,
    phone: row.phone ?? undefined,
    items,
    coupon:
      row.couponCode && row.couponAmt != null
        ? { code: row.couponCode, amount: row.couponAmt }
        : undefined,
    updatedAt: row.updatedAt.toISOString(),
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

export async function getOrCreateCart(id: string | undefined): Promise<Cart> {
  const cartId = id ?? randomUUID();
  const row = await prisma.cart.upsert({
    where: { id: cartId },
    update: {},
    create: { id: cartId, items: [] },
  });
  return rowToCart(row);
}

export async function getCart(id: string): Promise<Cart | null> {
  const row = await prisma.cart.findUnique({ where: { id } });
  return row ? rowToCart(row) : null;
}

export async function addItem(
  cartId: string,
  input: { productId: string; size: CartItem["size"]; qty: number },
): Promise<Cart> {
  const cart = await getOrCreateCart(cartId);
  const items = [...cart.items];

  const existing = items.find(
    (i) => i.productId === input.productId && i.size === input.size,
  );
  if (existing) {
    existing.qty = Math.min(10, existing.qty + Math.max(1, input.qty));
  } else {
    items.push({
      id: randomUUID(),
      productId: input.productId,
      size: input.size,
      qty: Math.max(1, Math.min(10, input.qty)),
      addedAt: new Date().toISOString(),
    });
  }

  const row = await prisma.cart.update({
    where: { id: cartId },
    data: { items: items as any },
  });
  return rowToCart(row);
}

export async function updateQty(
  cartId: string,
  itemId: string,
  qty: number,
): Promise<Cart | null> {
  const cart = await getCart(cartId);
  if (!cart) return null;

  const items = cart.items.map((i) =>
    i.id === itemId ? { ...i, qty: Math.max(1, Math.min(10, qty)) } : i,
  );

  const row = await prisma.cart.update({
    where: { id: cartId },
    data: { items: items as any },
  });
  return rowToCart(row);
}

export async function removeItem(
  cartId: string,
  itemId: string,
): Promise<Cart | null> {
  const cart = await getCart(cartId);
  if (!cart) return null;

  const items = cart.items.filter((i) => i.id !== itemId);
  const row = await prisma.cart.update({
    where: { id: cartId },
    data: { items: items as any },
  });
  return rowToCart(row);
}

export async function applyCoupon(
  cartId: string,
  code: string,
): Promise<Cart | null> {
  const cart = await getCart(cartId);
  if (!cart) return null;

  const isValid = code.trim().toUpperCase() === "WOMANIA100";
  const row = await prisma.cart.update({
    where: { id: cartId },
    data: {
      couponCode: isValid ? "WOMANIA100" : null,
      couponAmt: isValid ? 100 : null,
    },
  });
  return rowToCart(row);
}

export async function clearCart(cartId: string): Promise<void> {
  await prisma.cart.update({
    where: { id: cartId },
    data: { items: [], couponCode: null, couponAmt: null },
  });
}

/** Link an anonymous cart to a phone number after OTP verification */
export async function linkCartToPhone(
  cartId: string,
  phone: string,
): Promise<void> {
  await prisma.cart.update({
    where: { id: cartId },
    data: { phone },
  });
}
