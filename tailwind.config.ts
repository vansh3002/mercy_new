import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "rgb(var(--bg) / <alpha-value>)",
        "bg-warm": "rgb(var(--bg-warm) / <alpha-value>)",
        surface: "rgb(var(--surface) / <alpha-value>)",
        "surface-2": "rgb(var(--surface-2) / <alpha-value>)",
        "surface-3": "rgb(var(--surface-3) / <alpha-value>)",
        line: "rgb(var(--line) / <alpha-value>)",
        "line-strong": "rgb(var(--line-strong) / <alpha-value>)",
        ink: "rgb(var(--text) / <alpha-value>)",
        "ink-dim": "rgb(var(--text-dim) / <alpha-value>)",
        "ink-faint": "rgb(var(--text-faint) / <alpha-value>)",
        wine: "rgb(var(--accent) / <alpha-value>)",
        "wine-deep": "rgb(var(--accent-deep) / <alpha-value>)",
        "wine-soft": "rgb(var(--accent-soft) / <alpha-value>)",
        gold: "rgb(var(--accent-2) / <alpha-value>)",
        "gold-soft": "rgb(var(--accent-2-soft) / <alpha-value>)",
        lotus: "rgb(var(--accent-lotus) / <alpha-value>)",
        coral: "rgb(var(--accent-coral) / <alpha-value>)",
        sage: "rgb(var(--accent-sage) / <alpha-value>)",
        "on-accent": "rgb(var(--on-accent) / <alpha-value>)",
        success: "rgb(var(--success) / <alpha-value>)",
        sale: "rgb(var(--sale) / <alpha-value>)",
      },
      fontFamily: {
        display: ["var(--font-display)", "Playfair Display", "Cormorant Garamond", "serif"],
        serif: ["var(--font-serif)", "Cormorant Garamond", "Cambria", '"Times New Roman"', "serif"],
        sans: ["var(--font-sans)", "Inter", "system-ui", "sans-serif"],
      },
      letterSpacing: {
        label: "0.18em",
        wide: "0.24em",
        wider: "0.32em",
      },
      maxWidth: {
        boutique: "1320px",
        editorial: "1480px",
      },
      boxShadow: {
        card: "0 1px 2px rgba(58, 18, 30, 0.04), 0 12px 32px rgba(58, 18, 30, 0.08)",
        cardHover: "0 2px 4px rgba(58, 18, 30, 0.06), 0 24px 56px rgba(58, 18, 30, 0.14)",
        sticky: "0 -10px 28px rgba(58, 18, 30, 0.08)",
        glow: "0 0 0 1px rgba(123, 30, 44, 0.12), 0 18px 48px rgba(123, 30, 44, 0.18)",
        inner: "inset 0 1px 0 rgba(255, 251, 246, 0.6), inset 0 -1px 0 rgba(58, 18, 30, 0.04)",
      },
      keyframes: {
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "slide-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          "0%": { opacity: "0", transform: "translateY(-8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "reveal-up": {
          "0%": { opacity: "0", transform: "translateY(28px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        "pulse-soft": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.55" },
        },
        "image-reveal": {
          "0%": { transform: "scale(1.08)", filter: "saturate(0.85)" },
          "100%": { transform: "scale(1)", filter: "saturate(1)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-1.5deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
      },
      animation: {
        "fade-in": "fade-in 320ms ease-out both",
        "slide-up": "slide-up 380ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "slide-down": "slide-down 320ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "reveal-up": "reveal-up 600ms cubic-bezier(0.22, 1, 0.36, 1) both",
        marquee: "marquee 38s linear infinite",
        shimmer: "shimmer 2.4s linear infinite",
        "pulse-soft": "pulse-soft 2.6s ease-in-out infinite",
        "image-reveal": "image-reveal 900ms cubic-bezier(0.22, 1, 0.36, 1) both",
        sway: "sway 6s ease-in-out infinite",
      },
      backgroundImage: {
        "wine-gradient":
          "linear-gradient(135deg, rgb(var(--accent-deep)) 0%, rgb(var(--accent)) 55%, rgb(var(--accent-deep)) 100%)",
        "gold-gradient":
          "linear-gradient(135deg, #B07B2D 0%, rgb(var(--accent-2)) 45%, #E7C283 100%)",
        "cream-gradient":
          "linear-gradient(180deg, rgb(var(--bg)) 0%, rgb(var(--bg-warm)) 100%)",
        "ornament-line":
          "linear-gradient(90deg, transparent 0%, rgb(var(--accent-2)) 22%, rgb(var(--accent-2)) 78%, transparent 100%)",
        "shimmer-line":
          "linear-gradient(110deg, transparent 32%, rgba(255, 251, 246, 0.55) 50%, transparent 68%)",
      },
    },
  },
  plugins: [],
};

export default config;
