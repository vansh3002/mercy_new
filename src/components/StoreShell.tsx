"use client";

import { usePathname } from "next/navigation";
import { BoutiqueHeader } from "@/components/BoutiqueHeader";
import { BottomNav } from "@/components/BottomNav";
import { SiteFooter } from "@/components/SiteFooter";

export function StoreShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const isAdmin = path.startsWith("/vaar5k9x");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <BoutiqueHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <BottomNav />
    </>
  );
}
