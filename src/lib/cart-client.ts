"use client";

import type { CartView } from "@/features/cart/types";
import type { Size } from "@/features/products/types";

async function jsonOr<T>(res: Response, fallback: T): Promise<T> {
  if (!res.ok) return fallback;
  return (await res.json()) as T;
}

export async function fetchCart(): Promise<CartView | null> {
  const res = await fetch("/api/cart", { cache: "no-store" });
  const data = await jsonOr<{ cart: CartView } | null>(res, null);
  if (data?.cart) {
    window.dispatchEvent(new CustomEvent("wm:cart", { detail: data.cart }));
  }
  return data?.cart ?? null;
}

export async function addToCart(productId: string, size: Size, qty = 1): Promise<CartView | null> {
  const res = await fetch("/api/cart/items", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ productId, size, qty }),
  });
  const data = await jsonOr<{ cart: CartView } | null>(res, null);
  if (data?.cart) {
    window.dispatchEvent(new CustomEvent("wm:cart", { detail: data.cart }));
  }
  return data?.cart ?? null;
}

export async function updateCartQty(itemId: string, qty: number): Promise<CartView | null> {
  const res = await fetch(`/api/cart/items/${itemId}`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ qty }),
  });
  const data = await jsonOr<{ cart: CartView } | null>(res, null);
  if (data?.cart) {
    window.dispatchEvent(new CustomEvent("wm:cart", { detail: data.cart }));
  }
  return data?.cart ?? null;
}

export async function removeCartItem(itemId: string): Promise<CartView | null> {
  const res = await fetch(`/api/cart/items/${itemId}`, { method: "DELETE" });
  const data = await jsonOr<{ cart: CartView } | null>(res, null);
  if (data?.cart) {
    window.dispatchEvent(new CustomEvent("wm:cart", { detail: data.cart }));
  }
  return data?.cart ?? null;
}

export async function applyCouponClient(code: string): Promise<CartView | null> {
  const res = await fetch("/api/cart", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ code }),
  });
  const data = await jsonOr<{ cart: CartView } | null>(res, null);
  if (data?.cart) {
    window.dispatchEvent(new CustomEvent("wm:cart", { detail: data.cart }));
  }
  return data?.cart ?? null;
}

export async function placeOrder(payload: {
  address: {
    name: string;
    phone: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    tag?: "HOME" | "WORK" | "OTHER";
  };
  paymentMethod: "UPI" | "CARD" | "COD";
}): Promise<{ orderId: string } | { error: string }> {
  const res = await fetch("/api/checkout/place", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  return (await res.json()) as { orderId: string } | { error: string };
}
