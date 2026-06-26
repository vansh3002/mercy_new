import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SafeImage } from "../SafeImage";
import { OrnateDivider } from "../brand/OrnateDivider";
import { Sparkle } from "../brand/Sparkle";

interface Props {
  eyebrow: string;
  title: string;
  body: string;
  imageSrc?: string;
  imageTitle: string;
  ctaHref?: string;
  ctaLabel?: string;
  reverse?: boolean;
  tone?: "cream" | "bg" | "wine";
}

/** Editorial 2-column split: image + story. Use for "Hand-finished in Lucknow", etc. */
export function EditorialSplit({
  eyebrow,
  title,
  body,
  imageSrc,
  imageTitle,
  ctaHref,
  ctaLabel,
  reverse = false,
  tone = "cream",
}: Props) {
  const isWine = tone === "wine";
  const bgClass =
    isWine
      ? "bg-wine-gradient text-on-accent"
      : tone === "bg"
      ? "bg-bg"
      : "bg-cream-gradient";
  const textHeadingClass = isWine ? "text-on-accent" : "text-ink";
  const textBodyClass = isWine ? "text-on-accent/85" : "text-ink-dim";
  const eyebrowClass = isWine ? "text-gold" : "text-wine/80";
  const ctaClass = isWine
    ? "inline-flex items-center justify-center h-12 px-5 rounded-full bg-on-accent text-wine label hover:bg-on-accent/90 transition-colors"
    : "btn-wine";

  return (
    <section className={`relative ${bgClass}`}>
      <div className="container-editorial py-14 lg:py-24">
        <div className={`grid items-center gap-8 lg:gap-16 lg:grid-cols-2 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
          <div className="relative aspect-[4/5] lg:aspect-[5/6] w-full overflow-hidden rounded-[2px] bg-surface-2 shadow-card">
            <SafeImage
              src={imageSrc}
              alt={imageTitle}
              title={imageTitle}
              fill
              sizes="(min-width: 1024px) 600px, 100vw"
              className="object-cover transition-transform duration-[1400ms] hover:scale-[1.04]"
              fallbackClassName="absolute inset-0 w-full h-full"
            />
            <Sparkle className={`absolute top-4 left-4 w-4 h-4 ${isWine ? "text-gold" : "text-gold"}`} />
          </div>
          <div className="flex flex-col items-start">
            <span className={`label ${eyebrowClass}`}>{eyebrow}</span>
            <h2 className={`mt-3 serif text-[32px] lg:text-[48px] leading-[1.05] ${textHeadingClass} text-balance`}>
              {title}
            </h2>
            <OrnateDivider className="mt-5 mx-0" width="md" />
            <p className={`mt-5 text-base lg:text-lg leading-relaxed max-w-xl ${textBodyClass}`}>
              {body}
            </p>
            {ctaHref && ctaLabel && (
              <Link href={ctaHref} className={`mt-7 ${ctaClass}`}>
                {ctaLabel} <ArrowRight size={14} className="ml-2" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
