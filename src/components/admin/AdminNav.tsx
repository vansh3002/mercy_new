"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, ShoppingBag, Package, MessageCircle, BarChart2 } from "lucide-react";

const NAV = [
  { href: "/vaar5k9x", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/vaar5k9x/orders", label: "Orders", icon: ShoppingBag, exact: false },
  { href: "/vaar5k9x/products", label: "Products", icon: Package, exact: false },
  { href: "/vaar5k9x/queries", label: "Queries", icon: MessageCircle, exact: false },
  { href: "/vaar5k9x/traffic", label: "Traffic", icon: BarChart2, exact: false },
];

export function AdminNav() {
  const path = usePathname();

  return (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? path === href : path.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm transition-colors ${
              active
                ? "bg-[#8B1A2F] text-white"
                : "text-white/60 hover:text-white hover:bg-white/10"
            }`}
          >
            <Icon size={16} strokeWidth={1.5} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
