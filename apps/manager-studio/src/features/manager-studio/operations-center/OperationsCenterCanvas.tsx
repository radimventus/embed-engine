import { useMemo } from 'react';

import { buildOperationsCenterReport } from '@embed-engine/operations-center';
import { usePlatformSession } from '@embed-engine/platform-access';

import { OperationsSurface } from '../operations/OperationsSurface';
import { PLATFORM_OPS_SECTION_IDS } from './platformOpsVocabulary';

function healthLabel(health: string): string {
  return health.toUpperCase();
}

type OperationsCenterCanvasProps = {
  /** PR-026 — partner UI shows Metriky platformy only. */
  readonly partnerOnly?: boolean;
};

/**
 * EPIC-BX-19 — Manager projection of Platform Operations Center capability.
 * Click-model grammar: Context → Narrative → Insight → Action (Projection Framework).
 */
export function OperationsCenterCanvas({
  partnerOnly = false,
}: OperationsCenterCanvasProps) {
  const { session } = usePlatformSession();
  const report = useMemo(
    () => buildOperationsCenterReport(session),
    [session],
  );

  const metricsSurface = (
    <OperationsSurface
      id={PLATFORM_OPS_SECTION_IDS.metrics}
      title="Metriky platformy"
      description="Agregované metriky z registru, publikace a zákaznického úspěchu."
    >
      <dl className="grid gap-3 sm:grid-cols-2">
        <div>
          <dt className="text-xs text-[var(--platform-navy)]">
            Aktivní firmy
          </dt>
          <dd className="text-lg font-semibold">
            {report.metrics.activeCompanies}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--platform-navy)]">
            Aktivní workspaces
          </dt>
          <dd className="text-lg font-semibold">
            {report.metrics.activeWorkspaces}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--platform-navy)]">
            Aktivní projekty
          </dt>
          <dd className="text-lg font-semibold">
            {report.metrics.activeProjects}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--platform-navy)]">Releases</dt>
          <dd className="text-lg font-semibold">{report.metrics.releases}</dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--platform-navy)]">
            Úspěšnost publikace
          </dt>
          <dd className="text-sm font-medium">
            {report.metrics.publishSuccess}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--platform-navy)]">
            Zdraví provozního jádra
          </dt>
          <dd className="text-sm font-medium uppercase">
            {report.metrics.runtimeHealth}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-[var(--platform-navy)]">Adopce</dt>
          <dd className="text-lg font-semibold">
            {report.metrics.adoptionPercent} %
          </dd>
        </div>
      </dl>
    </OperationsSurface>
  );

  if (partnerOnly) {
    return (
      <div
        className="w-full max-w-5xl"
        data-studio-shell="operations-center-canvas"
        data-capability="operations-center"
      >
        {metricsSurface}
      </div>
    );
  }

  return (
    <div
      className="w-full max-w-5xl"
      data-studio-shell="operations-center-canvas"
      data-capability="operations-center"
    >
      <OperationsSurface
        id={PLATFORM_OPS_SECTION_IDS.executive}
        title="Manažerský provozní přehled"
        description="Stav platformy · rizika · doporučené akce — provoz CONIS."
      >
        <p className="text-2xl font-semibold text-[var(--platform-navy)]">
          {report.executive.currentPlatformStatus}
        </p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--platform-navy)]">
              Aktuální rizika
            </p>
            <ul className="mt-2 space-y-2">
              {report.executive.currentRisks.map((risk) => (
                <li
                  key={risk}
                  className="text-sm text-[var(--platform-navy)]"
                >
                  {risk}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[var(--platform-navy)]">
              Doporučené akce
            </p>
            <ul className="mt-2 space-y-2">
              {report.executive.recommendedActions.map((action) => (
                <li
                  key={action}
                  className="text-sm text-[var(--platform-navy)]"
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
        title="Přehled platformy"
        description="Zdraví · stav · poslední aktivita napříč oblastmi platformy."
      >
        <ul className="space-y-3">
          {report.overview.map((area) => (
            <li
              key={area.id}
              className="grid gap-1 border-b border-embed-border-default pb-3 md:grid-cols-[140px_100px_1fr]"
            >
              <span className="text-sm font-medium text-[var(--platform-navy)]">
                {area.label}
              </span>
              <span className="text-xs font-semibold uppercase tracking-wide text-embed-brand-navy">
                {healthLabel(area.health)}
              </span>
              <span className="text-xs text-[var(--platform-navy)]">
                {area.status}
                <br />
                Poslední aktivita · {area.lastActivity}
              </span>
            </li>
          ))}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={PLATFORM_OPS_SECTION_IDS.timeline}
        title="Provozní časová osa"
        description="Agregace existujících událostí — publikace, přihlášení, release, Runtime, validace, zákaznický úspěch."
      >
        <ul className="space-y-3">
          {report.timeline.map((event) => (
            <li
              key={event.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b border-embed-border-default pb-2"
            >
              <span className="text-sm font-medium text-[var(--platform-navy)]">
                {event.label}
              </span>
              <span className="text-xs uppercase tracking-wide text-embed-brand-navy">
                {event.kind}
              </span>
              <span className="w-full text-xs text-[var(--platform-navy)]">
                {event.at ?? '—'} · {event.detail}
              </span>
            </li>
          ))}
          {report.timeline.length === 0 && (
            <p className="text-sm text-[var(--platform-navy)]">
              Zatím žádné agregované události.
            </p>
          )}
        </ul>
      </OperationsSurface>

      <OperationsSurface
        id={PLATFORM_OPS_SECTION_IDS.alerts}
        title="Provozní upozornění"
        description="Deterministická pravidla — bez AI."
      >
        <ul className="space-y-3">
          {report.alerts.map((alert) => (
            <li
              key={alert.id}
              className="rounded-sm border border-embed-border-default px-3 py-3"
            >
              <p className="text-sm font-medium text-[var(--platform-navy)]">
                {alert.title}
              </p>
              <p className="mt-1 text-xs uppercase tracking-wide text-embed-brand-navy">
                {alert.severity}
              </p>
              <p className="mt-1 text-xs text-[var(--platform-navy)]">
                {alert.detail}
              </p>
            </li>
          ))}
          {report.alerts.length === 0 && (
            <p className="text-sm text-[var(--platform-navy)]">
              Žádné aktivní alerty.
            </p>
          )}
        </ul>
      </OperationsSurface>

      {metricsSurface}
    </div>
  );
}
