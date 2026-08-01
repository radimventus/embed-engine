import { useMemo } from 'react';

import { buildOperationsCenterReport } from '@embed-engine/operations-center';
import { usePlatformSession } from '@embed-engine/platform-access';

import { OperationsSurface } from '../operations/OperationsSurface';
import { PLATFORM_OPS_SECTION_IDS } from './platformOpsVocabulary';

function healthLabel(health: string): string {
  return health.toUpperCase();
}

/**
 * EPIC-BX-19 — Manager projection of Platform Operations Center capability.
 * Click-model grammar: Context → Narrative → Insight → Action (Projection Framework).
 */
export function OperationsCenterCanvas() {
  const { session } = usePlatformSession();
  const report = useMemo(
    () => buildOperationsCenterReport(session),
    [session],
  );

  return (
    <div
      className="w-full max-w-5xl"
      data-studio-shell="operations-center-canvas"
      data-capability="operations-center"
    >
      <OperationsSurface
        id={PLATFORM_OPS_SECTION_IDS.executive}
        title="Executive Operations View"
        description="Current Platform Status · Risks · Recommended Actions — provoz CONIS."
      >
        <p className="text-2xl font-semibold text-embed-foreground-primary">
          {report.executive.currentPlatformStatus}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/50">
              Current Risks
            </p>
            <ul className="mt-2 space-y-2">
              {report.executive.currentRisks.map((risk) => (
                <li
                  key={risk}
                  className="text-sm text-embed-foreground-primary/75"
                >
                  {risk}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-embed-foreground-primary/50">
              Recommended Actions
            </p>
            <ul className="mt-2 space-y-2">
              {report.executive.recommendedActions.map((action) => (
                <li
                  key={action}
                  className="text-sm text-embed-foreground-primary/75"
                >
                  {action}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </OperationsSurface>

      <OperationsSurface
        id={PLATFORM_OPS_SECTION_IDS.overview}
        title="Platform Overview"
        description="Health · Status · Last Activity napříč platformními oblastmi."
      >
        <ul className="space-y-3">
          {report.overview.map((area) => (
            <li
              key={area.id}
              className="grid gap-1 border-b border-embed-border-default pb-3 md:grid-cols-[140px_100px_1fr]"
            >
              <span className="text-sm font-medium text-embed-foreground-primary">
                {area.label}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-embed-brand-navy">
                {healthLabel(area.health)}
              </span>
              <span className="text-xs text-embed-foreground-primary/60">
                {area.status}
                <br />
                Last activity · {area.lastActivity}
              </span>
            </li>
          ))}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={PLATFORM_OPS_SECTION_IDS.timeline}
        title="Operations Timeline"
        description="Agregace existujících událostí — Publish, Login, Release, Runtime, Validation, Customer Success."
      >
        <ul className="space-y-3">
          {report.timeline.map((event) => (
            <li
              key={event.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-embed-border-default pb-2"
            >
              <span className="text-sm font-medium text-embed-foreground-primary">
                {event.label}
              </span>
              <span className="text-xs uppercase tracking-wide text-embed-brand-navy">
                {event.kind}
              </span>
              <span className="w-full text-xs text-embed-foreground-primary/55">
                {event.at ?? '—'} · {event.detail}
              </span>
            </li>
          ))}
          {report.timeline.length === 0 && (
            <p className="text-sm text-embed-foreground-primary/60">
              Zatím žádné agregované události.
            </p>
          )}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={PLATFORM_OPS_SECTION_IDS.alerts}
        title="Operational Alerts"
        description="Deterministická pravidla — bez AI."
      >
        <ul className="space-y-3">
          {report.alerts.map((alert) => (
            <li
              key={alert.id}
              className="rounded-sm border border-embed-border-default px-3 py-3"
            >
              <p className="text-sm font-medium text-embed-foreground-primary">
                {alert.title}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-embed-brand-navy">
                {alert.severity}
              </p>
              <p className="mt-1 text-xs text-embed-foreground-primary/60">
                {alert.detail}
              </p>
            </li>
          ))}
          {report.alerts.length === 0 && (
            <p className="text-sm text-embed-foreground-primary/60">
              Žádné aktivní alerty.
            </p>
          )}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={PLATFORM_OPS_SECTION_IDS.metrics}
        title="Platform Metrics"
        description="Agregované metriky z registry, publish a Customer Success."
      >
        <dl className="grid gap-3 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-embed-foreground-primary/50">
              Active Companies
            </dt>
            <dd className="text-lg font-semibold">
              {report.metrics.activeCompanies}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-embed-foreground-primary/50">
              Active Workspaces
            </dt>
            <dd className="text-lg font-semibold">
              {report.metrics.activeWorkspaces}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-embed-foreground-primary/50">
              Active Projects
            </dt>
            <dd className="text-lg font-semibold">
              {report.metrics.activeProjects}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-embed-foreground-primary/50">Releases</dt>
            <dd className="text-lg font-semibold">{report.metrics.releases}</dd>
          </div>
          <div>
            <dt className="text-xs text-embed-foreground-primary/50">
              Publish Success
            </dt>
            <dd className="text-sm font-medium">
              {report.metrics.publishSuccess}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-embed-foreground-primary/50">
              Runtime Health
            </dt>
            <dd className="text-sm font-medium uppercase">
              {report.metrics.runtimeHealth}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-embed-foreground-primary/50">Adoption</dt>
            <dd className="text-lg font-semibold">
              {report.metrics.adoptionPercent} %
            </dd>
          </div>
        </dl>
      </OperationsSurface>
    </div>
  );
}
