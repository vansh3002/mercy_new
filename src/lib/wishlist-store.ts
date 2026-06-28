/**
 * Wishlist is now fully DB-backed via WishlistContext.
 * All reads/writes go through /api/customer/wishlist (requires wm_phone cookie).
 * This file is kept as a stub so old imports don't break during transition.
 */

/** @deprecated Use useWishlist() from WishlistContext instead */
export function getWishlist(): string[] { return []; }

/** @deprecated Use useWishlist() from WishlistContext instead */
export function isWishlisted(_productId: string): boolean { return false; }

/** @deprecated Use useWishlist().toggle() from WishlistContext instead */
export function toggleWishlist(_productId: string): boolean { return false; }

/** @deprecated No longer used ,wishlist is DB-backed */
export function mergeWishlistFromDB(_dbIds: string[]): void {}
