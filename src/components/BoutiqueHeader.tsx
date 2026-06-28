"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Menu, Search, ShoppingBag, X, Home, ChevronRight, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { AnnouncementBar } from "./AnnouncementBar";
import { WomaniyaWordmark } from "./brand/WomaniyaWordmark";
import { OrnateDivider } from "./brand/OrnateDivider";
import { LotusMark } from "./brand/LotusMark";
import { fetchCart } from "@/lib/cart-client";
import { useWishlist } from "@/context/WishlistContext";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/collections/everyday", label: "Chikankari Collection" },
  { href: "/festive-edit", label: "Trending Styles" },
] as const;

export function BoutiqueHeader() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [cartCount, setCartCount] = useState<number>(0);
  const { count: wishlistCount } = useWishlist();
  const pathname = usePathname();

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    let cancelled = false;
    function syncCart(e?: any) {
      if (e?.detail) {
        setCartCount(e.detail.totals.itemsCount ?? 0);
      } else {
        fetchCart()
          .then((c) => {
            if (!cancelled && c) setCartCount(c.totals.itemsCount ?? 0);
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


  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40">
      <AnnouncementBar />

      <div
        className={[
          "bg-surface/90 backdrop-blur border-b transition-colors",
          scrolled ? "border-line-strong/60 shadow-sm" : "border-line/60",
        ].join(" ")}
      >
        {/* Main row ,wordmark dominant */}
        <div className="container-boutique grid grid-cols-[1fr_auto_1fr] items-start gap-3 pt-1 pb-16">
          {/* Left: hamburger (mobile) + search (desktop) */}
          <div className="flex items-center gap-1 justify-self-start">
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              className="lg:hidden inline-flex w-10 h-10 -ml-2 items-center justify-center text-ink hover:text-wine transition-colors rounded-full"
            >
              <Menu size={28} strokeWidth={1.5} />
            </button>
            <button
              type="button"
              aria-label="Search the boutique"
              className="hidden lg:inline-flex w-10 h-10 items-center justify-center text-ink hover:text-wine transition-colors rounded-full -ml-2"
            >
              <Search size={22} strokeWidth={1.5} />
            </button>
            <Link
              href="/festive-edit"
              className="hidden lg:inline-flex label text-ink-dim hover:text-wine transition-colors ml-2"
            >
              Shop All
            </Link>
          </div>

          {/* Center: brand wordmark */}
          <Link
            href="/"
            aria-label="Womania ,Home"
            className="justify-self-center group translate-x-8"
          >
            <WomaniyaWordmark
              variant="stacked"
              tagline={false}
              showArch
              className="transition-transform duration-500 group-hover:-translate-y-[1px]"
            />
          </Link>

          {/* Right: orders (desktop), wishlist, bag */}
          <div className="flex items-center gap-1.5 justify-self-end">
            <Link
              href="/orders"
              aria-label="My orders"
              className="hidden lg:inline-flex w-12 h-12 items-center justify-center text-ink hover:text-wine transition-colors rounded-full"
            >
              <Receipt size={24} strokeWidth={1.5} />
            </Link>
            <Link
              href="/wishlist"
              aria-label="Wishlist"
              className="relative inline-flex w-12 h-12 items-center justify-center text-ink hover:text-wine transition-colors rounded-full"
            >
              <Heart size={28} strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-wine text-on-accent text-[10px] font-semibold leading-[20px] text-center"
                  aria-label={`${wishlistCount} items in wishlist`}
                >
                  {wishlistCount}
                </span>
              )}
            </Link>
            <Link
              href="/cart"
              aria-label="My bag"
              className="relative inline-flex w-12 h-12 items-center justify-center text-ink hover:text-wine transition-colors rounded-full -mr-2"
            >
              <ShoppingBag size={28} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span
                  className="absolute top-1.5 right-1.5 min-w-[20px] h-[20px] px-1 rounded-full bg-wine text-on-accent text-[10px] font-semibold leading-[20px] text-center"
                  aria-label={`${cartCount} items in bag`}
                >
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>

        {/* Desktop nav row */}
        <nav
          aria-label="Primary"
          className="hidden lg:block border-t border-line/50"
        >
          <ul className="container-boutique flex items-center justify-center gap-10 h-12">
            {NAV.map((n) => {
              const active =
                n.href === "/"
                  ? pathname === "/"
                  : pathname.startsWith(n.href);
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={[
                      "label transition-colors relative py-1",
                      active ? "text-wine" : "text-ink-dim hover:text-wine",
                    ].join(" ")}
                  >
                    {n.label}
                    <span
                      aria-hidden="true"
                      className={[
                        "absolute left-1/2 -translate-x-1/2 -bottom-1 h-px transition-all duration-300",
                        active
                          ? "w-8 bg-gold"
                          : "w-0 bg-gold group-hover:w-4",
                      ].join(" ")}
                    />
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-ink/55 backdrop-blur-sm animate-fade-in"
          />
          <aside className="absolute left-0 top-0 bottom-0 w-[86vw] max-w-sm bg-cream-gradient shadow-card p-6 flex flex-col gap-6 animate-slide-up overflow-y-auto">
            <div className="flex items-center justify-center w-full">
              <WomaniyaWordmark variant="stacked" tagline={false} showArch className="scale-[0.85] origin-center" />
            </div>

            <nav aria-label="Mobile" className="flex flex-col mt-20">
              {NAV.map((n, i) => {
                const active =
                  n.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(n.href);
                
                // Determine left icon based on path
                let leftIcon = <Home size={22} strokeWidth={1.5} className={active ? "text-wine" : "text-wine/70"} />;
                if (n.href === "/collections/everyday") {
                  leftIcon = <LotusMark className={`w-[22px] h-[22px] ${active ? "text-wine" : "text-wine/70"}`} />;
                } else if (n.href === "/festive-edit") {
                  leftIcon = (
                    <svg
                      className={`w-[22px] h-[22px] ${active ? "text-wine" : "text-wine/70"}`}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M8 8h8v1c0 3.5-1.5 5-2.5 7.5v3.5h-3v-3.5C9.5 14 8 12.5 8 9V8z" />
                      <path d="M12 3v5" />
                      <path d="M10 5h4" />
                    </svg>
                  );
                }

                return (
                  <Link
                    key={n.href}
                    href={n.href}
                    onClick={() => setOpen(false)}
                    className={[
                      "py-4 flex items-center justify-between border-b border-line/40 transition-colors",
                      active ? "text-wine" : "text-ink hover:text-wine",
                    ].join(" ")}
                    style={{ animationDelay: `${i * 40}ms` }}
                  >
                    <div className="flex items-center gap-4">
                      {leftIcon}
                      <span className="serif text-xl">{n.label}</span>
                    </div>
                    <ChevronRight
                      size={18}
                      className={[
                        "transition-opacity",
                        active ? "text-wine opacity-100" : "text-gold/80 opacity-60",
                      ].join(" ")}
                    />
                  </Link>
                );
              })}
            </nav>

            {/* Curated Collection Card */}
            <div className="bg-[#FAF5F0] border border-line/30 rounded-2xl p-5 flex flex-col items-center text-center gap-3 mt-6">
              <LotusMark className="w-7 h-7 text-lotus" />
              <p className="serif text-[15px] text-ink leading-snug max-w-[200px]">
                Discover styles curated for women who love elegance.
              </p>
              <Link
                href="/explore"
                onClick={() => setOpen(false)}
                className="w-full h-10 inline-flex items-center justify-center bg-wine text-on-accent rounded-full text-[11px] font-semibold tracking-[0.15em]"
              >
                EXPLORE COLLECTION
              </Link>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-4">
              <Link
                href="/orders"
                onClick={() => setOpen(false)}
                className="h-11 inline-flex items-center justify-center gap-2 border border-wine text-wine rounded-full label"
              >
                <Receipt size={14} strokeWidth={1.75} />
                Orders
              </Link>
              <Link
                href="/wishlist"
                onClick={() => setOpen(false)}
                className="h-11 inline-flex items-center justify-center gap-2 border border-wine text-wine rounded-full label"
              >
                <Heart size={14} strokeWidth={1.75} />
                Wishlist
              </Link>
              <Link
                href="/cart"
                onClick={() => setOpen(false)}
                className="h-11 inline-flex items-center justify-center gap-2 bg-wine text-on-accent rounded-full label"
              >
                <ShoppingBag size={14} strokeWidth={1.75} />
                Bag
              </Link>
            </div>

            <div className="mt-auto pt-8 text-sm text-ink-dim border-t border-line/20">
              <p className="font-display text-xl font-bold text-wine whitespace-nowrap">
                WOMANIYA <span className="font-serif italic font-medium text-gold-dark lowercase ml-1">by Mercy</span>
              </p>
              <p className="mt-2 text-[14px] leading-relaxed">Beautiful styles chosen to make everyday fashion feel effortless.</p>
              <p className="label-xs text-ink-faint mt-4">© {new Date().getFullYear()} WOMANIYA</p>
            </div>
          </aside>
        </div>
      )}
    </header>
  );
}
