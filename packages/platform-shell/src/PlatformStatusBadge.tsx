export type PlatformStatusTone =
  | 'pass'
  | 'warning'
  | 'fail'
  | 'ready'
  | 'draft'
  | 'published'
  | 'info'
  | 'gold';

const TONE_CLASS: Record<PlatformStatusTone, string> = {
  pass: 'platform-badge--pass',
  warning: 'platform-badge--warning',
  fail: 'platform-badge--fail',
  ready: 'platform-badge--ready',
  draft: 'platform-badge--draft',
  published: 'platform-badge--published',
  info: 'platform-badge--info',
  gold: 'platform-badge--gold',
};

type PlatformStatusBadgeProps = {
  readonly tone: PlatformStatusTone;
  readonly children: string;
};

/**
 * VR-FIX-02 — Unified status badge (click-model badge grammar).
 */
export function PlatformStatusBadge({
  tone,
  children,
}: PlatformStatusBadgeProps) {
  return (
    <span className={`platform-badge ${TONE_CLASS[tone]}`}>{children}</span>
  );
}

export function statusToneFromLabel(label: string): PlatformStatusTone {
  const value = label.toUpperCase();
  if (value.includes('PUBLISH')) return 'published';
  if (value.includes('DRAFT')) return 'draft';
  if (value.includes('READY')) return 'ready';
  if (value.includes('PASS') || value.includes('HEALTHY')) return 'pass';
  if (value.includes('FAIL') || value.includes('BLOCK') || value.includes('ERROR')) {
    return 'fail';
  }
  if (value.includes('WARN') || value.includes('TODO') || value.includes('ATTENTION')) {
    return 'warning';
  }
  return 'info';
}
