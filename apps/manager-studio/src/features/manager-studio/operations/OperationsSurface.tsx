import type { ReactNode } from 'react';

type OperationsSurfaceProps = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
};

/**
 * Shared Operations Terminal section chrome (MSCB-01).
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
      className="scroll-mt-header border-b border-embed-border-default bg-embed-background-primary px-section py-section"
    >
      <header className="mb-4 max-w-3xl">
        <h2 className="text-lg font-medium text-embed-foreground-primary">
          {title}
        </h2>
        <p className="mt-1 text-sm text-embed-foreground-primary/60">
          {description}
        </p>
      </header>
      {children}
    </section>
  );
}
