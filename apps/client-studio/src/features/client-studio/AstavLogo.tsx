import { colors } from '@embed-engine/design-tokens';

const LOGO_MARK_SIZE_PX = 43;
const LOGO_GAP_PX = 14;

/** Fictional ASTAV mark — geometric A + wordmark. */
export function AstavLogo() {
  return (
    <div
      className="flex items-center"
      style={{ gap: LOGO_GAP_PX }}
      aria-label="ASTAV"
    >
      <svg
        viewBox="0 0 32 32"
        width={LOGO_MARK_SIZE_PX}
        height={LOGO_MARK_SIZE_PX}
        aria-hidden="true"
        className="shrink-0"
      >
        <rect
          x="1"
          y="1"
          width="30"
          height="30"
          rx="6"
          fill={colors.brand.navy}
        />
        <path
          d="M16 7.5 24 24h-3.4l-1.5-3.4h-5.2L12.4 24H9L16 7.5zm0 6.2-1.9 4.3h3.8L16 13.7z"
          fill={colors.action.accent}
        />
      </svg>
      <span
        className="text-[22px] font-bold leading-none tracking-[0.18em]"
        style={{ color: colors.brand.navy }}
      >
        ASTAV
      </span>
    </div>
  );
}
