/**
 * OF-01 — Office Studio application shell.
 * OF-02 Partner · OF-03 Sales · OF-04 Documents · OF-05 Handoff · OF-06 Pilot Runtime.
 * CAP-OP-10A — Global Project Context + Working Terminal work surface.
 */

import { useCallback, useEffect, useMemo, useState } from 'react';

import {
  getCanonicalProject,
  PLATFORM_ROLE_LABELS,
  primaryRole,
  recordPlatformActivity,
  submitPlatformFeedback,
  usePlatformSession,
  isWorkspaceShellEmbed,
  withCurrentSearchParams,
  workspaceStudiosForRoles,
} from '@embed-engine/platform-access';
import {
  buildPlatformWorkspaceState,
  buildWorkspaceBreadcrumb,
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
import { CommercialJourneySurface } from './features/pilot-workspace/CommercialJourneySurface';
import { SalesWorkspacePage } from './features/sales/SalesWorkspacePage';
import { DEFAULT_PILOT_MAILBOX_ID } from './mail';
import { createOfficeHostWorkflowAutomation } from './office/officeAutomationHost';
import {
  PilotWorkspaceProvider,
  usePilotWorkspaceContext,
} from './office/PilotWorkspaceContext';
import { getPartner, hydrateOfficePartnersFromServer } from './office/officePartnerRegistry';
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
  const workflowAutomation = useMemo(
    () => createOfficeHostWorkflowAutomation(),
    [],
  );

  return (
    <PilotWorkspaceProvider
      defaultMailboxId={DEFAULT_PILOT_MAILBOX_ID}
      workflowIntegrations={workflowAutomation}
    >
      <OfficeStudioAppInner />
    </PilotWorkspaceProvider>
  );
}

function OfficeStudioAppInner() {
  const [, setOfficePartnerAuthorityRevision] = useState(0);
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
    void hydrateOfficePartnersFromServer()
      .then(() => {
        setOfficePartnerAuthorityRevision((value) => value + 1);
      })
      .catch(() => {
        // Partner form keeps the last known in-memory snapshot until save succeeds.
      });
  }, []);

  useEffect(() => {
    /** Legacy Pilot Workspace URL → global work surface. */
    if (window.location.pathname.includes('pilot-workspace')) {
      const href = withCurrentSearchParams(officeHref('work'));
      window.history.replaceState(null, '', href);
      setLocation({ routeId: 'work', partnerId: null });
    }
  }, []);

  const navigate = useCallback((next: OfficeRouteId) => {
    const href = withCurrentSearchParams(officeHref(next));
    window.history.pushState(null, '', href);
    setLocation({ routeId: next, partnerId: null });
  }, []);

  const openPartnerScoped = useCallback(
    (routeId: PartnerScopedRoute, partnerId: string) => {
      const href = withCurrentSearchParams(officeHref(routeId, partnerId));
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
      : location.routeId === 'commercial-journey'
        ? (activeCase?.label ?? 'Partner Commercial Journey')
      : location.routeId === 'settings'
        ? 'Pilot Runtime'
        : isPartnerScoped && location.partnerId !== null
          ? (getPartner(location.partnerId)?.name ??
            officeRouteLabel(location.routeId))
          : officeRouteLabel(location.routeId);

  const canonicalProject =
    session?.projectId !== null && session?.projectId !== undefined
      ? getCanonicalProject(session.projectId)
      : null;

  const breadcrumb: readonly PlatformBreadcrumbItem[] =
    canonicalProject !== null
      ? buildWorkspaceBreadcrumb({
          projectSlug: canonicalProject.project.slug,
          studioLabel: 'Office Studio',
          onOpenWorkspace: clearStudio,
          trailing: [{ id: 'section', label: sectionLabel }],
        })
      : [
          { id: 'conis', label: 'CONIS', onSelect: clearStudio },
          { id: 'workspace', label: 'Workspace' },
          { id: 'project', label: 'Projekt' },
          { id: 'studio', label: 'Office Studio' },
          { id: 'section', label: sectionLabel },
        ];

  const mainContent =
    location.routeId === 'work' ? (
      <OfficeWorkSurface />
    ) : location.routeId === 'commercial-journey' ? (
      <CommercialJourneySurface />
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
          location.routeId === 'work' ||
          location.routeId === 'commercial-journey'
            ? 'platform-studio-pad office-workspace__main office-workspace__main--work'
            : 'platform-studio-pad office-workspace__main'
        }
      >
        {mainContent}
      </main>
    </div>
  );

  // PT-OS-02 / VR01 — nested in Workspace Host: never render a second PlatformShell.
  if (isWorkspaceShellEmbed()) {
    return workspaceBody;
  }

  // Standalone Office — single PlatformShell with Studio Switcher SSOT.
  return (
    <PlatformShell
      activeStudioId="office"
        availableStudioIds={workspaceStudiosForRoles(session?.user.roles ?? [])}
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
