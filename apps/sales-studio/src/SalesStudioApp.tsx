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

import { getSalesCapabilityHost } from './studio/salesStudioComposition';

/**
 * EPIC-BX-11 / BX-13 / BX-14 — Sales Studio as access + capability composition.
 */
export function SalesStudioApp() {
  const { session, bootstrap, registry, logout, clearStudio, selectProject } =
    usePlatformSession();
  const capabilityHost = useMemo(() => getSalesCapabilityHost(), []);
  const inspectorModel = capabilityHost.inspectorModel('pipeline');

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
    { id: 'section', label: 'Pipeline' },
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
      activeCapabilityId="pipeline"
      onLogout={logout}
      onOpenLanding={clearStudio}
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
            Sales Studio
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
            Capability composition
          </h1>
          <p
            style={{
              margin: '16px 0 0',
              fontSize: 15,
              lineHeight: 1.55,
              color: 'var(--platform-muted)',
            }}
          >
            Stejný Session Provider jako Builder a Manager. Kontext firmy /
            workspace / projektu se zachová při přechodu mezi Studii.
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
