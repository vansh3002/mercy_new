"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

// Fires a page view ping on every route change.
// Does not track admin routes.
export function Analytics() {
  const pathname = usePathname();
  const lastPath = useRef<string | null>(null);

  useEffect(() => {
    // Don't track admin panel visits
    if (pathname.startsWith("/vaar5k9x")) return;
    // Avoid double-firing on strict mode remounts
    if (pathname === lastPath.current) return;
    lastPath.current = pathname;

    fetch("/api/track/pv", { method: "POST" }).catch(() => {});
  }, [pathname]);

  return null;
}
