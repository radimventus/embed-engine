import type { ReactNode } from 'react';
import { useMemo } from 'react';

import {
  PLATFORM_ROLE_LABELS,
  primaryRole,
  recordPlatformActivity,
  submitPlatformFeedback,
  usePlatformSession,
  useStudioBrandProjection,
} from '@embed-engine/platform-access';
import {
  buildPlatformWorkspaceState,
  PlatformShell,
  type PlatformBreadcrumbItem,
} from '@embed-engine/platform-shell';

import { getManagerCapabilityHost } from '../../studio/managerStudioComposition';
import { useManagerNav } from '../../features/manager-studio/foundation/ManagerNavProvider';
import { partnerSectionLabel } from '../../features/manager-studio/partnerNav';
import { Workspace } from './Workspace';

type AppShellProps = {
  readonly sidebar: ReactNode;
  readonly children?: ReactNode;
};

/**
 * Manager Studio shell — partner work center (PR-026).
 * Capability Host remains composed; Inspector is not shown in partner UI.
 * PE-02 — company / logo / hero from Brand Projection.
 */
export function AppShell({ sidebar, children }: AppShellProps) {
  const {
    session,
    bootstrap,
    logout,
    clearStudio,
    selectStudio,
  } = usePlatformSession();
  const { activeCapabilityId, activeSectionId } = useManagerNav();
  const capabilityHost = useMemo(() => getManagerCapabilityHost(), []);
  const brand = useStudioBrandProjection();

  const workspaceState = buildPlatformWorkspaceState({
    companyLabel: brand.companyName,
    projectLabel: bootstrap?.project?.name ?? '—',
    projects: [],
  });

  const breadcrumb: readonly PlatformBreadcrumbItem[] = [
    { id: 'conis', label: 'CONIS', onSelect: clearStudio },
    { id: 'studio', label: 'Manager' },
    { id: 'company', label: brand.tradeMark },
    { id: 'project', label: bootstrap?.project?.name ?? 'Projekt' },
    { id: 'section', label: partnerSectionLabel(activeSectionId) },
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
      partnerBrandLabel={brand.logoLabel}
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
          label: 'Zpětná vazba',
          detail: message.slice(0, 80),
        });
      }}
    >
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <div className="platform-nav-rail sticky top-0 h-full shrink-0 self-stretch overflow-y-auto">
          {sidebar}
        </div>
        <div className="min-h-0 min-w-0 flex-1 overflow-y-auto">
          <Workspace brand={brand}>{children}</Workspace>
        </div>
      </div>
    </PlatformShell>
  );
}
