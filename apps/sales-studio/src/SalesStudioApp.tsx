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
  CapabilityInspector,
  PlatformShell,
  type PlatformBreadcrumbItem,
  type PlatformWorkspaceState,
} from '@embed-engine/platform-shell';

import { getSalesCapabilityHost } from './studio/salesStudioComposition';

/**
 * EPIC-BX-11..17 — Sales Studio: Pipeline + Customer Success capability.
 */
export function SalesStudioApp() {
  const { session, bootstrap, registry, logout, clearStudio, selectProject } =
    usePlatformSession();
  const capabilityHost = useMemo(() => getSalesCapabilityHost(), []);
  const inspectorModel = capabilityHost.inspectorModel('customer-success');
  const success = useMemo(
    () => analyzeCustomerSuccess({ session }),
    [session],
  );

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
    { id: 'studio', label: 'Sales' },
    { id: 'company', label: bootstrap?.company.name ?? 'Company' },
    { id: 'project', label: bootstrap?.project?.name ?? 'Projekt' },
    { id: 'section', label: 'Customer Success' },
  ];

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
      <div style={{ display: 'flex', minHeight: 0, flex: 1 }}>
        <main
          style={{
            flex: 1,
            padding: '48px 32px',
            maxWidth: 720,
          }}
        >
          <p
            style={{
              margin: 0,
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--platform-muted)',
            }}
          >
            Customer Success
          </p>
          <h1
            style={{
              margin: '12px 0 0',
              fontSize: 32,
              fontWeight: 700,
              letterSpacing: '-0.02em',
              color: 'var(--platform-ink)',
            }}
          >
            {success?.health ?? '—'} · {success?.adoptionScore ?? 0}%
          </h1>
          <p
            style={{
              margin: '16px 0 0',
              fontSize: 15,
              lineHeight: 1.55,
              color: 'var(--platform-muted)',
            }}
          >
            Stejná Customer Success capability jako Manager — žádný druhý model
            zákazníka. Onboarding{' '}
            {success?.onboardingCompleteCount ?? 0}/
            {success?.onboardingTotal ?? 0}.
          </p>
          <ul
            style={{
              margin: '24px 0 0',
              paddingLeft: 18,
              color: 'var(--platform-ink)',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {(success?.recommendations ?? []).map((item) => (
              <li key={item.id}>
                <a href={item.href}>{item.title}</a>
              </li>
            ))}
          </ul>
          <p
            style={{
              margin: '28px 0 0',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--platform-muted)',
            }}
          >
            Declared capabilities
          </p>
          <ul
            style={{
              margin: '8px 0 0',
              paddingLeft: 18,
              color: 'var(--platform-ink)',
              fontSize: 14,
              lineHeight: 1.6,
            }}
          >
            {capabilityHost.declaredIds.map((id) => (
              <li key={id}>{id}</li>
            ))}
          </ul>
        </main>
        <div style={{ width: 300, flexShrink: 0 }}>
          <CapabilityInspector model={inspectorModel} />
        </div>
      </div>
    </PlatformShell>
  );
}
