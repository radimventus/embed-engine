import type { ReactNode } from 'react';
import { useMemo } from 'react';

import {
  PLATFORM_ROLE_LABELS,
  primaryRole,
  recordPlatformActivity,
  submitPlatformFeedback,
  usePlatformSession,
} from '@embed-engine/platform-access';
import {
  buildPlatformWorkspaceState,
  CapabilityInspector,
  PlatformShell,
  type PlatformBreadcrumbItem,
} from '@embed-engine/platform-shell';

import { getManagerCapabilityHost } from '../../studio/managerStudioComposition';
import { useManagerNav } from '../../features/manager-studio/foundation/ManagerNavProvider';
import { Workspace } from './Workspace';

type AppShellProps = {
  readonly sidebar: ReactNode;
  readonly children?: ReactNode;
};

/**
 * Manager Studio shell — Platform Access session + Capability Host (VR-FIX-04).
 */
export function AppShell({ sidebar, children }: AppShellProps) {
  const {
    session,
    bootstrap,
    registry,
    logout,
    clearStudio,
    selectStudio,
    selectProject,
  } = usePlatformSession();
  const { activeCapabilityId } = useManagerNav();
  const capabilityHost = useMemo(() => getManagerCapabilityHost(), []);
  const inspectorModel = capabilityHost.inspectorModel(activeCapabilityId);

  const workspaceState = buildPlatformWorkspaceState({
    companyLabel: bootstrap?.company.name ?? 'Firma',
    projectLabel: bootstrap?.project?.name ?? '—',
    projects: registry.projects.map((project) => ({
      id: project.id,
      label: project.name,
      companyLabel:
        registry.companies.find((company) => company.id === project.companyId)
          ?.name ?? 'Firma',
    })),
    onSelectProject: selectProject,
  });

  const sectionLabel =
    activeCapabilityId === 'launch-center'
      ? 'Launch'
      : activeCapabilityId === 'operations-center'
        ? 'Platform Ops'
        : activeCapabilityId === 'commercial-platform'
          ? 'Commercial'
          : activeCapabilityId === 'product-learning'
            ? 'Product Learning'
            : activeCapabilityId === 'customer-success'
              ? 'Customer Success'
              : 'Operations';

  const breadcrumb: readonly PlatformBreadcrumbItem[] = [
    { id: 'conis', label: 'CONIS', onSelect: clearStudio },
    { id: 'studio', label: 'Manager' },
    { id: 'company', label: bootstrap?.company.name ?? 'Firma' },
    { id: 'project', label: bootstrap?.project?.name ?? 'Projekt' },
    { id: 'section', label: sectionLabel },
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
      activeCapabilityId={activeCapabilityId}
      onLogout={logout}
      onOpenLanding={clearStudio}
      onSelectStudio={selectStudio}
      onSubmitFeedback={(message) => {
        submitPlatformFeedback({
          message,
          email: session?.user.email ?? null,
          studioId: 'manager',
          companyId: session?.companyId ?? null,
        });
        recordPlatformActivity({
          label: 'Feedback',
          detail: message.slice(0, 80),
        });
      }}
    >
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="platform-nav-rail sticky top-0 h-full shrink-0 self-stretch overflow-y-auto">
          {sidebar}
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <Workspace>{children}</Workspace>
        </div>
        <div className="platform-inspector-rail sticky top-0 h-full self-stretch overflow-hidden">
          <CapabilityInspector model={inspectorModel} />
        </div>
      </div>
    </PlatformShell>
  );
}
