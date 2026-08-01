import type { ReactNode } from 'react';

type AppShellProps = {
  readonly workspacePanel?: ReactNode;
  readonly publishPanel?: ReactNode;
  readonly children: ReactNode;
  /** Wider authoring surface (Experience Composer). */
  readonly denseMain?: boolean;
};

/**
 * VR-FIX-01 — Sticky Builder layout (Workspace | Canvas | Inspector).
 * Only the center workspace scrolls.
 */
export function AppShell({
  workspacePanel,
  publishPanel,
  children,
  denseMain = false,
}: AppShellProps) {
  const hasPublish = publishPanel !== undefined && publishPanel !== null;
  const gridClass =
    workspacePanel !== undefined
      ? hasPublish
        ? 'grid-cols-[260px_1fr_340px]'
        : 'grid-cols-[260px_1fr]'
      : hasPublish
        ? 'grid-cols-[1fr_340px]'
        : 'grid-cols-1';

  return (
    <div
      className={`grid min-h-0 flex-1 overflow-hidden ${gridClass}`}
      data-studio-shell="builder-layout"
    >
      {workspacePanel !== undefined ? (
        <div className="min-h-0 overflow-hidden">{workspacePanel}</div>
      ) : null}
      <main
        className={`min-h-0 min-w-0 overflow-y-auto ${
          denseMain ? 'px-6 py-6' : 'px-8 py-7'
        }`}
      >
        {children}
      </main>
      {hasPublish ? (
        <div className="min-h-0 overflow-hidden">{publishPanel}</div>
      ) : null}
    </div>
  );
}
