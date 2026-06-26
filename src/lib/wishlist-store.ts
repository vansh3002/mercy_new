"use client";

const KEY = "wm_wishlist";

/** Read current wishlist IDs from localStorage. */
export function getWishlist(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) ?? "[]") as string[];
  } catch {
    return [];
  }
}

/** Returns true if the product id is wishlisted. */
export function isWishlisted(productId: string): boolean {
  return getWishlist().includes(productId);
}

/** Toggle a product in the wishlist. Returns the new wishlisted state. */
export function toggleWishlist(productId: string): boolean {
  const current = getWishlist();
  let next: string[];
  if (current.includes(productId)) {
    next = current.filter((id) => id !== productId);
  } else {
    next = [...current, productId];
  }
  localStorage.setItem(KEY, JSON.stringify(next));
  // Dispatch a custom event so other components can react
  window.dispatchEvent(new CustomEvent("wm:wishlist", { detail: next }));
  return next.includes(productId);
}
