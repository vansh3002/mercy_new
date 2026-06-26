"use client";

import Link from "next/link";
import { ArrowRight, X } from "lucide-react";
import { useState } from "react";

export function AnnouncementBar() {
  const [closed, setClosed] = useState(false);

  if (closed) return null;
  const msg = { label: "Free delivery on first order", href: "/festive-edit" };

  return (
    <div
      className="relative bg-wine-gradient text-on-accent overflow-hidden"
      role="region"
      aria-label="Site announcements"
    >
      <div className="container-boutique flex items-center justify-between gap-3 h-9">
        <span className="hidden sm:block label-sm opacity-70">Womaniya</span>
        <Link
          href={msg.href}
          className="flex-1 sm:flex-none flex items-center justify-center gap-2 label-sm hover:opacity-90 transition-opacity"
          aria-label={msg.label}
        >
          <span className="truncate">{msg.label}</span>
          {/* <ArrowRight size={12} className="opacity-90 shrink-0" aria-hidden="true" /> */}
        </Link>
        <button
          type="button"
          onClick={() => setClosed(true)}
          aria-label="Dismiss announcement"
          className="hidden sm:inline-flex p-1 -mr-1 opacity-70 hover:opacity-100"
        >
          <X size={14} strokeWidth={1.75} />
        </button>
      </div>
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-shimmer-line bg-[length:200%_100%] animate-shimmer opacity-30 pointer-events-none"
      />
    </div>
  );
}
