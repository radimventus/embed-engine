import type { ReactNode } from 'react';

type AppShellProps = {
  readonly header: ReactNode;
  readonly sidebar: ReactNode;
  readonly publishPanel: ReactNode;
  readonly children: ReactNode;
};

/**
 * BuilderShell layout (IMP-03): Header + Sidebar + Workspace + Publish Panel.
 * Presentation only — no business logic.
 */
export function AppShell({
  header,
  sidebar,
  publishPanel,
  children,
}: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-builder-canvas text-builder-ink">
      {header}
      <div className="grid min-h-0 flex-1 grid-cols-[260px_1fr_360px] overflow-hidden">
        {sidebar}
        <main className="min-w-0 overflow-y-auto px-9 py-9">{children}</main>
        {publishPanel}
      </div>
    </div>
  );
}
