import { LotusMark } from "./LotusMark";

interface Props {
  className?: string;
  variant?: "lotus" | "diamond" | "sparkle";
  width?: "sm" | "md" | "lg" | "full";
}

const WIDTHS = {
  sm: "w-24",
  md: "w-40",
  lg: "w-60",
  full: "w-full max-w-md",
} as const;

/** Ornate divider that lives between hero sections, mimicking the lower flourish in the logo. */
export function OrnateDivider({
  className = "",
  variant = "lotus",
  width = "md",
}: Props) {
  return (
    <div
      className={`flex items-center justify-center gap-3 text-gold ${WIDTHS[width]} mx-auto ${className}`}
      aria-hidden="true"
    >
      <span className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/70 to-gold/70" />
      <span className="text-gold/80 text-[10px]">◆</span>
      <span className="text-gold">
        {variant === "lotus" ? (
          <LotusMark className="w-5 h-5 text-gold" />
        ) : variant === "sparkle" ? (
          <span className="text-lotus text-base">✦</span>
        ) : (
          <span className="rotate-45 inline-block w-2 h-2 bg-gold" />
        )}
      </span>
      <span className="text-gold/80 text-[10px]">◆</span>
      <span className="flex-1 h-px bg-gradient-to-l from-transparent via-gold/70 to-gold/70" />
    </div>
  );
}
