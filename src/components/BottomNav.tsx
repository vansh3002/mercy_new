"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, PackageSearch, ShoppingBag, Receipt, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { fetchCart } from "@/lib/cart-client";
import { useWishlist } from "@/context/WishlistContext";

const ITEMS = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  {
    href: "/explore",
    label: "Shop",
    icon: PackageSearch,
    match: (p: string) =>
      p.startsWith("/explore") ||
      p.startsWith("/festive-edit") ||
      p.startsWith("/shop") ||
      p.startsWith("/collections") ||
      p.startsWith("/product"),
  },
  {
    href: "/wishlist",
    label: "Loved",
    icon: Heart,
    match: (p: string) => p.startsWith("/wishlist"),
  },
  {
    href: "/cart",
    label: "Bag",
    icon: ShoppingBag,
    match: (p: string) => p.startsWith("/cart") || p.startsWith("/checkout"),
    badge: true,
  },
  {
    href: "/orders",
    label: "Orders",
    icon: Receipt,
    match: (p: string) => p.startsWith("/orders"),
  },
] as const;

export function BottomNav() {
  const pathname = usePathname();
  const [count, setCount] = useState(0);
  const { count: wishlistCount } = useWishlist();

  useEffect(() => {
    let cancelled = false;
    function syncCart(e?: any) {
      if (e?.detail) {
        setCount(e.detail.totals.itemsCount ?? 0);
      } else {
        fetchCart()
          .then((c) => {
            if (!cancelled && c) setCount(c.totals.itemsCount ?? 0);
          })
          .catch(() => {});
      }
    }

    syncCart();
    window.addEventListener("wm:cart", syncCart);
    return () => {
      cancelled = true;
      window.removeEventListener("wm:cart", syncCart);
    };
  }, [pathname]);


  return (
    <nav
      aria-label="Bottom"
      className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-line/60 safe-bottom shadow-sticky"
    >
      <ul className="grid grid-cols-5 px-1">
        {ITEMS.map((it) => {
          const Icon = it.icon;
          const active = it.match(pathname);
          const showBadge = "badge" in it && it.badge && count > 0;
          const showWishlistBadge = it.href === "/wishlist" && wishlistCount > 0;
          return (
            <li key={it.href}>
              <Link
                href={it.href}
                aria-current={active ? "page" : undefined}
                className={[
                  "relative flex flex-col items-center justify-center gap-1 py-2 text-[10px] tracking-wider uppercase font-semibold transition-colors",
                  active ? "text-wine" : "text-ink-dim",
                ].join(" ")}
              >
                <span
                  aria-hidden="true"
                  className={[
                    "absolute top-0 h-[2px] w-7 rounded-b-full bg-gold transition-opacity",
                    active ? "opacity-100" : "opacity-0",
                  ].join(" ")}
                />
                <span className="relative">
                  <Icon
                    size={20}
                    strokeWidth={active ? 2 : 1.5}
                    className={active ? "scale-105 transition-transform" : ""}
                  />
                  {showBadge && (
                    <span
                      className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-wine text-on-accent text-[9px] font-semibold leading-[16px] text-center"
                      aria-label={`${count} items in bag`}
                    >
                      {count}
                    </span>
                  )}
                  {showWishlistBadge && (
                    <span
                      className="absolute -top-1 -right-2 min-w-[16px] h-[16px] px-1 rounded-full bg-wine text-on-accent text-[9px] font-semibold leading-[16px] text-center"
                      aria-label={`${wishlistCount} items in wishlist`}
                    >
                      {wishlistCount}
                    </span>
                  )}
                </span>
                <span>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
