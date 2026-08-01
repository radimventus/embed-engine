import {
  PlatformShell,
  type PlatformBreadcrumbItem,
  type PlatformWorkspaceState,
} from '@embed-engine/platform-shell';

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
 * EPIC-BX-11 — Sales Studio shell host (placeholder product surface).
 * Shares Platform Header with Builder and Manager.
 */
export function SalesStudioApp() {
  return (
    <PlatformShell
      activeStudioId="sales"
      userLabel="Radim"
      workspace={SALES_WORKSPACE}
      breadcrumb={SALES_BREADCRUMB}
    >
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
          Připraveno na platformní Shell
        </h1>
        <p
          style={{
            margin: '16px 0 0',
            fontSize: 15,
            lineHeight: 1.55,
            color: 'var(--platform-muted)',
          }}
        >
          Stejný CONIS Platform Header jako Builder a Manager. Produktová
          vrstva Sales přijde později — přepínání Studia už funguje přes
          lokální Vite port 4179.
        </p>
      </main>
    </PlatformShell>
  );
}
