"use client";

import Link from "next/link";
import { MessageCircle, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * Subtle floating help affordance ,opens to reveal a quick WhatsApp prompt.
 * Hidden on cart / checkout / order pages where it would distract.
 */
export function FloatingHelp() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const hideRoutes = ["/cart", "/checkout", "/orders"];
  if (hideRoutes.some((r) => pathname.startsWith(r))) return null;
  if (!visible) return null;

  return (
    <div className="fixed bottom-[88px] right-4 lg:bottom-6 lg:right-6 z-30">
      {open ? (
        <div className="bg-surface border border-line/60 rounded-2xl shadow-cardHover p-4 w-[260px] animate-slide-up">
          <div className="flex items-start justify-between gap-2">
            <p className="serif text-xl text-ink leading-tight">
              Need help choosing?
            </p>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Dismiss"
              className="p-1 -mt-1 -mr-1 text-ink-faint hover:text-wine transition-colors"
            >
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>
          <p className="text-xs text-ink-dim mt-1">
            Message us on WhatsApp ,we usually reply in under 10 minutes.
          </p>
          <Link
            href="https://wa.me/919876543210"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex w-full items-center justify-center gap-2 h-10 px-4 bg-wine text-on-accent rounded-full label text-[10px]"
          >
            <MessageCircle size={14} strokeWidth={1.75} />
            Chat with Mercy
          </Link>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Chat with us"
          className="w-12 h-12 rounded-full bg-wine text-on-accent shadow-glow flex items-center justify-center hover:scale-105 transition-transform"
        >
          <MessageCircle size={20} strokeWidth={1.75} />
        </button>
      )}
    </div>
  );
}
