import type { ReactNode } from 'react';

type AppShellProps = {
  readonly header: ReactNode;
  readonly workspacePanel?: ReactNode;
  readonly sidebar: ReactNode;
  readonly publishPanel?: ReactNode;
  readonly children: ReactNode;
  /** Wider authoring surface (Experience Composer). */
  readonly denseMain?: boolean;
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
  denseMain = false,
}: AppShellProps) {
  const hasPublish = publishPanel !== undefined && publishPanel !== null;
  const gridClass =
    workspacePanel !== undefined
      ? hasPublish
        ? 'grid-cols-[240px_200px_1fr_300px]'
        : 'grid-cols-[240px_200px_1fr]'
      : hasPublish
        ? 'grid-cols-[260px_1fr_360px]'
        : 'grid-cols-[260px_1fr]';

  return (
    <div className="flex min-h-screen flex-col bg-builder-canvas text-builder-ink">
      {header}
      <div className={`grid min-h-0 flex-1 overflow-hidden ${gridClass}`}>
        {workspacePanel}
        {sidebar}
        <main
          className={`min-w-0 overflow-y-auto ${
            denseMain ? 'p-4' : 'px-9 py-9'
          }`}
        >
          {children}
        </main>
        {hasPublish ? publishPanel : null}
      </div>
    </div>
  );
}
