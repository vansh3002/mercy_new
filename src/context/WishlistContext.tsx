"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";

interface WishlistCtx {
  ids: string[];
  count: number;
  isWishlisted: (productId: string) => boolean;
  toggle: (productId: string) => void;
}

const WishlistContext = createContext<WishlistCtx>({
  ids: [],
  count: 0,
  isWishlisted: () => false,
  toggle: () => {},
});

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [ids, setIds] = useState<string[]>([]);

  async function loadFromDB() {
    try {
      const meRes = await fetch("/api/auth/me", { cache: "no-store" });
      const me = await meRes.json() as { verified: boolean };
      if (!me.verified) { setIds([]); return; }

      const wRes = await fetch("/api/customer/wishlist", { cache: "no-store" });
      const data = await wRes.json() as { wishlist: string[] };
      setIds(Array.isArray(data.wishlist) ? data.wishlist : []);
    } catch {
      setIds([]);
    }
  }

  // Load on mount
  useEffect(() => { loadFromDB(); }, []);

  // Re-load whenever phone is verified (OtpModal fires this event)
  useEffect(() => {
    window.addEventListener("wm:verified", loadFromDB);
    return () => window.removeEventListener("wm:verified", loadFromDB);
  }, []);

  const toggle = useCallback((productId: string) => {
    setIds((prev) => {
      const next = prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId];

      // Sync to DB in background (cookie checked server-side)
      fetch("/api/customer/wishlist", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ wishlist: next }),
      }).catch(() => {});

      return next;
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => ids.includes(productId),
    [ids],
  );

  return (
    <WishlistContext.Provider value={{ ids, count: ids.length, isWishlisted, toggle }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  return useContext(WishlistContext);
}
