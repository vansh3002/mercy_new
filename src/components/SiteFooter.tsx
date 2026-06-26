"use client";

import Link from "next/link";
import { Instagram, Mail, MessageCircle } from "lucide-react";
import { useState } from "react";
import { WomaniyaWordmark } from "./brand/WomaniyaWordmark";
import { OrnateDivider } from "./brand/OrnateDivider";
import { LotusMark } from "./brand/LotusMark";
import Image from "next/image";

const COL_HELP = [
  { href: "/", label: "Size Guide" },
  { href: "/", label: "Shipping & Returns" },
  { href: "/", label: "FAQ" },
  { href: "/", label: "Care Guide" },
];

export function SiteFooter() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email.trim())) return;
    setSubmitted(true);
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
                  Thank you. The first letter arrives Sunday morning.
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
            <FooterCol title="Help" links={COL_HELP} />

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
            <span>Made with care in Lucknow & Mumbai</span>
            <LotusMark className="w-3 h-3 text-gold" />
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div>
      <p className="label text-wine/80">{title}</p>
      <ul className="mt-4 flex flex-col gap-2.5 text-sm">
        {links.map((l) => (
          <li key={l.label}>
            <Link
              href={l.href}
              className="text-ink-dim hover:text-wine transition-colors"
            >
              {l.label}
            </Link>
          </li>
        ))}
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
