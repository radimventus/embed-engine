import type { ReactNode } from 'react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { Workspace } from './Workspace';

type AppShellProps = {
  studioTitle?: string;
  sidebarItems?: readonly string[];
  status?: string;
  header?: ReactNode;
  sidebar?: ReactNode;
  showStatusBar?: boolean;
  children?: ReactNode;
};

export function AppShell({
  studioTitle = 'Studio',
  sidebarItems,
  status,
  header,
  sidebar,
  showStatusBar = true,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-full min-h-screen bg-embed-background-primary">
      {sidebar ?? <Sidebar items={sidebarItems} />}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {header ?? <Header studioTitle={studioTitle} />}
        <Workspace>{children}</Workspace>
        {showStatusBar ? <StatusBar status={status} /> : null}
      </div>
    </div>
  );
}
