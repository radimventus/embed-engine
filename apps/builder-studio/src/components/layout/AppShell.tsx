import type { ReactNode } from 'react';

type AppShellProps = {
  readonly header: ReactNode;
  readonly workspacePanel?: ReactNode;
  readonly sidebar: ReactNode;
  readonly publishPanel: ReactNode;
  readonly children: ReactNode;
};

/**
 * BuilderShell: Platform Header + Workspace + Project nav + canvas + readiness.
 */
export function AppShell({
  header,
  workspacePanel,
  sidebar,
  publishPanel,
  children,
}: AppShellProps) {
  const gridClass =
    workspacePanel !== undefined
      ? 'grid-cols-[220px_240px_1fr_360px]'
      : 'grid-cols-[260px_1fr_360px]';

  return (
    <div className="flex min-h-screen flex-col bg-builder-canvas text-builder-ink">
      {header}
      <div
        className={`grid min-h-0 flex-1 overflow-hidden ${gridClass}`}
      >
        {workspacePanel}
        {sidebar}
        <main className="min-w-0 overflow-y-auto px-9 py-9">{children}</main>
        {publishPanel}
      </div>
    </div>
  );
}
