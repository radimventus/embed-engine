import type { ReactNode } from 'react';

import { AUDIT_ACCENT, AUDIT_ON_ACCENT } from './audit-panel';

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

export function LockIcon({ tone, className }: OutlineIconProps) {
  return (
    <OutlineSvg tone={tone} className={className}>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </OutlineSvg>
  );
}

export function UserIcon({ tone, className }: OutlineIconProps) {
  return (
    <OutlineSvg tone={tone} className={className}>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 19c1.8-3 4-4.5 7-4.5S17.2 16 19 19" />
    </OutlineSvg>
  );
}
