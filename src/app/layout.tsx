import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { BoutiqueHeader } from "@/components/BoutiqueHeader";
import { BottomNav } from "@/components/BottomNav";
import { SiteFooter } from "@/components/SiteFooter";

const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

const serif = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-serif",
  display: "swap",
});

const display = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800", "900"],
  style: ["normal", "italic"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://womaniya.in"),
  title: {
    default: "Womaniya — Hand-finished boutique fashion from Lucknow",
    template: "%s · Womaniya",
  },
  description:
    "Womaniya — a quiet, premium boutique by Mercy. Hand-finished chikankari kurtas, festive sets, and tea-time dresses, crafted in Lucknow and dispatched within 24 hours.",
  applicationName: "Womaniya",
  keywords: [
    "Womaniya",
    "premium chikankari",
    "boutique fashion India",
    "festive kurta",
    "Lucknowi chikan",
    "designer suit set",
  ],
  openGraph: {
    title: "Womaniya — Hand-finished boutique fashion",
    description:
      "Hand-finished chikankari kurtas, festive sets, and tea-time dresses from Womaniya — a quiet, premium boutique by Mercy.",
    url: "https://womaniya.in",
    siteName: "Womaniya",
    locale: "en_IN",
    type: "website",
  },
  icons: {
    icon: [{ url: "/brand/womania-logo.jpg" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#FBEDE4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${display.variable}`}>
      <body className="bg-bg text-ink min-h-screen flex flex-col">
        <BoutiqueHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        <BottomNav />
      </body>
    </html>
  );
}
