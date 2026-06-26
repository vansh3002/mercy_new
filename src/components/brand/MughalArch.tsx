interface Props {
  className?: string;
}

/** Mughal-style arch silhouette that frames the WOMANIYA wordmark, echoing the logo. */
export function MughalArch({ className = "" }: Props) {
  return (
    <svg
      viewBox="0 0 200 36"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      aria-hidden="true"
    >
      <path d="M2 34 C 2 14, 28 8, 56 8 C 84 8, 92 22, 100 4 C 108 22, 116 8, 144 8 C 172 8, 198 14, 198 34" />
      <circle cx="100" cy="6" r="1.6" fill="currentColor" />
      <circle cx="56" cy="12" r="1.1" fill="currentColor" opacity="0.7" />
      <circle cx="144" cy="12" r="1.1" fill="currentColor" opacity="0.7" />
    </svg>
  );
}
