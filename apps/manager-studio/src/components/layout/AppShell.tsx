import type { ReactNode } from 'react';

import { Workspace } from './Workspace';

type AppShellProps = {
  readonly header: ReactNode;
  readonly sidebar: ReactNode;
  readonly children?: ReactNode;
};

/**
 * Single shell composition for Manager Studio (MSCB-01).
 */
export function AppShell({ header, sidebar, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <div className="sticky top-0 h-screen shrink-0 self-start overflow-y-auto">
        {sidebar}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        {header}
        <Workspace>{children}</Workspace>
      </div>
    </div>
  );
}
