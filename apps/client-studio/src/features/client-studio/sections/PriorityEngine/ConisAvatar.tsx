/**
 * Minimalist Conis mark — calm geometric symbol, not a face or illustration.
 * Lighter field + clearer gold nodes for pilot trust (PT-PRIORITY-PILOT-READY-01).
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
        <circle cx="16" cy="16" r="15" fill="#2A4A66" />
        <circle cx="16" cy="16" r="15" stroke="#E2C56A" strokeWidth="1.35" />
        <circle cx="16" cy="11" r="2.4" fill="#E8D28A" />
        <circle cx="11" cy="19.5" r="2.4" fill="#E8D28A" opacity="0.92" />
        <circle cx="21" cy="19.5" r="2.4" fill="#E8D28A" opacity="0.92" />
        <path
          d="M16 13.2L11.8 18.2M16 13.2L20.2 18.2M12.8 19.5H19.2"
          stroke="#E8D28A"
          strokeWidth="1.15"
          strokeLinecap="round"
          opacity="0.8"
        />
      </svg>
    </span>
  );
}
