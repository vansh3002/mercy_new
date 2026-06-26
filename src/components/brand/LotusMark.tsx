interface Props {
  className?: string;
  title?: string;
}

/** Stylised lotus inspired by the Womaniya logo crest. */
export function LotusMark({ className = "", title }: Props) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      role={title ? "img" : "presentation"}
      aria-label={title}
      aria-hidden={title ? undefined : "true"}
      fill="currentColor"
    >
      <g>
        <path
          d="M16 4c1.6 3.2 1.6 6.6 0 9.8C14.4 10.6 14.4 7.2 16 4z"
          opacity="0.92"
        />
        <path
          d="M9.2 7.4c2.8 1.4 4.7 3.9 5.6 7.2-3.4-.4-6-2.4-7.4-5.2.6-.8 1.2-1.5 1.8-2z"
          opacity="0.7"
        />
        <path
          d="M22.8 7.4c-2.8 1.4-4.7 3.9-5.6 7.2 3.4-.4 6-2.4 7.4-5.2-.6-.8-1.2-1.5-1.8-2z"
          opacity="0.7"
        />
        <path
          d="M4.6 13.4c3 .2 5.6 1.7 7.4 4-3.2 1.4-6.5 1.2-9-.7.4-1.2 1-2.4 1.6-3.3z"
          opacity="0.55"
        />
        <path
          d="M27.4 13.4c-3 .2-5.6 1.7-7.4 4 3.2 1.4 6.5 1.2 9-.7-.4-1.2-1-2.4-1.6-3.3z"
          opacity="0.55"
        />
      </g>
      <circle cx="16" cy="20" r="1.4" opacity="0.9" />
    </svg>
  );
}
