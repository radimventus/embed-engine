import type { ReactNode } from 'react';

type OperationsSurfaceProps = {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly children: ReactNode;
};

/**
 * VR-FIX-01 — Shared section chrome using click-model card hierarchy.
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
      className="mb-6 scroll-mt-4 rounded-[18px] border border-[rgba(0,25,48,0.06)] bg-white p-[26px] shadow-[0_4px_20px_rgba(0,0,0,0.02)]"
    >
      <header className="mb-5 max-w-3xl">
        <h2 className="text-lg font-semibold text-[#001930]">{title}</h2>
        <p className="mt-1 text-[13px] text-[#64748B]">{description}</p>
      </header>
      {children}
    </section>
  );
}
