/**
 * Minimalist Conis mark — calm geometric symbol, not a face or illustration.
 * Gold node on deep field: presence without dominance.
 */
export function ConisAvatar({ size = 28 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center"
      style={{ width: size, height: size }}
      data-testid="conis-avatar"
      aria-hidden="true"
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="16" cy="16" r="15" fill="#001930" />
        <circle cx="16" cy="16" r="15" stroke="#D4AF37" strokeWidth="1.25" />
        <circle cx="16" cy="11" r="2.25" fill="#D4AF37" />
        <circle cx="11" cy="19.5" r="2.25" fill="#D4AF37" opacity="0.85" />
        <circle cx="21" cy="19.5" r="2.25" fill="#D4AF37" opacity="0.85" />
        <path
          d="M16 13.2L11.8 18.2M16 13.2L20.2 18.2M12.8 19.5H19.2"
          stroke="#D4AF37"
          strokeWidth="1.1"
          strokeLinecap="round"
          opacity="0.7"
        />
      </svg>
    </span>
  );
}
