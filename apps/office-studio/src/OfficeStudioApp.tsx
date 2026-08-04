/**
 * OF-01 — Office Studio application shell.
 * OF-02 Partner · OF-03 Sales · OF-04 Documents · OF-05 Handoff · OF-06 Pilot Runtime.
 * CAP-OP-10A — Global Project Context + Working Terminal work surface.
 */

import { useCallback, useEffect, useState } from 'react';

import {
  PLATFORM_ROLE_LABELS,
  primaryRole,
  recordPlatformActivity,
  submitPlatformFeedback,
  usePlatformSession,
  isWorkspaceShellEmbed,
  isOperatorWorkspaceMode,
} from '@embed-engine/platform-access';
import {
  buildPlatformWorkspaceState,
  PlatformShell,
  type PlatformBreadcrumbItem,
} from '@embed-engine/platform-shell';

import { OfficeSidebar } from './components/OfficeSidebar';
import { DocumentsWorkspacePage } from './features/documents/DocumentsWorkspacePage';
import { ImplementationWorkspacePage } from './features/implementation/ImplementationWorkspacePage';
import { OfficeDashboardPage } from './features/OfficeDashboardPage';
import { OfficeSectionPage } from './features/OfficeSectionPage';
import { PartnersWorkspacePage } from './features/partners/PartnersWorkspacePage';
import { PilotRuntimePage } from './features/pilot/PilotRuntimePage';
import { OfficeWorkSurface } from './features/pilot-workspace/OfficeWorkSurface';
import { SalesWorkspacePage } from './features/sales/SalesWorkspacePage';
import { DEFAULT_PILOT_MAILBOX_ID } from './mail';
import {
  PilotWorkspaceProvider,
  usePilotWorkspaceContext,
} from './office/PilotWorkspaceContext';
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

type PartnerScopedRoute =
  | 'partners'
  | 'sales'
  | 'documents'
  | 'implementation';

export function OfficeStudioApp() {
  return (
    <PilotWorkspaceProvider defaultMailboxId={DEFAULT_PILOT_MAILBOX_ID}>
      <OfficeStudioAppInner />
    </PilotWorkspaceProvider>
  );
}

function OfficeStudioAppInner() {
  const { session, bootstrap, logout, clearStudio, selectStudio } =
    usePlatformSession();
  const { activeCase } = usePilotWorkspaceContext();
  const [location, setLocation] = useState<OfficeLocation>(readLocation);

  useEffect(() => {
    const onPopState = () => setLocation(readLocation());
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    /** Legacy Pilot Workspace URL → global work surface. */
    if (window.location.pathname.includes('pilot-workspace')) {
      const href = officeHref('work');
      window.history.replaceState(null, '', href);
      setLocation({ routeId: 'work', partnerId: null });
    }
  }, []);

  const navigate = useCallback((next: OfficeRouteId) => {
    const href = officeHref(next);
    window.history.pushState(null, '', href);
    setLocation({ routeId: next, partnerId: null });
  }, []);

  const openPartnerScoped = useCallback(
    (routeId: PartnerScopedRoute, partnerId: string) => {
      const href = officeHref(routeId, partnerId);
      window.history.pushState(null, '', href);
      setLocation({ routeId, partnerId });
    },
    [],
  );

  const workspaceState = buildPlatformWorkspaceState({
    companyLabel: bootstrap?.company.name ?? 'Firma',
    projectLabel: activeCase?.label ?? bootstrap?.project?.name ?? '—',
    projects: [],
  });

  const isPartnerScoped =
    location.routeId === 'partners' ||
    location.routeId === 'sales' ||
    location.routeId === 'documents' ||
    location.routeId === 'implementation';

  const sectionLabel =
    location.routeId === 'work'
      ? (activeCase?.label ?? 'Working Terminal')
      : location.routeId === 'settings'
        ? 'Pilot Runtime'
        : isPartnerScoped && location.partnerId !== null
          ? (getPartner(location.partnerId)?.name ??
            officeRouteLabel(location.routeId))
          : officeRouteLabel(location.routeId);

  const breadcrumb: readonly PlatformBreadcrumbItem[] = [
    { id: 'conis', label: 'CONIS', onSelect: clearStudio },
    { id: 'studio', label: 'Office' },
    { id: 'company', label: bootstrap?.company.name ?? 'Firma' },
    { id: 'section', label: sectionLabel },
  ];

  const mainContent =
    location.routeId === 'work' ? (
      <OfficeWorkSurface />
    ) : location.routeId === 'dashboard' ? (
      <OfficeDashboardPage />
    ) : location.routeId === 'partners' ? (
      <PartnersWorkspacePage
        selectedPartnerId={location.partnerId}
        onSelectPartner={(partnerId) =>
          openPartnerScoped('partners', partnerId)
        }
      />
    ) : location.routeId === 'sales' ? (
      <SalesWorkspacePage
        selectedPartnerId={location.partnerId}
        onSelectPartner={(partnerId) => openPartnerScoped('sales', partnerId)}
      />
    ) : location.routeId === 'documents' ? (
      <DocumentsWorkspacePage
        selectedPartnerId={location.partnerId}
        onSelectPartner={(partnerId) =>
          openPartnerScoped('documents', partnerId)
        }
      />
    ) : location.routeId === 'implementation' ? (
      <ImplementationWorkspacePage
        selectedPartnerId={location.partnerId}
        onSelectPartner={(partnerId) =>
          openPartnerScoped('implementation', partnerId)
        }
      />
    ) : location.routeId === 'settings' ? (
      <PilotRuntimePage
        onOpenPartner={(partnerId) =>
          openPartnerScoped('partners', partnerId)
        }
      />
    ) : (
      <OfficeSectionPage routeId={location.routeId} />
    );

  const workspaceBody = (
    <div
      className="office-workspace"
      data-workspace-embed-view={isWorkspaceShellEmbed() ? 'office' : undefined}
      data-office-project-id={activeCase?.id ?? undefined}
    >
      <div className="platform-nav-rail office-workspace__rail">
        <OfficeSidebar
          activeRouteId={location.routeId}
          onNavigate={navigate}
        />
      </div>
      <main
        className={
          location.routeId === 'work'
            ? 'platform-studio-pad office-workspace__main office-workspace__main--work'
            : 'platform-studio-pad office-workspace__main'
        }
      >
        {mainContent}
      </main>
    </div>
  );

  if (isWorkspaceShellEmbed()) {
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
        contentOnly
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
        {workspaceBody}
      </PlatformShell>
    );
  }

  // VR-05 — PE mode never shows Legacy Platform Studio Switcher.
  if (isOperatorWorkspaceMode()) {
    return workspaceBody;
  }

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
      {workspaceBody}
    </PlatformShell>
  );
}
