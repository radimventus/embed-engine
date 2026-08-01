import type { ReactNode } from 'react';

type AppShellProps = {
  readonly workspacePanel?: ReactNode;
  readonly publishPanel?: ReactNode;
  /** Sticky under header — not part of the scrolling canvas (PR-007). */
  readonly anchorRail?: ReactNode;
  readonly children: ReactNode;
  readonly denseMain?: boolean;
};

/**
 * PR-007 — Sticky Workspace + Anchor Rail + Inspector; only center canvas scrolls.
 */
export function AppShell({
  workspacePanel,
  publishPanel,
  anchorRail,
  children,
  denseMain: _denseMain = false,
}: AppShellProps) {
  void _denseMain;
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
      className={`grid h-full min-h-0 flex-1 overflow-hidden ${gridClass}`}
      data-studio-shell="builder-layout"
    >
      {workspacePanel !== undefined ? (
        <div className="platform-nav-rail h-full min-h-0 self-stretch overflow-hidden">
          {workspacePanel}
        </div>
      ) : null}
      <div className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
        {anchorRail !== undefined && anchorRail !== null ? (
          <div className="sticky top-0 z-20 shrink-0 border-b border-builder-line bg-builder-canvas px-8 pt-4">
            {anchorRail}
          </div>
        ) : null}
        <main className="platform-studio-pad min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
      {hasPublish ? (
        <div className="platform-inspector-rail h-full min-h-0 self-stretch overflow-hidden">
          {publishPanel}
        </div>
      ) : null}
    </div>
  );
}
