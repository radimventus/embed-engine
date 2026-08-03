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
    <div className="flex min-h-screen min-w-0" data-studio-shell="app">
      <div className="sticky top-0 hidden h-screen shrink-0 self-start overflow-y-auto desktop:block">
        {sidebar ?? <Sidebar items={sidebarItems} />}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {header ?? <Header studioTitle={studioTitle} />}
        <Workspace>{children}</Workspace>
        {showStatusBar ? <StatusBar status={status} /> : null}
      </div>
    </div>
  );
}
