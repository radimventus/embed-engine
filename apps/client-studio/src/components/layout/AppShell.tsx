import type { ReactNode } from 'react';

import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { StatusBar } from './StatusBar';
import { Workspace } from './Workspace';

type AppShellProps = {
  studioTitle: string;
  sidebarItems?: readonly string[];
  status?: string;
  children?: ReactNode;
};

export function AppShell({
  studioTitle,
  sidebarItems,
  status,
  children,
}: AppShellProps) {
  return (
    <div className="flex h-full min-h-screen bg-embed-background-primary">
      <Sidebar items={sidebarItems} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header studioTitle={studioTitle} />
        <Workspace>{children}</Workspace>
        <StatusBar status={status} />
      </div>
    </div>
  );
}
