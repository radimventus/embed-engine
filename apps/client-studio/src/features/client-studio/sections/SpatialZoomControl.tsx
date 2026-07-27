import type { CSSProperties } from 'react';

type SpatialZoomControlProps = {
  onClick: () => void;
  label?: string;
  className?: string;
  style?: CSSProperties;
};

const LOUPE_GOLD = '#D4AF37';

/**
 * Gold outline loupe on a white rounded square — shared media / floor-plan control.
 * Inline border/background beat Delivery button CSS reset.
 */
export function SpatialZoomControl({
  onClick,
  label = 'Zvětšit náhled',
  className = 'absolute bottom-3 right-3 z-10',
  style,
}: SpatialZoomControlProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`flex h-[42px] w-[42px] cursor-pointer items-center justify-center transition-opacity duration-150 ease-out hover:opacity-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-embed-brand-gold/35 focus-visible:ring-offset-2 ${className}`}
      style={{
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderStyle: 'solid',
        borderColor: LOUPE_GOLD,
        borderRadius: 8,
        ...style,
      }}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
    >
      <svg
        viewBox="0 0 24 24"
        aria-hidden="true"
        className="h-[38px] w-[38px]"
        fill="none"
        stroke={LOUPE_GOLD}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="10.5" cy="10.5" r="5.75" />
        <path d="M15 15l4.25 4.25" />
      </svg>
    </button>
  );
}
