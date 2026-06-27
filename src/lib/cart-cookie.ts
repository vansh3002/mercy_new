import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";

export const CART_COOKIE = "wm_cart";
const CART_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

export function getCartIdFromCookies(): string | undefined {
  try {
    // This is called from server components synchronously
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { cookies: syncCookies } = require("next/headers");
    return syncCookies().get(CART_COOKIE)?.value;
  } catch {
    return undefined;
  }
}

export async function ensureCartId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(CART_COOKIE)?.value;
  if (existing) return existing;
  const id = randomUUID();
  jar.set(CART_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: CART_MAX_AGE,
  });
  return id;
}

export async function getCartIdAsync(): Promise<string | undefined> {
  const jar = await cookies();
  return jar.get(CART_COOKIE)?.value;
}
