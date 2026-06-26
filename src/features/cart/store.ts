import { randomUUID } from "node:crypto";
import type { Cart, CartItem } from "./types";

const FREE_SHIPPING_THRESHOLD = 999;

// In-memory mock store. Replaced by a real DB or KV when DATA_SOURCE=db.
const carts = new Map<string, Cart>();

export function getOrCreateCart(id: string | undefined): Cart {
  const cartId = id ?? randomUUID();
  const existing = carts.get(cartId);
  if (existing) return existing;
  const fresh: Cart = { id: cartId, items: [], updatedAt: new Date().toISOString() };
  carts.set(cartId, fresh);
  return fresh;
}

export function getCart(id: string): Cart | null {
  return carts.get(id) ?? null;
}

export function addItem(
  cartId: string,
  input: { productId: string; size: CartItem["size"]; qty: number },
): Cart {
  const cart = getOrCreateCart(cartId);
  const existing = cart.items.find(
    (i) => i.productId === input.productId && i.size === input.size,
  );
  if (existing) {
    existing.qty = Math.min(10, existing.qty + Math.max(1, input.qty));
  } else {
    cart.items.push({
      id: randomUUID(),
      productId: input.productId,
      size: input.size,
      qty: Math.max(1, Math.min(10, input.qty)),
      addedAt: new Date().toISOString(),
    });
  }
  cart.updatedAt = new Date().toISOString();
  return cart;
}

export function updateQty(cartId: string, itemId: string, qty: number): Cart | null {
  const cart = getCart(cartId);
  if (!cart) return null;
  const line = cart.items.find((i) => i.id === itemId);
  if (!line) return cart;
  line.qty = Math.max(1, Math.min(10, qty));
  cart.updatedAt = new Date().toISOString();
  return cart;
}

export function removeItem(cartId: string, itemId: string): Cart | null {
  const cart = getCart(cartId);
  if (!cart) return null;
  cart.items = cart.items.filter((i) => i.id !== itemId);
  cart.updatedAt = new Date().toISOString();
  return cart;
}

export function applyCoupon(cartId: string, code: string): Cart | null {
  const cart = getCart(cartId);
  if (!cart) return null;
  if (code.trim().toUpperCase() === "WOMANIA100") {
    cart.coupon = { code: "WOMANIA100", amount: 100 };
  } else {
    cart.coupon = undefined;
  }
  cart.updatedAt = new Date().toISOString();
  return cart;
}

export function clearCart(cartId: string): void {
  const cart = getCart(cartId);
  if (!cart) return;
  cart.items = [];
  cart.coupon = undefined;
  cart.updatedAt = new Date().toISOString();
}

export const cartConfig = {
  FREE_SHIPPING_THRESHOLD,
  COD_FEE: 30,
};
