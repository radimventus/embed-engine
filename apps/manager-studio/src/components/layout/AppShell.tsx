import type { ReactNode } from 'react';
import { useMemo } from 'react';

import {
  CapabilityInspector,
  PlatformShell,
  type PlatformBreadcrumbItem,
  type PlatformWorkspaceState,
} from '@embed-engine/platform-shell';

import { getManagerCapabilityHost } from '../../studio/managerStudioComposition';
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
 * Single shell composition for Manager Studio (MSCB-01 + EPIC-BX-11/13).
 * Platform Shell loads Capability Host from Manager composition.
 */
export function AppShell({ sidebar, children }: AppShellProps) {
  const capabilityHost = useMemo(() => getManagerCapabilityHost(), []);
  const inspectorModel = capabilityHost.inspectorModel('operations');

  return (
    <PlatformShell
      activeStudioId="manager"
      userLabel="Radim"
      workspace={MANAGER_WORKSPACE}
      breadcrumb={MANAGER_BREADCRUMB}
      capabilityHost={capabilityHost}
      activeCapabilityId="operations"
    >
      <div className="flex min-h-0 flex-1">
        <div className="sticky top-0 h-[calc(100vh-var(--platform-header-height,72px)-41px-36px)] shrink-0 self-start overflow-y-auto">
          {sidebar}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <Workspace>{children}</Workspace>
        </div>
        <div className="w-[300px] shrink-0">
          <CapabilityInspector model={inspectorModel} />
        </div>
      </div>
    </PlatformShell>
  );
}
