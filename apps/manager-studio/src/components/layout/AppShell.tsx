import type { ReactNode } from 'react';

import {
  PlatformShell,
  type PlatformBreadcrumbItem,
  type PlatformWorkspaceState,
} from '@embed-engine/platform-shell';

import { Workspace } from './Workspace';

type AppShellProps = {
  readonly sidebar: ReactNode;
  readonly children?: ReactNode;
};

const MANAGER_WORKSPACE: PlatformWorkspaceState = {
  companyLabel: 'AC Modular',
  projectLabel: 'Harmony 124',
  projects: [
    {
      id: 'harmony-124',
      label: 'Harmony 124',
      companyLabel: 'AC Modular',
    },
    {
      id: 'family-98',
      label: 'Family 98',
      companyLabel: 'AC Modular',
    },
  ],
};

const MANAGER_BREADCRUMB: readonly PlatformBreadcrumbItem[] = [
  { id: 'conis', label: 'CONIS' },
  { id: 'studio', label: 'Manager' },
  { id: 'company', label: 'AC Modular' },
  { id: 'project', label: 'Harmony 124' },
  { id: 'section', label: 'Operations' },
];

/**
 * Single shell composition for Manager Studio (MSCB-01 + EPIC-BX-11).
 * Platform Header is shared via `@embed-engine/platform-shell`.
 */
export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <PlatformShell
      activeStudioId="manager"
      userLabel="Radim"
      workspace={MANAGER_WORKSPACE}
      breadcrumb={MANAGER_BREADCRUMB}
    >
      <div className="flex min-h-0 flex-1">
        <div className="sticky top-0 h-[calc(100vh-var(--platform-header-height,72px)-41px)] shrink-0 self-start overflow-y-auto">
          {sidebar}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <Workspace>{children}</Workspace>
        </div>
      </div>
    </PlatformShell>
  );
}
