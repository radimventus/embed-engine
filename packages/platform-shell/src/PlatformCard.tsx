import type { ReactNode } from 'react';

type PlatformCardProps = {
  readonly title?: string;
  readonly description?: string;
  readonly action?: ReactNode;
  readonly children: ReactNode;
  readonly className?: string;
};

/**
 * VR-FIX-02 — Unified card shell (click-model .card).
 */
export function PlatformCard({
  title,
  description,
  action,
  children,
  className = '',
}: PlatformCardProps) {
  const hasHeader =
    (title !== undefined && title.length > 0) ||
    (description !== undefined && description.length > 0) ||
    action !== undefined;

  return (
    <section className={`platform-card ${className}`.trim()}>
      {hasHeader && (
        <div className="platform-card__header">
          <div>
            {title !== undefined && title.length > 0 && (
              <h3 className="platform-card__title">{title}</h3>
            )}
            {description !== undefined && description.length > 0 && (
              <p className="platform-card__desc">{description}</p>
            )}
          </div>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}
