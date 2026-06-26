import { initials } from "@/lib/format";

export function ProductPlaceholder({
  title,
  className = "",
}: {
  title: string;
  className?: string;
}) {
  return (
    <div
      role="img"
      aria-label={`${title} placeholder`}
      className={`bg-surface-2 text-wine flex items-center justify-center ${className}`}
    >
      <span
        className="serif text-3xl lg:text-5xl tracking-wider"
        aria-hidden="true"
      >
        {initials(title)}
      </span>
    </div>
  );
}
