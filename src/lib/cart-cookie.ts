import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

export const CART_COOKIE = "wm_cart";

export function getCartIdFromCookies(): string | undefined {
  return cookies().get(CART_COOKIE)?.value;
}

export function ensureCartId(): string {
  const jar = cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  if (existing) return existing;
  const id = randomUUID();
  jar.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return id;
}
