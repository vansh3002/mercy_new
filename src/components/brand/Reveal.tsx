"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  as?: "div" | "section" | "article";
  /** "up" | "fade" - default "up" */
  effect?: "up" | "fade";
}

/** Lightweight scroll-reveal wrapper using IntersectionObserver. Respects prefers-reduced-motion. */
export function Reveal({
  children,
  className = "",
  delay = 0,
  as = "div",
  effect = "up",
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);
  const Tag = as as React.ElementType;

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const node = ref.current;
    if (!node) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -10% 0px", threshold: 0.08 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  const base =
    effect === "up"
      ? "transition-[opacity,transform] duration-[700ms] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)]"
      : "transition-opacity duration-[700ms]";
  const hidden =
    effect === "up" ? "opacity-0 translate-y-6" : "opacity-0";
  const visible = "opacity-100 translate-y-0";

  return (
    <Tag
      ref={ref as React.RefObject<HTMLDivElement>}
      style={{ transitionDelay: `${delay}ms` }}
      className={`${base} ${shown ? visible : hidden} ${className}`}
    >
      {children}
    </Tag>
  );
}
