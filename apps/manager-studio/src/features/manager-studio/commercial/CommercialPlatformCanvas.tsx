import { useMemo } from 'react';

import { buildCommercialPlatformReport } from '@embed-engine/commercial-platform';
import { usePlatformSession } from '@embed-engine/platform-access';

import { OperationsSurface } from '../operations/OperationsSurface';
import { COMMERCIAL_SECTION_IDS } from './commercialVocabulary';

/**
 * EPIC-BX-22 — Manager projection of Commercial Platform capability.
 * No billing — edition / entitlement / subscription / upgrade projections only.
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
        title="Manažerský obchodní přehled"
        description="Připravenost výnosů · adopce · obchodní rizika · příležitosti růstu · omezení."
      >
        <p className="text-2xl font-semibold text-embed-foreground-primary">
          {report.executive.revenueReadiness}
        </p>
        <p className="mt-2 text-sm text-embed-foreground-primary/70">
          Adopce · {report.executive.adoption}
        </p>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/50">
          Obchodní rizika
        </p>
        <ul className="mt-2 space-y-1">
          {report.executive.commercialRisks.map((item) => (
            <li
              key={item}
              className="text-sm text-embed-foreground-primary/75"
            >
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/50">
          Příležitosti růstu
        </p>
        <ul className="mt-2 space-y-1">
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
          Omezení
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
        title="Obchodní přehled"
        description="Firmy · plány · trial · využití oprávnění · příležitosti navýšení."
      >
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-embed-foreground-primary/50">
              Firmy
            </dt>
            <dd className="text-lg font-semibold">
              {report.dashboard.activeFirmy}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-embed-foreground-primary/50">Trial</dt>
            <dd className="text-lg font-semibold">
              {report.dashboard.trialFirmy}
            </dd>
          </div>
          {(['Trial', 'Starter', 'Growth', 'Scale'] as const).map((plan) => (
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
          Firmy
        </p>
        <ul className="mt-2 space-y-2 text-sm">
          {report.dashboard.companies.map((company) => (
            <li
              key={company.companyId}
              className="border-b border-embed-border-default pb-2"
            >
              <span className="font-medium">{company.companyName}</span>
              <span className="mt-0.5 block text-xs text-embed-foreground-primary/55">
                {company.edition} · {company.plan} · trial {company.trialStatus}{' '}
                · renewal {company.renewalState}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/50">
          Využití oprávnění
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {report.dashboard.capabilityUsage.slice(0, 8).map((item) => (
            <li key={item.capabilityId}>
              {item.capabilityId} · {item.companiesUsing} firem
            </li>
          ))}
        </ul>

        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/50">
          Příležitosti navýšení
        </p>
        <ul className="mt-2 space-y-1 text-sm">
          {report.dashboard.upgradeOpportunities.map((item) => (
            <li key={item.id}>
              {item.companyName} · {item.title}
            </li>
          ))}
          {report.dashboard.upgradeOpportunities.length === 0 && (
            <li className="text-embed-foreground-primary/60">
              Žádné příležitosti navýšení.
            </li>
          )}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={COMMERCIAL_SECTION_IDS.licenses}
        title="Předplatné firmy"
        description="Edice · aktivní oprávnění · trial · stav obnovení — stejný model firmy."
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
                Trial · {license.trialStatus} · Renewal ·{' '}
                {license.renewalState}
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
        title="Oprávnění schopností"
        description="included · optional · experimental · hidden — registr je SSOT, obchod pouze projektuje."
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
                Dostupnost Growth ·{' '}
                {row.entitlement === 'hidden'
                  ? 'nikdy (skryté)'
                  : row.availableOnPlan
                    ? 'ano'
                    : 'vyžaduje navýšení'}
              </span>
            </li>
          ))}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={COMMERCIAL_SECTION_IDS.upgrades}
        title="Návrhy navýšení"
        description="Deterministická pravidla — vysoké využití Builderu · CS aktivní · bez billing AI."
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
