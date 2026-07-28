/**
 * Conis avatar — inverted: navy field, light figure, gold ring (CAP UX 53).
 * Gold stroke is painted last so the silhouette never breaks the ring (CAP UX 54).
 */
export function ConisAvatar({ size = 40 }: { size?: number }) {
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full"
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
        <circle cx="16" cy="11.5" r="5.75" fill="#F7F6F4" />
        <path
          d="M5.25 28.5C6.1 22.4 10.2 18.5 16 18.5C21.8 18.5 25.9 22.4 26.75 28.5C26.9 29.55 26.2 30.5 25.1 30.5H6.9C5.8 30.5 5.1 29.55 5.25 28.5Z"
          fill="#F7F6F4"
        />
        <circle
          cx="16"
          cy="16"
          r="15"
          fill="none"
          stroke="#D4AF37"
          strokeWidth="1.5"
        />
      </svg>
    </span>
  );
}
