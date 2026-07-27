/**
 * Conis avatar — face-on bust; navy field, gold ring, page-bg figure.
 */
export function ConisAvatar({ size = 40 }: { size?: number }) {
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
        <circle cx="16" cy="16" r="15" stroke="#D4AF37" strokeWidth="1.5" />
        {/* Head — page background */}
        <circle cx="16" cy="12" r="5.25" fill="#F7F6F4" />
        {/* Shoulders / bust — page background */}
        <path
          d="M6.5 27.5C7.2 22.8 10.6 19.75 16 19.75C21.4 19.75 24.8 22.8 25.5 27.5"
          fill="#F7F6F4"
        />
      </svg>
    </span>
  );
}
