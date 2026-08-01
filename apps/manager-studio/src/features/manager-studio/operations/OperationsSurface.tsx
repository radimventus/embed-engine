import type { ReactNode } from 'react';

type OperationsSurfaceProps = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
};

/**
 * VR-FIX-02 — Manager section surface using unified Platform Card system.
 */
export function OperationsSurface({
  id,
  title,
  description,
  children,
}: OperationsSurfaceProps) {
  return (
    <section
      id={id}
      tabIndex={-1}
      aria-label={title}
      className="platform-card mb-6 scroll-mt-4"
    >
      <header className="platform-card__header">
        <div>
          <h2 className="platform-card__title">{title}</h2>
          <p className="platform-card__desc">{description}</p>
        </div>
      </header>
      {children}
    </section>
  );
}
