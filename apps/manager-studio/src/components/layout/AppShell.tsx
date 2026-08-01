import type { ReactNode } from 'react';
import { useMemo } from 'react';

import {
  PLATFORM_ROLE_LABELS,
  primaryRole,
  usePlatformSession,
} from '@embed-engine/platform-access';
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

/**
 * Manager Studio shell — Platform Access session + Capability Host (BX-11..14).
 */
export function AppShell({ sidebar, children }: AppShellProps) {
  const {
    session,
    bootstrap,
    registry,
    logout,
    clearStudio,
    selectProject,
  } = usePlatformSession();
  const capabilityHost = useMemo(() => getManagerCapabilityHost(), []);
  const inspectorModel = capabilityHost.inspectorModel('operations');

  const workspaceState: PlatformWorkspaceState = {
    companyLabel: bootstrap?.company.name ?? 'Company',
    projectLabel: bootstrap?.project?.name ?? '—',
    projects: registry.projects.map((project) => ({
      id: project.id,
      label: project.name,
      companyLabel:
        registry.companies.find((company) => company.id === project.companyId)
          ?.name ?? 'Firma',
    })),
    onSelectProject: selectProject,
  };

  const breadcrumb: readonly PlatformBreadcrumbItem[] = [
    { id: 'conis', label: 'CONIS' },
    { id: 'studio', label: 'Manager' },
    { id: 'company', label: bootstrap?.company.name ?? 'Company' },
    { id: 'project', label: bootstrap?.project?.name ?? 'Projekt' },
    { id: 'section', label: 'Operations' },
  ];

  return (
    <PlatformShell
      activeStudioId="manager"
      userLabel={session?.user.displayName ?? 'Host'}
      roleLabel={
        session !== null
          ? PLATFORM_ROLE_LABELS[primaryRole(session.user.roles)]
          : undefined
      }
      workspace={workspaceState}
      breadcrumb={breadcrumb}
      capabilityHost={capabilityHost}
      activeCapabilityId="operations"
      onLogout={logout}
      onOpenLanding={clearStudio}
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
