import Image from "next/image";

interface Props {
  variant?: "stacked" | "inline" | "compact";
  className?: string;
  showArch?: boolean;
  tagline?: string | false;
}

/**
 * The WOMANIA wordmark, now using the actual logo image.
 */
export function WomaniyaWordmark({
  variant = "stacked",
  className = "",
  showArch = true,
  tagline = "Hand-finished in Lucknow",
}: Props) {
  const hasTagline = tagline !== false && variant === "stacked";

  return (
    <div
      className={`inline-flex flex-col items-center justify-center leading-none ${className}`}
      aria-label="Womania ,hand-finished boutique fashion"
    >
      <div className={`relative w-[220px] ${hasTagline ? "h-[98px]" : "h-[32px]"}`}>
        <Image
          src="/brand/womania-logo-removebg-preview.png"
          alt="Womania Logo"
          width={220}
          height={70}
          priority
          className="absolute left-0 top-0 -mt-[54px] object-contain max-w-none"
        />
      </div>
      {hasTagline && (
        <span className="block label-xs text-ink-dim/80 mt-3 lg:mt-3.5 translate-x-[6px]">{tagline}</span>
      )}
    </div>
  );
}
