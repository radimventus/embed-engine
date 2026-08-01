import { useMemo } from 'react';

import { buildCommercialPlatformReport } from '@embed-engine/commercial-platform';
import { usePlatformSession } from '@embed-engine/platform-access';

import { OperationsSurface } from '../operations/OperationsSurface';
import { COMMERCIAL_SECTION_IDS } from './commercialVocabulary';

/**
 * EPIC-BX-21 — Manager projection of Commercial Platform capability.
 * No billing — subscription / entitlement / upgrade projections only.
 */
export function CommercialPlatformCanvas() {
  const { session } = usePlatformSession();
  const report = useMemo(
    () => buildCommercialPlatformReport(session),
    [session],
  );

  return (
    <div
      className="w-full max-w-5xl"
      data-studio-shell="commercial-platform-canvas"
      data-capability="commercial-platform"
    >
      <OperationsSurface
        id={COMMERCIAL_SECTION_IDS.executive}
        title="Executive Commercial View"
        description="Commercial Readiness · Adoption · Capability Usage · Growth Opportunities."
      >
        <p className="text-2xl font-semibold text-embed-foreground-primary">
          {report.executive.commercialReadiness}
        </p>
        <p className="mt-2 text-sm text-embed-foreground-primary/70">
          Adoption · {report.executive.adoption}
        </p>
        <p className="mt-1 text-sm text-embed-foreground-primary/70">
          Capability usage · {report.executive.capabilityUsage}
        </p>
        <ul className="mt-4 space-y-2">
          {report.executive.growthOpportunities.map((item) => (
            <li
              key={item}
              className="text-sm text-embed-foreground-primary/75"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/50">
          Constraints
        </p>
        <ul className="mt-2 space-y-1">
          {report.executive.constraints.map((item) => (
            <li
              key={item}
              className="text-sm text-embed-foreground-primary/60"
            >
              {item}
            </li>
          ))}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={COMMERCIAL_SECTION_IDS.dashboard}
        title="Commercial Dashboard"
        description="Aktivní firmy · trial · plány · využití capability · doporučené upgrady."
      >
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-embed-foreground-primary/50">
              Active Companies
            </dt>
            <dd className="text-lg font-semibold">
              {report.dashboard.activeCompanies}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-embed-foreground-primary/50">Trial</dt>
            <dd className="text-lg font-semibold">
              {report.dashboard.trialCompanies}
            </dd>
          </div>
          {(
            ['Trial', 'Starter', 'Growth', 'Scale'] as const
          ).map((plan) => (
            <div key={plan}>
              <dt className="text-xs text-embed-foreground-primary/50">
                Plan · {plan}
              </dt>
              <dd className="text-lg font-semibold">
                {report.dashboard.planCounts[plan]}
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/50">
          Capability usage
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {report.dashboard.capabilityUsage.slice(0, 8).map((item) => (
            <li key={item.capabilityId}>
              {item.capabilityId} · {item.companiesUsing} firm(s)
            </li>
          ))}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={COMMERCIAL_SECTION_IDS.licenses}
        title="License Projection"
        description="Company · Workspace · Plan · Enabled Capabilities — stejný Company model."
      >
        <ul className="space-y-3">
          {report.licenses.map((license) => (
            <li
              key={license.companyId}
              className="border-b border-embed-border-default pb-3"
            >
              <p className="text-sm font-medium text-embed-foreground-primary">
                {license.companyName} · {license.edition} · {license.plan}
              </p>
              <p className="mt-1 text-xs text-embed-foreground-primary/60">
                {license.workspaceName} ·{' '}
                {license.enabledCapabilities.join(', ') || '—'}
              </p>
            </li>
          ))}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={COMMERCIAL_SECTION_IDS.entitlements}
        title="Capability Entitlements"
        description="included · optional · experimental — Registry SSOT, Commercial pouze projektuje."
      >
        <ul className="space-y-2">
          {report.entitlements.map((row) => (
            <li
              key={row.capabilityId}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-embed-border-default pb-2 text-sm"
            >
              <span className="font-medium">{row.name}</span>
              <span className="text-xs uppercase tracking-wide text-embed-brand-navy">
                {row.entitlement}
              </span>
              <span className="w-full text-xs text-embed-foreground-primary/55">
                Growth availability ·{' '}
                {row.availableOnPlan ? 'yes' : 'upgrade required'}
              </span>
            </li>
          ))}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={COMMERCIAL_SECTION_IDS.upgrades}
        title="Upgrade Recommendations"
        description="Deterministická pravidla — bez obchodní AI a bez billing."
      >
        <ul className="space-y-3">
          {report.upgrades.map((item) => (
            <li
              key={item.id}
              className="rounded-sm border border-embed-border-default px-3 py-3"
            >
              <p className="text-sm font-medium">{item.title}</p>
              <p className="mt-1 text-xs text-embed-foreground-primary/60">
                {item.companyName} · {item.detail} → {item.suggestedPlan}
              </p>
            </li>
          ))}
          {report.upgrades.length === 0 && (
            <p className="text-sm text-embed-foreground-primary/60">
              Žádná upgrade doporučení.
            </p>
          )}
        </ul>
      </OperationsSurface>
    </div>
  );
}
