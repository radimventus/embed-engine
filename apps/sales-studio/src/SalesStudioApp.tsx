import { useMemo, type CSSProperties, type ReactNode } from 'react';

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

const layoutRow: CSSProperties = {
  display: 'flex',
  minHeight: 0,
  flex: 1,
  overflow: 'hidden',
};

const mainStyle: CSSProperties = {
  minHeight: 0,
  minWidth: 0,
  flex: 1,
  overflowY: 'auto',
  padding: '28px 32px',
};

const cardStyle: CSSProperties = {
  border: '1px solid rgba(0, 25, 48, 0.06)',
  borderRadius: 18,
  background: 'var(--platform-surface)',
  padding: 26,
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.02)',
};

function Card({ children }: { readonly children: ReactNode }) {
  return <section style={cardStyle}>{children}</section>;
}

/**
 * VR-FIX-01 — Sales Studio projection sharing Platform Shell grammar.
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
      <div style={layoutRow}>
        <main style={mainStyle}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <header style={{ marginBottom: 24 }}>
              <h1
                style={{
                  margin: 0,
                  fontSize: 30,
                  fontWeight: 600,
                  letterSpacing: '-0.5px',
                  color: 'var(--platform-ink)',
                }}
              >
                Sales Studio
              </h1>
              <p
                style={{
                  margin: '4px 0 0',
                  fontSize: 14,
                  color: 'var(--platform-muted)',
                }}
              >
                Customer Success projection — stejná platformní capability.
              </p>
            </header>

            <Card>
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  color: '#7D8796',
                }}
              >
                Customer Success
              </p>
              <h2
                style={{
                  margin: '8px 0 0',
                  fontSize: 22,
                  fontWeight: 600,
                  color: 'var(--platform-ink)',
                }}
              >
                {success?.health ?? '—'} · {success?.adoptionScore ?? 0}%
              </h2>
              <p
                style={{
                  margin: '12px 0 0',
                  fontSize: 13,
                  lineHeight: 1.55,
                  color: 'var(--platform-muted)',
                }}
              >
                Onboarding {success?.onboardingCompleteCount ?? 0}/
                {success?.onboardingTotal ?? 0}.
              </p>
              <ul
                style={{
                  margin: '20px 0 0',
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
            </Card>
          </div>
        </main>
        <div style={{ width: 340, flexShrink: 0, height: '100%', overflow: 'hidden' }}>
          <CapabilityInspector model={inspectorModel} />
        </div>
      </div>
    </PlatformShell>
  );
}
