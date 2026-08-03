/**
 * OF-01 — Office Studio application shell.
 * OF-02 — Partner Workspace route under Partneři.
 */

import { useCallback, useEffect, useState } from 'react';

import {
  PLATFORM_ROLE_LABELS,
  primaryRole,
  recordPlatformActivity,
  submitPlatformFeedback,
  usePlatformSession,
} from '@embed-engine/platform-access';
import {
  buildPlatformWorkspaceState,
  PlatformShell,
  type PlatformBreadcrumbItem,
} from '@embed-engine/platform-shell';

import { OfficeSidebar } from './components/OfficeSidebar';
import { OfficeDashboardPage } from './features/OfficeDashboardPage';
import { OfficeSectionPage } from './features/OfficeSectionPage';
import { PartnersWorkspacePage } from './features/partners/PartnersWorkspacePage';
import { getPartner } from './office/officePartnerRegistry';
import {
  officeHref,
  officeRouteLabel,
  parseOfficeLocation,
  type OfficeLocation,
  type OfficeRouteId,
} from './office/officeRoutes';

function readLocation(): OfficeLocation {
  return parseOfficeLocation(window.location.pathname);
}

export function OfficeStudioApp() {
  const { session, bootstrap, logout, clearStudio, selectStudio } =
    usePlatformSession();
  const [location, setLocation] = useState<OfficeLocation>(readLocation);

  useEffect(() => {
    const onPopState = () => setLocation(readLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((next: OfficeRouteId) => {
    const href = officeHref(next);
    window.history.pushState(null, '', href);
    setLocation({ routeId: next, partnerId: null });
  }, []);

  const openPartner = useCallback((partnerId: string) => {
    const href = officeHref('partners', partnerId);
    window.history.pushState(null, '', href);
    setLocation({ routeId: 'partners', partnerId });
  }, []);

  const workspaceState = buildPlatformWorkspaceState({
    companyLabel: bootstrap?.company.name ?? 'Firma',
    projectLabel: bootstrap?.project?.name ?? '—',
    projects: [],
  });

  const partnerLabel =
    location.routeId === 'partners' && location.partnerId !== null
      ? (getPartner(location.partnerId)?.name ?? officeRouteLabel('partners'))
      : officeRouteLabel(location.routeId);

  const breadcrumb: readonly PlatformBreadcrumbItem[] = [
    { id: 'conis', label: 'CONIS', onSelect: clearStudio },
    { id: 'studio', label: 'Office' },
    { id: 'company', label: bootstrap?.company.name ?? 'Firma' },
    { id: 'section', label: partnerLabel },
  ];

  return (
    <PlatformShell
      activeStudioId="office"
      userLabel={session?.user.displayName ?? 'Host'}
      roleLabel={
        session !== null
          ? PLATFORM_ROLE_LABELS[primaryRole(session.user.roles)]
          : undefined
      }
      workspace={workspaceState}
      breadcrumb={breadcrumb}
      capabilityHost={null}
      onLogout={logout}
      onOpenLanding={clearStudio}
      onSelectStudio={selectStudio}
      onSubmitFeedback={(message) => {
        submitPlatformFeedback({
          message,
          email: session?.user.email ?? null,
          studioId: 'office',
          companyId: session?.companyId ?? null,
        });
        recordPlatformActivity({
          label: 'Zpětná vazba',
          detail: message.slice(0, 80),
        });
      }}
    >
      <div className="office-workspace">
        <div className="platform-nav-rail office-workspace__rail">
          <OfficeSidebar
            activeRouteId={location.routeId}
            onNavigate={navigate}
          />
        </div>
        <main className="platform-studio-pad office-workspace__main">
          {location.routeId === 'dashboard' ? (
            <OfficeDashboardPage />
          ) : location.routeId === 'partners' ? (
            <PartnersWorkspacePage
              selectedPartnerId={location.partnerId}
              onSelectPartner={openPartner}
            />
          ) : (
            <OfficeSectionPage routeId={location.routeId} />
          )}
        </main>
      </div>
    </PlatformShell>
  );
}
