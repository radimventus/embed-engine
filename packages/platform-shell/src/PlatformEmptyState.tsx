import type { ReactNode } from 'react';

type PlatformEmptyStateProps = {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
  readonly icon?: string;
};

/**
 * VR-FIX-02 — Unified empty state (click-model helper + CTA rhythm).
 */
export function PlatformEmptyState({
  title,
  description,
  action,
  icon = '◇',
}: PlatformEmptyStateProps) {
  return (
    <div className="platform-empty" data-testid="platform-empty-state">
      <div className="platform-empty__icon" aria-hidden>
        {icon}
      </div>
      <h3 className="platform-empty__title">{title}</h3>
      <p className="platform-empty__helper">{description}</p>
      {action !== undefined && (
        <div className="platform-empty__action">{action}</div>
      )}
    </div>
  );
}
