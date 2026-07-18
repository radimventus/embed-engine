const ICON_STROKE = '#D4AF37';
const ICON_SIZE_CLASS = 'h-8 w-8';

type SocialProofIconName = 'viewing' | 'saved' | 'inquiry';

type SocialProofIconProps = {
  name: SocialProofIconName;
};

/** Outline icons — themes match live viewing / save / plot inquiry. */
export function SocialProofIcon({ name }: SocialProofIconProps) {
  const common = {
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: ICON_STROKE,
    strokeWidth: 1.5,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    className: ICON_SIZE_CLASS,
    'aria-hidden': true as const,
  };

  switch (name) {
    case 'viewing':
      return (
        <svg {...common}>
          <circle cx="9" cy="8" r="2.5" />
          <circle cx="16" cy="9" r="2" />
          <path d="M3.5 18.5c.4-2.8 2.6-4.5 5.5-4.5s5.1 1.7 5.5 4.5" />
          <path d="M14 14.2c1.1-.7 2.5-1.1 4-1.1 2.3 0 4.1 1.2 4.5 3.4" />
        </svg>
      );
    case 'saved':
      return (
        <svg {...common}>
          <path d="M7 4.5h10a1.5 1.5 0 0 1 1.5 1.5v14l-6.5-3.5L5.5 20V6A1.5 1.5 0 0 1 7 4.5z" />
        </svg>
      );
    case 'inquiry':
      return (
        <svg {...common}>
          <rect x="3.5" y="8" width="12" height="10" rx="1" />
          <path d="M3.5 11.5h12M7.5 8v10" />
          <circle cx="17.5" cy="7" r="3.5" />
          <path d="M16.3 6.2c.2-.6.8-1 1.4-1 .8 0 1.4.5 1.4 1.2 0 .7-.4 1-1 1.3-.5.2-.8.5-.8 1.1M17.5 10.2h.01" />
        </svg>
      );
    default:
      return null;
  }
}

export type { SocialProofIconName };
