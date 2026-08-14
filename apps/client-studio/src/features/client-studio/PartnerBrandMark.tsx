import { colors } from '@embed-engine/design-tokens';

const LOGO_MARK_SIZE_PX = 43;
const LOGO_GAP_PX = 14;

type PartnerBrandMarkProps = {
  /** PE-02 — projected partner logo / trade mark label. */
  readonly label: string;
};

/**
 * Experience header mark — partner label comes only from canonical Brand Projection.
 */
export function PartnerBrandMark({ label }: PartnerBrandMarkProps) {
  const mark = label.trim();

  if (mark.length === 0) {
    return null;
  }

  return (
    <div
      className="flex items-center"
      style={{ gap: LOGO_GAP_PX }}
      aria-label={mark}
      data-testid="client-partner-logo"
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
        className="max-w-[10rem] truncate text-[22px] font-bold leading-none tracking-[0.12em] mobile:max-w-[7rem] mobile:text-[18px]"
        style={{ color: colors.brand.navy }}
      >
        {mark}
      </span>
    </div>
  );
}
