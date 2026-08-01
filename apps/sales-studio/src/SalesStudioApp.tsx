import { useMemo } from 'react';

import {
  CapabilityInspector,
  PlatformShell,
  type PlatformBreadcrumbItem,
  type PlatformWorkspaceState,
} from '@embed-engine/platform-shell';

import { getSalesCapabilityHost } from './studio/salesStudioComposition';

const SALES_WORKSPACE: PlatformWorkspaceState = {
  companyLabel: 'AC Modular',
  projectLabel: 'Harmony 124',
  projects: [
    {
      id: 'harmony-124',
      label: 'Harmony 124',
      companyLabel: 'AC Modular',
    },
    {
      id: 'family-98',
      label: 'Family 98',
      companyLabel: 'AC Modular',
    },
  ],
};

const SALES_BREADCRUMB: readonly PlatformBreadcrumbItem[] = [
  { id: 'conis', label: 'CONIS' },
  { id: 'studio', label: 'Sales' },
  { id: 'company', label: 'AC Modular' },
  { id: 'project', label: 'Harmony 124' },
  { id: 'section', label: 'Pipeline' },
];

/**
 * EPIC-BX-11 / BX-13 — Sales Studio shell host as capability composition.
 */
export function SalesStudioApp() {
  const capabilityHost = useMemo(() => getSalesCapabilityHost(), []);
  const inspectorModel = capabilityHost.inspectorModel('pipeline');

  return (
    <PlatformShell
      activeStudioId="sales"
      userLabel="Radim"
      workspace={SALES_WORKSPACE}
      breadcrumb={SALES_BREADCRUMB}
      capabilityHost={capabilityHost}
      activeCapabilityId="pipeline"
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
            Sales skládá capability z registru (Pipeline, Intelligence,
            Experience). Produktová vrstva přijde později — orchestrace už běží
            přes Platform Shell Capability Host.
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
