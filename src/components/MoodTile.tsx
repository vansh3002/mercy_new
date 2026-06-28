import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SafeImage } from "./SafeImage";

interface Props {
  label: string;
  href: string;
  imageSrc?: string;
  caption?: string;
  /** Optional script word displayed underneath the label, e.g. "everyday". */
  script?: string;
  count?: number;
}

/** Editorial mood tile ,taller than wide, with overlay caption and corner CTA. */
export function MoodTile({ label, href, imageSrc, caption, script, count }: Props) {
  return (
    <Link
      href={href}
      aria-label={`Shop ${label.toLowerCase()}`}
      className="group relative block aspect-[3/4] overflow-hidden bg-surface-2 rounded-[2px] shadow-card hover:shadow-cardHover transition-shadow duration-500"
    >
      <SafeImage
        src={imageSrc}
        alt={label}
        title={label}
        fill
        sizes="(min-width: 1024px) 24vw, (min-width: 640px) 45vw, 90vw"
        className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
        fallbackClassName="absolute inset-0 w-full h-full"
      />

      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-ink/75 via-ink/15 to-transparent"
      />

      <div className="absolute inset-x-4 bottom-4 lg:inset-x-5 lg:bottom-5 flex items-end justify-between gap-2 text-on-accent">
        <div className="min-w-0">
          {script && (
            <p className="display text-[14px] lg:text-[16px] opacity-85 -mb-1 leading-none">
              {script}
            </p>
          )}
          <p className="label-sm tracking-wider">{label}</p>
          {(caption || typeof count === "number") && (
            <p className="text-xs text-on-accent/85 mt-1.5 line-clamp-1">
              {caption ?? (count ? `${count} styles` : "")}
            </p>
          )}
        </div>
        <span className="w-9 h-9 rounded-full bg-on-accent/15 backdrop-blur-sm border border-on-accent/30 flex items-center justify-center transition-all duration-500 group-hover:bg-on-accent group-hover:text-wine">
          <ArrowUpRight size={16} strokeWidth={1.75} aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
