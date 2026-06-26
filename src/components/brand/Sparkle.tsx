interface Props {
  className?: string;
  /** When true, applies a soft sway/twinkle animation. */
  animated?: boolean;
}

/** Four-point sparkle used in the logo's lotus crest. Use sparingly as a delight accent. */
export function Sparkle({ className = "", animated = false }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`${className} ${animated ? "animate-sway" : ""}`}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0 L13.6 9.2 22.6 11 13.6 12.8 12 22 10.4 12.8 1.4 11 10.4 9.2 Z" />
    </svg>
  );
}
