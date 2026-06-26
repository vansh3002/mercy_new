import { OrnateDivider } from "./OrnateDivider";

interface Props {
  eyebrow?: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "center" | "left";
  className?: string;
  divider?: boolean;
}

/** Premium editorial heading used across home and inner pages. */
export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className = "",
  divider = true,
}: Props) {
  const isCenter = align === "center";
  return (
    <header
      className={[
        "flex flex-col",
        isCenter ? "items-center text-center" : "items-start text-left",
        className,
      ].join(" ")}
    >
      {eyebrow && (
        <span className="label text-wine/80">{eyebrow}</span>
      )}
      <h2 className="mt-2 serif text-[22px] sm:text-[26px] lg:text-[32px] leading-[1.05] text-ink text-balance max-w-2xl">
        {title}
      </h2>
      {subtitle && (
        <p className="mt-3 text-sm sm:text-base text-ink-dim max-w-xl text-pretty">
          {subtitle}
        </p>
      )}
      {divider && (
        <OrnateDivider className={isCenter ? "mt-5" : "mt-5 mx-0"} width="md" />
      )}
    </header>
  );
}
