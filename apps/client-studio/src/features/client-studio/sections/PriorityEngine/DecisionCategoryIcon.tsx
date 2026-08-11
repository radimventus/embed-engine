const ICON_STROKE = '#D4AF37';
/** ~20% larger than the former 32px card icon. */
const ICON_SIZE_CLASS = 'h-[38px] w-[38px]';

type DecisionCategoryIconProps = {
  categoryId: string;
};

/** Uniform outline icon set — gold stroke, no fills. */
export function DecisionCategoryIcon({ categoryId }: DecisionCategoryIconProps) {
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

  switch (categoryId) {
    case 'energy':
      return (
        <svg {...common}>
          <path d="M13 2 4.5 13.5H12l-.5 8.5L20.5 10H13l0-8z" />
        </svg>
      );
    case 'operating-costs':
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 7v10M9.5 9.5c.8-1 2.2-1.5 3.5-1 1.5.6 2 2 1.2 3.2-.6.9-1.7 1.3-2.7 1.8-1 .5-2.1.9-2.7 1.8-.8 1.2-.3 2.6 1.2 3.2 1.3.5 2.7 0 3.5-1" />
        </svg>
      );
    case 'layout':
      return (
        <svg {...common}>
          <rect x="3.5" y="3.5" width="17" height="17" rx="1.5" />
          <path d="M3.5 10h17M10 10v10.5" />
        </svg>
      );
    case 'privacy':
      return (
        <svg {...common}>
          <rect x="5" y="11" width="14" height="10" rx="1.5" />
          <path d="M8 11V8a4 4 0 0 1 8 0v3" />
        </svg>
      );
    case 'design':
      return (
        <svg {...common}>
          <path d="M5 19 12 4l7 15" />
          <path d="M8.5 13h7" />
        </svg>
      );
    case 'quality':
      return (
        <svg {...common}>
          <path d="M12 3.5 14.2 9h5.8l-4.7 3.5 1.8 5.5L12 14.8 6.9 18l1.8-5.5L4 9h5.8L12 3.5z" />
        </svg>
      );
    case 'plot':
      return (
        <svg {...common}>
          <path d="M4 20h16M6 20V10l6-5 6 5v10" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case 'investment':
      return (
        <svg {...common}>
          <path d="M4 18V6M4 18h16" />
          <path d="M7 14l4-4 3 3 5-6" />
        </svg>
      );
    case 'maintenance':
      return (
        <svg {...common}>
          <path d="M14.7 6.3a4.5 4.5 0 0 0-6.1 6.1L4 17l3 3 4.6-4.6a4.5 4.5 0 0 0 6.1-6.1l-2.5 2.5-2.5-2.5 2.5-2.5z" />
        </svg>
      );
    case 'flexibility':
      return (
        <svg {...common}>
          <path d="M7 7h7a3 3 0 0 1 0 6H9" />
          <path d="M10 4 7 7l3 3" />
          <path d="M17 17H10a3 3 0 0 1 0-6h5" />
          <path d="M14 20 17 17l-3-3" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
        </svg>
      );
  }
}
