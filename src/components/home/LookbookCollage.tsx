import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SafeImage } from "../SafeImage";

interface Tile {
  src?: string;
  title: string;
  href: string;
  label?: string;
  /** Optional accent caption ("01 / Festive in Bloom"). */
  caption?: string;
  /** Editorial column span on lg. */
  span?: "tall" | "wide" | "square";
}

interface Props {
  tiles: Tile[];
  eyebrow?: string;
  title?: string;
}

/**
 * Editorial collage of 4-5 lookbook tiles in an asymmetric grid.
 * Mobile: vertical stack with subtle stagger.
 */
export function LookbookCollage({
  tiles,
  eyebrow = "Lookbook",
  title = "Style Inspiration",
}: Props) {
  return (
    <section className="container-editorial py-14 lg:py-24">
      <div className="flex items-end justify-between gap-4 mb-8 lg:mb-12">
        <div>
          <span className="label text-wine/80">{eyebrow}</span>
          <h2 className="mt-2 serif text-[28px] sm:text-[34px] lg:text-[42px] leading-tight text-ink">
            {title}
          </h2>
        </div>
        <Link
          href="/festive-edit"
          className="hidden sm:inline-flex items-center gap-1.5 label text-wine hover:gap-2.5 transition-all"
        >
          Explore lookbook <ArrowUpRight size={14} aria-hidden="true" />
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 lg:grid-rows-2 gap-3 lg:gap-5">
        {tiles.map((t, i) => {
          const spanClass =
            t.span === "tall"
              ? "lg:col-span-2 lg:row-span-2 aspect-[3/4] lg:aspect-[4/5]"
              : t.span === "wide"
              ? "lg:col-span-2 aspect-[5/4] lg:aspect-[16/9]"
              : "aspect-square";
          return (
            <Link
              key={i}
              href={t.href}
              aria-label={`View ${t.title}`}
              className={`group relative block overflow-hidden bg-surface-2 rounded-[2px] shadow-card hover:shadow-cardHover transition-shadow duration-500 ${spanClass}`}
            >
              <SafeImage
                src={t.src}
                alt={t.title}
                title={t.title}
                fill
                sizes="(min-width: 1024px) 35vw, 45vw"
                className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.05]"
                fallbackClassName="absolute inset-0 w-full h-full"
              />
              <span
                aria-hidden="true"
                className="absolute inset-0 bg-gradient-to-t from-ink/65 via-ink/0 to-transparent"
              />
              <div className="absolute inset-x-4 bottom-4 text-on-accent">
                {t.caption && (
                  <p className="label-sm opacity-85 mb-1">{t.caption}</p>
                )}
                <p className="serif text-lg lg:text-2xl leading-tight">{t.title}</p>
                {t.label && (
                  <p className="text-xs text-on-accent/85 mt-1 line-clamp-1">{t.label}</p>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
