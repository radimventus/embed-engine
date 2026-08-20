import type { ReactNode } from 'react';

import { AUDIT_ACCENT, AUDIT_ON_ACCENT, type StationMotif } from './audit-panel';

type IconTone = 'gold' | 'onAccent';

type OutlineIconProps = {
  tone?: IconTone;
  className?: string;
};

function strokeFor(tone: IconTone): string {
  return tone === 'onAccent' ? AUDIT_ON_ACCENT : AUDIT_ACCENT;
}

function OutlineSvg({
  tone = 'gold',
  className = 'h-8 w-8',
  children,
}: OutlineIconProps & { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke={strokeFor(tone)}
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/** 🏠 house */
export function HouseIcon({ tone, className }: OutlineIconProps) {
  return (
    <OutlineSvg tone={tone} className={className}>
      <path d="M3.5 10.5 12 3.5l8.5 7V20.5H14v-6h-4v6H3.5z" />
    </OutlineSvg>
  );
}

/** 📍 pin */
export function PinIcon({ tone, className }: OutlineIconProps) {
  return (
    <OutlineSvg tone={tone} className={className}>
      <path d="M12 21s6.5-5.4 6.5-11.2A6.5 6.5 0 0 0 5.5 9.8C5.5 15.6 12 21 12 21z" />
      <circle cx="12" cy="9.8" r="2.3" />
    </OutlineSvg>
  );
}

/** 📋 document / checklist */
export function DocumentIcon({ tone, className }: OutlineIconProps) {
  return (
    <OutlineSvg tone={tone} className={className}>
      <path d="M7 3.5h7.5L19 8v12.5H7z" />
      <path d="M14.5 3.5V8H19M9.5 12h5M9.5 15.5h5M9.5 19h3.5" />
    </OutlineSvg>
  );
}

/** ✓ check */
export function CheckIcon({ tone, className }: OutlineIconProps) {
  return (
    <OutlineSvg tone={tone} className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 12.2 10.8 15 16 9.5" />
    </OutlineSvg>
  );
}

/** 🔍 search — seeking mode */
export function SearchIcon({ tone, className }: OutlineIconProps) {
  return (
    <OutlineSvg tone={tone} className={className}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4.2 4.2" />
    </OutlineSvg>
  );
}

export function UserIcon({ tone, className }: OutlineIconProps) {
  return (
    <OutlineSvg tone={tone} className={className}>
      <circle cx="12" cy="8.5" r="3.2" />
      <path d="M5.5 19.5c1.4-3.2 3.6-4.8 6.5-4.8s5.1 1.6 6.5 4.8" />
    </OutlineSvg>
  );
}

export function StationMotifIcon({
  motif,
  tone = 'gold',
  className = 'h-12 w-12',
}: {
  motif: StationMotif;
  tone?: IconTone;
  className?: string;
}) {
  switch (motif) {
    case 'house':
      return <HouseIcon tone={tone} className={className} />;
    case 'pin':
      return <PinIcon tone={tone} className={className} />;
    case 'document':
      return <DocumentIcon tone={tone} className={className} />;
    case 'check':
      return <CheckIcon tone={tone} className={className} />;
    default:
      return null;
  }
}
