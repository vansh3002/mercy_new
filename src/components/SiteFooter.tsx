"use client";

import Link from "next/link";
import { Instagram, Mail, MessageCircle, ChevronDown } from "lucide-react";
import { useState } from "react";
import { WomaniyaWordmark } from "./brand/WomaniyaWordmark";
import { OrnateDivider } from "./brand/OrnateDivider";
import { LotusMark } from "./brand/LotusMark";
import Image from "next/image";

const HELP_ITEMS = [
  {
    label: "Size Guide",
    content:
      "All garments follow Indian standard sizing. We recommend sizing up for a relaxed fit. XS fits bust 32–34″, S fits 34–36″, M fits 36–38″, L fits 38–40″, XL fits 40–42″. When in doubt, go one size up.",
  },
  {
    label: "Shipping & Returns",
    content:
      "We ship pan India. We offer a 1-day return window ,contact us within 24 hours of delivery for a replacement. Use the 'Need help?' button on your order page.",
  },
  {
    label: "FAQ",
    content:
      "Q: Do you ship pan India? Yes, everywhere.\nQ: What payment methods are accepted? UPI.\nQ: Can I change my address after ordering? Contact us immediately on WhatsApp.\nQ: Is COD available? Not at the moment ,online payments only.",
  },
  {
    label: "Care Guide",
    content:
      "Hand wash in cold water with mild detergent. Do not wring or tumble dry ,lay flat to dry in shade. Iron on low heat on the reverse side. Dry clean recommended for heavy embroidered pieces.",
  },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return;
    setSubmitted(true);
    setEmail("");
  }

  return (
    <footer className="mt-12 lg:mt-20 bg-gradient-to-b from-bg to-bg-warm border-t border-line/60">
      <div className="container-editorial pt-8 pb-[110px] lg:pt-10 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-start">
          {/* Brand block */}
          <div className="flex flex-col items-start lg:pr-10">
            <form
              onSubmit={onSubmit}
              className="w-full max-w-md"
              aria-label="Subscribe to the Womaniya letter"
            >
              <label className="label text-ink-dim">The Womaniya Letter</label>
              <div className="mt-2 flex items-stretch gap-0 border border-line bg-surface/70 rounded-full overflow-hidden focus-within:border-wine transition-colors">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  className="flex-1 bg-transparent text-sm text-ink placeholder:text-ink-faint px-4 py-3 focus:outline-none"
                  aria-label="Email address"
                  required
                />
                <button
                  type="submit"
                  className="px-5 bg-wine text-on-accent label hover:bg-wine-deep transition-colors"
                  aria-label="Subscribe"
                >
                  Subscribe
                </button>
              </div>
              {submitted ? (
                <p className="text-xs text-success mt-2">
                  Thank you!! First Letter will arrive soon.
                </p>
              ) : (
                <p className="text-xs text-ink-faint mt-2">
                  New drops, early access, soft Sundays. No spam, ever.
                </p>
              )}
            </form>

            <div className="flex items-center gap-2 mt-6">
              <SocialLink href="#" label="Instagram">
                <Instagram size={16} strokeWidth={1.5} />
              </SocialLink>
              <SocialLink href="#" label="WhatsApp">
                <MessageCircle size={16} strokeWidth={1.5} />
              </SocialLink>
              <SocialLink href="mailto:hello@womaniya.in" label="Email">
                <Mail size={16} strokeWidth={1.5} />
              </SocialLink>
            </div>
          </div>

          {/* Help & Image Block - Side-by-side on all screens */}
          <div className="grid grid-cols-2 gap-6 lg:gap-10 items-start relative">
            <HelpAccordion />

            {/* Absolute positioning so the tall image doesn't push the footer content down */}
            <div className="absolute right-0 top-0 w-1/2 h-[250px] lg:h-[400px] pointer-events-none z-0">
              <Image 
                src="/brand/chatgpt-nobg.png" 
                alt="Womaniya Lifestyle" 
                fill 
                className="object-contain object-top lg:object-right-top"
              />
            </div>
          </div>
        </div>

        <OrnateDivider width="full" className="mt-28 lg:mt-40 relative z-10" />

        <div className="mt-8 flex flex-col lg:flex-row items-center justify-between gap-4 text-xs text-ink-dim relative z-10">
          <p className="text-center lg:text-left">
            © {new Date().getFullYear()} Womaniya · A creator brand by{" "}
            <span className="text-wine font-semibold">Owncomm</span>
          </p>
          <div className="hidden lg:flex items-center gap-2 text-ink-faint label-sm">
            <LotusMark className="w-3 h-3 text-gold" />
            <span>Made with care</span>
            <LotusMark className="w-3 h-3 text-gold" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function HelpAccordion() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div>
      <p className="label text-wine/80 mb-4">Help</p>
      <ul className="flex flex-col divide-y divide-line/40">
        {HELP_ITEMS.map((item) => {
          const isOpen = open === item.label;
          return (
            <li key={item.label}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.label)}
                className="w-full flex items-center justify-between gap-2 py-2.5 text-left text-sm text-ink-dim hover:text-wine transition-colors"
                aria-expanded={isOpen}
              >
                <span className={isOpen ? "text-wine font-medium" : ""}>{item.label}</span>
                <ChevronDown
                  size={14}
                  strokeWidth={1.75}
                  className={`shrink-0 text-wine/60 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                />
              </button>
              <div
                className={`grid transition-all duration-300 ease-out ${
                  isOpen ? "grid-rows-[1fr] opacity-100 pb-3" : "grid-rows-[0fr] opacity-0"
                }`}
              >
                <div className="overflow-hidden text-xs text-ink-dim leading-relaxed whitespace-pre-line">
                  {item.content}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-label={label}
      className="inline-flex w-9 h-9 items-center justify-center rounded-full border border-line text-ink hover:bg-wine hover:text-on-accent hover:border-wine transition-colors"
    >
      {children}
    </Link>
  );
}
