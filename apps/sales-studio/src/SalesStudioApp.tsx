import { useMemo } from 'react';

import { analyzeCustomerSuccess } from '@embed-engine/customer-success';
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
  PlatformCard,
  PlatformEmptyState,
  PlatformShell,
  PlatformStatusBadge,
  type PlatformBreadcrumbItem,
} from '@embed-engine/platform-shell';

import { getSalesCapabilityHost } from './studio/salesStudioComposition';

/**
 * VR-FIX-04 — Sales Studio on the same cross-studio journey grammar.
 */
export function SalesStudioApp() {
  const {
    session,
    bootstrap,
    registry,
    logout,
    clearStudio,
    selectStudio,
    selectProject,
  } = usePlatformSession();
  const capabilityHost = useMemo(() => getSalesCapabilityHost(), []);
  const inspectorModel = capabilityHost.inspectorModel('customer-success');
  const success = useMemo(
    () => analyzeCustomerSuccess({ session }),
    [session],
  );

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

  const breadcrumb: readonly PlatformBreadcrumbItem[] = [
    { id: 'conis', label: 'CONIS', onSelect: clearStudio },
    { id: 'studio', label: 'Sales' },
    { id: 'company', label: bootstrap?.company.name ?? 'Firma' },
    { id: 'project', label: bootstrap?.project?.name ?? 'Projekt' },
    { id: 'section', label: 'Customer Success' },
  ];

  const healthTone =
    success?.health === 'Healthy'
      ? 'pass'
      : success?.health === 'At Risk'
        ? 'fail'
        : 'warning';

  return (
    <PlatformShell
      activeStudioId="sales"
      userLabel={session?.user.displayName ?? 'Host'}
      roleLabel={
        session !== null
          ? PLATFORM_ROLE_LABELS[primaryRole(session.user.roles)]
          : undefined
      }
      workspace={workspaceState}
      breadcrumb={breadcrumb}
      capabilityHost={capabilityHost}
      activeCapabilityId="customer-success"
      onLogout={logout}
      onOpenLanding={clearStudio}
      onSelectStudio={selectStudio}
      onSubmitFeedback={(message) => {
        submitPlatformFeedback({
          message,
          email: session?.user.email ?? null,
          studioId: 'sales',
          companyId: session?.companyId ?? null,
        });
        recordPlatformActivity({
          label: 'Feedback',
          detail: message.slice(0, 80),
        });
      }}
    >
      <div
        style={{
          display: 'flex',
          minHeight: 0,
          flex: 1,
          overflow: 'hidden',
        }}
      >
        <main
          style={{
            minHeight: 0,
            minWidth: 0,
            flex: 1,
            overflowY: 'auto',
            padding: '28px 32px',
          }}
        >
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <header style={{ marginBottom: 24 }}>
              <h1 className="platform-type-h1">Sales Studio</h1>
              <p className="platform-type-helper" style={{ marginTop: 4 }}>
                Customer Success · stejný projekt a Workspace jako Builder /
                Manager.
              </p>
            </header>

            <PlatformCard
              title="Customer Success"
              description="Produktový modul — health, adoption a doporučení."
              action={
                <PlatformStatusBadge tone={healthTone}>
                  {success?.health ?? '—'}
                </PlatformStatusBadge>
              }
            >
              <p className="platform-type-h2">
                {success?.adoptionScore ?? 0}% adoption
              </p>
              <p className="platform-type-helper" style={{ marginTop: 12 }}>
                Onboarding {success?.onboardingCompleteCount ?? 0}/
                {success?.onboardingTotal ?? 0}.
              </p>
              {(success?.recommendations ?? []).length === 0 ? (
                <PlatformEmptyState
                  title="Žádná doporučení"
                  description="Customer Success zatím nemá další kroky pro tento projekt."
                />
              ) : (
                <ul
                  className="platform-type-body"
                  style={{ marginTop: 20, paddingLeft: 18 }}
                >
                  {(success?.recommendations ?? []).map((item) => (
                    <li key={item.id}>
                      <a href={item.href}>{item.title}</a>
                    </li>
                  ))}
                </ul>
              )}
            </PlatformCard>
          </div>
        </main>
        <div
          style={{
            width: 340,
            flexShrink: 0,
            height: '100%',
            overflow: 'hidden',
          }}
        >
          <CapabilityInspector model={inspectorModel} />
        </div>
      </div>
    </PlatformShell>
  );
}
