import { LotusMark } from "./LotusMark";

interface Props {
  className?: string;
  text?: string;
  tone?: "wine" | "cream";
}

/** Infinite marquee subtly repeating the brand name. Pure CSS animation. */
export function BrandMarquee({
  className = "",
  text = "WOMANIYA",
  tone = "wine",
}: Props) {
  const items = Array.from({ length: 14 });
  const isWine = tone === "wine";
  return (
    <div
      className={[
        "relative overflow-hidden border-y mask-fade-edges select-none",
        isWine
          ? "bg-wine-gradient text-on-accent border-wine-deep/40"
          : "bg-surface text-wine border-line",
        className,
      ].join(" ")}
      aria-hidden="true"
    >
      <div className="flex w-max animate-marquee py-3">
        {[...items, ...items].map((_, i) => (
          <span
            key={i}
            className="display italic text-[28px] sm:text-[34px] lg:text-[42px] leading-none flex items-center gap-6 px-6 whitespace-nowrap"
          >
            {text}
            <LotusMark
              className={`w-4 h-4 ${isWine ? "text-gold" : "text-lotus"}`}
            />
          </span>
        ))}
      </div>
    </div>
  );
}
